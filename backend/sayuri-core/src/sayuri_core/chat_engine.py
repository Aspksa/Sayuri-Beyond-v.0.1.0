from __future__ import annotations

import json
from typing import Any

from .cognitive import CognitiveCore
from .memory_retrieval import MemoryRetriever
from .runtime import LLMRuntimeBridge
from .schemas import ChatRequest, CognitivePrepareRequest, CognitiveVerifyRequest
from .screen_context import ScreenContextRegistry
from .skills import SkillRegistry
from .storage import SQLiteStore


class SayuriChatEngine:
    """Connects UI context, memory, cognitive control and the LLM runtime."""

    def __init__(
        self,
        store: SQLiteStore,
        cognitive: CognitiveCore,
        runtime: LLMRuntimeBridge,
        memory: MemoryRetriever,
        screens: ScreenContextRegistry,
        skills: SkillRegistry,
    ) -> None:
        self.store = store
        self.cognitive = cognitive
        self.runtime = runtime
        self.memory = memory
        self.screens = screens
        self.skills = skills

    @staticmethod
    def _estimate_complexity(message: str) -> float:
        clean = message.casefold()
        score = 0.20
        if len(message) > 350:
            score += 0.15
        if len(message) > 1_000:
            score += 0.15

        deliberate_markers = (
            "анализ",
            "сравн",
            "проверь",
            "ошиб",
            "архитект",
            "почему",
            "противореч",
            "план",
            "исслед",
            "analy",
            "compare",
            "verify",
            "error",
            "architect",
            "research",
        )
        if any(marker in clean for marker in deliberate_markers):
            score += 0.25
        if message.count("?") > 1:
            score += 0.10
        return round(min(score, 1.0), 3)

    @staticmethod
    def _screen_block(screen: dict[str, Any] | None, extra: dict[str, Any]) -> str:
        payload = {
            "screen": screen or {},
            "request_context": extra,
        }
        text = json.dumps(payload, ensure_ascii=False, indent=2)
        return text[:4_000]

    @staticmethod
    def _operational_confidence(
        runtime_result: dict[str, Any],
        contradiction_count: int,
    ) -> float:
        if contradiction_count:
            return 0.55
        if runtime_result.get("provider") == "mock":
            return 0.90
        return 0.78

    def _messages(
        self,
        request: ChatRequest,
        screen: dict[str, Any] | None,
        memory: dict[str, Any],
        plan: list[dict[str, Any]],
    ) -> list[dict[str, str]]:
        operational_steps = [step.get("action", "") for step in plan]
        system = (
            "You are Sayuri, the personal AI assistant inside SAYURI BEYOND. "
            "Answer the user directly and naturally. Separate verified facts from "
            "inference and say when evidence is insufficient. Never claim a tool "
            "was used unless the supplied operational context says it was used. "
            "Do not reveal hidden chain-of-thought or private reasoning. You may "
            "briefly describe observable operations such as memory retrieval, "
            "verification, or tool status.\n\n"
            "CURRENT SCREEN CONTEXT:\n"
            f"{self._screen_block(screen, request.context)}\n\n"
            "RETRIEVED SAYURI MEMORY:\n"
            f"{memory.get('context_text') or 'No relevant verified memory found.'}\n\n"
            "OPERATIONAL PLAN (public actions only):\n"
            f"{json.dumps(operational_steps, ensure_ascii=False)}"
        )

        messages: list[dict[str, str]] = [{"role": "system", "content": system}]
        for turn in request.history[-12:]:
            messages.append({"role": turn.role, "content": turn.content})
        messages.append({"role": "user", "content": request.message})
        return messages

    def respond(self, request: ChatRequest) -> dict[str, Any]:
        screen = self.screens.snapshot(request.session_id)
        memory = self.memory.retrieve(request.message)

        prepare = self.cognitive.prepare(
            CognitivePrepareRequest(
                task_type=request.task_type,
                goal=request.message,
                complexity=self._estimate_complexity(request.message),
                confidence=0.80,
                contradiction_count=len(memory["contradictions"]),
                tool_required=False,
                memory_required=True,
                risk="low",
                context={
                    "session_id": request.session_id,
                    "screen": screen or {},
                    **request.context,
                },
            )
        )
        task_id = prepare["task_id"]
        self.cognitive.mark_acting(task_id)

        try:
            runtime_result = self.runtime.generate(
                self._messages(
                    request=request,
                    screen=screen,
                    memory=memory,
                    plan=prepare["plan"],
                )
            )
        except Exception as exc:
            self.cognitive.state.transition(task_id, "error")
            self.cognitive.events.publish(
                "runtime_failed",
                task_id,
                {"error_type": type(exc).__name__},
            )
            self.store.add_event(
                "runtime_call",
                {
                    "task_id": task_id,
                    "provider": self.runtime.status().get("provider"),
                    "model": self.runtime.status().get("model"),
                    "success": False,
                },
            )
            raise

        self.store.add_event(
            "runtime_call",
            {
                "task_id": task_id,
                "provider": runtime_result["provider"],
                "model": runtime_result["model"],
                "elapsed_ms": runtime_result["elapsed_ms"],
                "answer_chars": len(runtime_result["content"]),
                "success": True,
            },
        )

        evidence = [
            str(item.get("source"))
            for item in memory["references"]
            if item.get("source")
        ]
        verification = self.cognitive.verify(
            CognitiveVerifyRequest(
                task_id=task_id,
                evidence=evidence,
                unresolved_contradictions=len(memory["contradictions"]),
                tool_failures=0,
                confidence=self._operational_confidence(
                    runtime_result,
                    len(memory["contradictions"]),
                ),
                critical_claims_checked=len(memory["contradictions"]) == 0,
                safety_passed=True,
            )
        )

        self.cognitive.finalize(
            task_id,
            learning_event_id=None,
            clear_working_memory=True,
        )

        route = screen.get("route") if screen else None
        self.store.add_event(
            "chat_turn",
            {
                "task_id": task_id,
                "session_id": request.session_id,
                "route": route,
                "provider": runtime_result["provider"],
                "model": runtime_result["model"],
                "verification_passed": verification["verification"]["passed"],
                "memory_references": len(memory["references"]),
                "user_chars": len(request.message),
                "assistant_chars": len(runtime_result["content"]),
            },
        )

        return {
            "task_id": task_id,
            "answer": runtime_result["content"],
            "runtime": {
                "provider": runtime_result["provider"],
                "model": runtime_result["model"],
                "elapsed_ms": runtime_result["elapsed_ms"],
            },
            "cognitive": {
                "mode": prepare["governor"]["mode"],
                "verification_required": prepare["governor"]["verification_required"],
                "plan": prepare["plan"],
            },
            "verification": {
                **verification["verification"],
                "scope": (
                    "Operational integrity gate. It checks runtime/tool/contradiction "
                    "conditions and is not a guarantee that every external factual "
                    "claim is true."
                ),
            },
            "screen_context": screen,
            "memory": {
                "counts": memory["counts"],
                "references": memory["references"],
            },
            "skills": {
                "available": len(self.skills.list()["skills"]),
                "mcp_execution_enabled": self.skills.list()["mcp"]["execution_enabled"],
            },
        }

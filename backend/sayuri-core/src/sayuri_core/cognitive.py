from __future__ import annotations

import threading
import uuid
from collections import defaultdict
from collections.abc import Callable
from typing import Any

from .schemas import CognitivePrepareRequest, CognitiveVerifyRequest
from .storage import SQLiteStore, utc_now

CognitiveHandler = Callable[[dict[str, Any]], None]


class CognitiveEventBus:
    """Small persisted event bus for observable cognitive operations."""

    def __init__(self, store: SQLiteStore) -> None:
        self.store = store
        self._lock = threading.RLock()
        self._subscribers: dict[str, list[CognitiveHandler]] = defaultdict(list)

    def subscribe(self, event_name: str, handler: CognitiveHandler) -> None:
        with self._lock:
            self._subscribers[event_name].append(handler)

    def publish(
        self,
        event_name: str,
        task_id: str,
        payload: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        record = self.store.add_event(
            "cognitive_event",
            {
                "event": event_name,
                "task_id": task_id,
                "payload": payload or {},
            },
        )
        with self._lock:
            handlers = [
                *self._subscribers.get(event_name, []),
                *self._subscribers.get("*", []),
            ]
        for handler in handlers:
            try:
                handler(record)
            except Exception as exc:  # pragma: no cover - observer boundary
                self.store.add_event(
                    "cognitive_observer_error",
                    {
                        "event": event_name,
                        "task_id": task_id,
                        "error": f"{type(exc).__name__}: {exc}",
                    },
                )
        return record


class AgentState:
    """Thread-safe per-task state registry for the cognitive loop."""

    valid_states = {
        "idle",
        "planning",
        "thinking",
        "acting",
        "verifying",
        "learning",
        "ready",
        "blocked",
        "error",
    }

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._tasks: dict[str, dict[str, Any]] = {}
        self._current_task_id: str | None = None

    def transition(self, task_id: str, state: str) -> dict[str, Any]:
        if state not in self.valid_states:
            raise ValueError(f"unsupported cognitive state: {state}")
        now = utc_now()
        with self._lock:
            previous = self._tasks.get(task_id, {}).get("state", "idle")
            snapshot = {
                "task_id": task_id,
                "state": state,
                "previous_state": previous,
                "updated_at": now,
            }
            self._tasks[task_id] = snapshot
            self._current_task_id = task_id
            return dict(snapshot)

    def snapshot(self, task_id: str | None = None) -> dict[str, Any]:
        with self._lock:
            resolved = task_id or self._current_task_id
            if resolved is None:
                return {
                    "task_id": None,
                    "state": "idle",
                    "previous_state": None,
                    "updated_at": None,
                }
            return dict(
                self._tasks.get(
                    resolved,
                    {
                        "task_id": resolved,
                        "state": "idle",
                        "previous_state": None,
                        "updated_at": None,
                    },
                )
            )


class WorkingMemory:
    """Bounded short-term memory. It is intentionally not persisted across restarts."""

    def __init__(self, max_items_per_task: int = 64, max_tasks: int = 128) -> None:
        self.max_items_per_task = max_items_per_task
        self.max_tasks = max_tasks
        self._lock = threading.RLock()
        self._items: dict[str, dict[str, dict[str, Any]]] = {}
        self._task_updated: dict[str, str] = {}

    def put(
        self,
        task_id: str,
        key: str,
        value: Any,
        importance: float = 0.5,
    ) -> dict[str, Any]:
        item = {
            "key": key,
            "value": value,
            "importance": round(max(0.0, min(float(importance), 1.0)), 4),
            "updated_at": utc_now(),
        }
        with self._lock:
            task_items = self._items.setdefault(task_id, {})
            task_items[key] = item
            self._task_updated[task_id] = item["updated_at"]
            if len(task_items) > self.max_items_per_task:
                removable = sorted(
                    task_items.values(),
                    key=lambda entry: (entry["importance"], entry["updated_at"]),
                )
                for old in removable[: len(task_items) - self.max_items_per_task]:
                    task_items.pop(old["key"], None)
            self._evict_tasks()
        return dict(item)

    def _evict_tasks(self) -> None:
        if len(self._items) <= self.max_tasks:
            return
        ordered = sorted(self._task_updated.items(), key=lambda item: item[1])
        for task_id, _ in ordered[: len(self._items) - self.max_tasks]:
            self._items.pop(task_id, None)
            self._task_updated.pop(task_id, None)

    def snapshot(self, task_id: str) -> list[dict[str, Any]]:
        with self._lock:
            items = list(self._items.get(task_id, {}).values())
        return sorted(items, key=lambda item: (-item["importance"], item["key"]))

    def clear(self, task_id: str) -> None:
        with self._lock:
            self._items.pop(task_id, None)
            self._task_updated.pop(task_id, None)

    def stats(self) -> dict[str, int]:
        with self._lock:
            return {
                "active_tasks": len(self._items),
                "items": sum(len(items) for items in self._items.values()),
            }


class CognitiveGovernor:
    """Selects reasoning depth and mandatory verification from measurable signals."""

    def decide(self, request: CognitivePrepareRequest) -> dict[str, Any]:
        reasons: list[str] = []
        if request.risk == "high":
            mode = "guarded"
            reasons.append("high-risk task")
        elif request.contradiction_count > 0 or request.confidence < 0.55:
            mode = "tree"
            if request.contradiction_count > 0:
                reasons.append("unresolved contradictions")
            if request.confidence < 0.55:
                reasons.append("low initial confidence")
        elif request.complexity >= 0.75 or request.prior_failures >= 2:
            mode = "deliberate_chain"
            if request.complexity >= 0.75:
                reasons.append("high task complexity")
            if request.prior_failures >= 2:
                reasons.append("repeated prior failures")
        elif request.tool_required or request.complexity >= 0.45:
            mode = "deliberate_chain"
            reasons.append(
                "tool execution required"
                if request.tool_required
                else "moderate task complexity"
            )
        else:
            mode = "fast_chain"
            reasons.append("low-complexity task with sufficient confidence")

        verification_required = any(
            (
                request.risk != "low",
                request.tool_required,
                request.contradiction_count > 0,
                request.confidence < 0.80,
                request.complexity >= 0.65,
            )
        )
        return {
            "mode": mode,
            "verification_required": verification_required,
            "max_alternatives": 3 if mode in {"tree", "guarded"} else 1,
            "human_confirmation_required": request.risk == "high",
            "reasons": reasons,
        }


class Planner:
    """Builds a transparent operation plan without exposing private reasoning."""

    def build(
        self,
        request: CognitivePrepareRequest,
        governor: dict[str, Any],
    ) -> list[dict[str, Any]]:
        steps: list[dict[str, Any]] = [
            {
                "id": "context",
                "action": "build_context",
                "purpose": "Normalize task goal and current UI/project context.",
            }
        ]
        if request.memory_required:
            steps.append(
                {
                    "id": "memory",
                    "action": "retrieve_memory",
                    "purpose": "Load relevant verified facts and prior experience.",
                }
            )
        if request.contradiction_count:
            steps.append(
                {
                    "id": "contradictions",
                    "action": "resolve_contradictions",
                    "purpose": "Compare conflicting evidence before choosing a conclusion.",
                }
            )
        if governor["mode"] in {"tree", "guarded"}:
            steps.append(
                {
                    "id": "alternatives",
                    "action": "compare_alternatives",
                    "purpose": (
                        f"Evaluate up to {governor['max_alternatives']} candidate approaches."
                    ),
                }
            )
        else:
            steps.append(
                {
                    "id": "reasoning",
                    "action": "reason",
                    "purpose": f"Use {governor['mode']} for the task.",
                }
            )
        if request.tool_required:
            steps.extend(
                [
                    {
                        "id": "tools",
                        "action": "select_and_execute_tools",
                        "purpose": "Use only tools required by the task and current permissions.",
                    },
                    {
                        "id": "tool-check",
                        "action": "validate_tool_outputs",
                        "purpose": "Check tool success and reject incomplete or failed outputs.",
                    },
                ]
            )
        if governor["verification_required"]:
            steps.append(
                {
                    "id": "verify",
                    "action": "verify_result",
                    "purpose": "Check evidence, contradictions, safety and confidence.",
                }
            )
        steps.append(
            {
                "id": "compose",
                "action": "compose_result",
                "purpose": "Produce the user-facing result from verified operations.",
            }
        )
        return steps


class Verifier:
    """Deterministic post-flight quality gate."""

    acceptance_confidence = 0.60
    warning_confidence = 0.75

    def verify(self, request: CognitiveVerifyRequest) -> dict[str, Any]:
        blockers: list[str] = []
        warnings: list[str] = []

        if not request.safety_passed:
            blockers.append("safety gate failed")
        if request.unresolved_contradictions > 0:
            blockers.append(
                f"{request.unresolved_contradictions} unresolved contradiction(s)"
            )
        if request.tool_failures > 0:
            blockers.append(f"{request.tool_failures} tool failure(s)")
        if not request.critical_claims_checked:
            blockers.append("critical claims were not checked against evidence")
        if request.confidence < self.acceptance_confidence:
            blockers.append(
                f"confidence {request.confidence:.2f} is below "
                f"{self.acceptance_confidence:.2f}"
            )

        if not request.evidence:
            warnings.append("no evidence items were attached to verification")
        if (
            self.acceptance_confidence <= request.confidence < self.warning_confidence
        ):
            warnings.append("confidence is acceptable but below the preferred threshold")

        passed = not blockers
        return {
            "passed": passed,
            "decision": "accept" if passed else "revise",
            "confidence": request.confidence,
            "blockers": blockers,
            "warnings": warnings,
            "evidence_count": len(request.evidence),
            "policy": {
                "acceptance_confidence": self.acceptance_confidence,
                "preferred_confidence": self.warning_confidence,
                "requires_safety_pass": True,
                "requires_critical_claim_check": True,
                "blocks_on_tool_failure": True,
                "blocks_on_unresolved_contradiction": True,
            },
        }


class CognitiveCore:
    """Sayuri-owned coordinator for plan -> act -> verify -> learn."""

    def __init__(self, store: SQLiteStore) -> None:
        self.store = store
        self.events = CognitiveEventBus(store)
        self.state = AgentState()
        self.working_memory = WorkingMemory()
        self.governor = CognitiveGovernor()
        self.planner = Planner()
        self.verifier = Verifier()

    def prepare(self, request: CognitivePrepareRequest) -> dict[str, Any]:
        task_id = request.task_id or str(uuid.uuid4())
        self.state.transition(task_id, "planning")
        self.events.publish(
            "task_started",
            task_id,
            {
                "task_type": request.task_type,
                "goal": request.goal,
                "risk": request.risk,
            },
        )

        for key, value in request.context.items():
            self.working_memory.put(
                task_id,
                f"context:{key}",
                value,
                importance=0.7,
            )

        governor = self.governor.decide(request)
        self.working_memory.put(
            task_id,
            "governor",
            governor,
            importance=1.0,
        )
        plan = self.planner.build(request, governor)
        self.working_memory.put(
            task_id,
            "plan",
            plan,
            importance=0.95,
        )

        state = self.state.transition(task_id, "thinking")
        event = self.events.publish(
            "plan_ready",
            task_id,
            {
                "mode": governor["mode"],
                "verification_required": governor["verification_required"],
                "step_count": len(plan),
            },
        )
        return {
            "task_id": task_id,
            "state": state,
            "governor": governor,
            "plan": plan,
            "working_memory": self.working_memory.snapshot(task_id),
            "event_id": event["id"],
        }

    def mark_acting(self, task_id: str) -> dict[str, Any]:
        state = self.state.transition(task_id, "acting")
        self.events.publish("action_started", task_id, {})
        return state

    def verify(self, request: CognitiveVerifyRequest) -> dict[str, Any]:
        self.state.transition(request.task_id, "verifying")
        verification = self.verifier.verify(request)
        self.working_memory.put(
            request.task_id,
            "verification",
            verification,
            importance=1.0,
        )
        state = self.state.transition(
            request.task_id,
            "ready" if verification["passed"] else "blocked",
        )
        event = self.events.publish(
            "verification_completed",
            request.task_id,
            {
                "passed": verification["passed"],
                "decision": verification["decision"],
                "confidence": verification["confidence"],
                "blockers": verification["blockers"],
            },
        )
        return {
            "task_id": request.task_id,
            "state": state,
            "verification": verification,
            "event_id": event["id"],
        }

    def finalize(
        self,
        task_id: str,
        *,
        learning_event_id: str | None = None,
        clear_working_memory: bool = True,
    ) -> dict[str, Any]:
        self.state.transition(task_id, "learning")
        event = self.events.publish(
            "learning_completed",
            task_id,
            {"learning_event_id": learning_event_id},
        )
        if clear_working_memory:
            self.working_memory.clear(task_id)
        state = self.state.transition(task_id, "idle")
        self.events.publish("task_completed", task_id, {})
        return {
            "task_id": task_id,
            "state": state,
            "working_memory_cleared": clear_working_memory,
            "event_id": event["id"],
        }

    def status(self, task_id: str | None = None) -> dict[str, Any]:
        state = self.state.snapshot(task_id)
        resolved = state.get("task_id")
        recent = self.store.list_events("cognitive_event", limit=100)
        if resolved:
            recent = [event for event in recent if event.get("task_id") == resolved]
        return {
            "available": True,
            "state": state,
            "working_memory": (
                self.working_memory.snapshot(resolved) if resolved else []
            ),
            "working_memory_stats": self.working_memory.stats(),
            "recent_events": recent[:25],
            "components": [
                "event_bus",
                "agent_state",
                "working_memory",
                "cognitive_governor",
                "planner",
                "verifier",
                "experience_learning_bridge",
            ],
        }

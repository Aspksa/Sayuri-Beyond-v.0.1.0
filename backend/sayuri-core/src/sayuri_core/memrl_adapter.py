from __future__ import annotations

from importlib.metadata import PackageNotFoundError, version
from importlib.util import find_spec
from typing import Any

from .storage import SQLiteStore


class MemRLAdapter:
    """Safe bridge between Sayuri's learning loop and MemRL.

    In the lightweight core runtime the adapter operates in shadow mode and
    persists reward-labelled episodes. A configured MemRL MemoryService can be
    bound by the isolated evolution runtime later without changing Sayuri's
    learning API.
    """

    package_name = "memrl"
    source = "https://github.com/MemTensor/MemRL"
    pinned_revision = "c1b322ca43de36ddf64c6712f89d0095bfc35ce0"

    def __init__(self, store: SQLiteStore, enabled: bool = True) -> None:
        self.store = store
        self.enabled = enabled
        self._service: Any | None = None

    def bind_service(self, service: Any) -> None:
        if service is None:
            raise ValueError("MemRL service must not be None")
        if not hasattr(service, "update_values"):
            raise TypeError("MemRL service must expose update_values()")
        self._service = service

    def status(self) -> dict[str, Any]:
        if not self.enabled:
            return {
                "available": False,
                "disabled": True,
                "engine": "memrl",
                "mode": "disabled",
            }

        installed = find_spec(self.package_name) is not None
        installed_version: str | None = None
        if installed:
            try:
                installed_version = version(self.package_name)
            except PackageNotFoundError:
                installed_version = "unknown"

        configured = self._service is not None
        return {
            "available": installed,
            "configured": configured,
            "engine": "memrl",
            "version": installed_version,
            "mode": "active" if configured else "shadow",
            "pinned_revision": self.pinned_revision,
            "source": self.source,
            "runtime_learning": "episodic_reward",
            "weight_updates": False,
        }

    @staticmethod
    def reward(
        quality_score: float,
        passed: bool,
        confidence: float,
    ) -> float:
        quality = max(0.0, min(1.0, float(quality_score)))
        certainty = max(0.0, min(1.0, float(confidence)))
        value = (quality * 2.0) - 1.0
        value += 0.25 if passed else -0.25
        value += (certainty - 0.5) * 0.20
        return round(max(-1.0, min(1.0, value)), 6)

    def record_episode(
        self,
        *,
        task_type: str,
        strategy_key: str,
        quality_score: float,
        passed: bool,
        confidence: float,
        outcome: str,
        errors: list[str],
        lessons: list[str],
        evidence: list[str],
        retrieved_memory_ids: list[str] | None = None,
    ) -> dict[str, Any]:
        reward = self.reward(quality_score, passed, confidence)
        memory_ids = [item for item in (retrieved_memory_ids or []) if item]

        episode = self.store.add_event(
            "memrl_episode",
            {
                "task_type": task_type,
                "strategy_key": strategy_key,
                "quality_score": quality_score,
                "passed": passed,
                "confidence": confidence,
                "reward": reward,
                "outcome": outcome,
                "errors": errors[:20],
                "lessons": lessons[:20],
                "evidence": evidence[:50],
                "retrieved_memory_ids": memory_ids[:100],
            },
        )

        update_result: dict[str, Any] | None = None
        applied = False
        if self.enabled and self._service is not None and memory_ids:
            update_result = self._service.update_values(
                [float(reward)],
                [memory_ids],
            )
            applied = True

        return {
            "episode": episode,
            "reward": reward,
            "applied_to_memrl": applied,
            "update_result": update_result,
            "mode": "active" if applied else "shadow",
        }

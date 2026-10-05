from __future__ import annotations

from typing import Any

from .memrl_adapter import MemRLAdapter
from .schemas import LearningCycleRequest
from .storage import SQLiteStore


class EvolutionGate:
    """Govern experience before it can influence future strategy choices."""

    minimum_confidence = 0.75
    minimum_reward = 0.20

    def __init__(self, store: SQLiteStore, memrl: MemRLAdapter) -> None:
        self.store = store
        self.memrl = memrl

    def observe(
        self,
        request: LearningCycleRequest,
        evaluation: dict[str, Any],
        lessons: list[str],
    ) -> dict[str, Any]:
        memrl_result = self.memrl.record_episode(
            task_type=request.task_type,
            strategy_key=request.strategy_key,
            quality_score=float(evaluation["overall"]),
            passed=bool(evaluation["passed"]),
            confidence=request.confidence,
            outcome=request.outcome,
            errors=request.errors,
            lessons=lessons,
            evidence=request.evidence,
            retrieved_memory_ids=request.retrieved_memory_ids,
        )
        gates = {
            "task_passed": bool(evaluation["passed"]),
            "confidence": request.confidence >= self.minimum_confidence,
            "evidence_present": bool(request.evidence),
            "positive_reward": float(memrl_result["reward"]) >= self.minimum_reward,
        }
        decision = (
            "reinforce_existing_strategy"
            if all(gates.values())
            else "candidate_strategy_improvement"
        )
        record = self.store.add_event(
            "evolution_gate",
            {
                "task_type": request.task_type,
                "strategy_key": request.strategy_key,
                "decision": decision,
                "gates": gates,
                "reward": memrl_result["reward"],
                "self_modifying_code": False,
                "automatic_strategy_promotion": False,
            },
        )
        return {
            "decision": decision,
            "gates": gates,
            "gate_event": record,
            "memrl": memrl_result,
        }

from __future__ import annotations

from typing import Any

from .learning import Evaluator, StrategyLibrary
from .schemas import (
    EvolutionBenchmarkRequest,
    EvolutionProposalRequest,
    StrategyCandidateRequest,
)
from .storage import SQLiteStore


class TeacherV2:
    """Creates strategy variants from measured lessons without inventing scores."""

    lenses = [
        (
            "evidence-first",
            "Add explicit evidence checkpoints before accepting important conclusions.",
        ),
        (
            "memory-first",
            "Retrieve relevant prior experience and verified facts before planning.",
        ),
        (
            "contradiction-first",
            "Run a contradiction and consistency check before the final result.",
        ),
        (
            "efficiency-balanced",
            "Remove redundant steps while preserving verification and rollback points.",
        ),
    ]

    def propose(self, request: EvolutionProposalRequest) -> list[dict[str, Any]]:
        lesson_block = " ".join(item.strip() for item in request.lessons if item.strip())
        if not lesson_block:
            lesson_block = "No explicit lesson supplied; preserve current strengths and improve verification."

        variants = []
        for index, (name, instruction) in enumerate(self.lenses[: request.variants], start=1):
            variants.append(
                {
                    "name": f"{request.strategy_key}:{name}",
                    "variant": index,
                    "lens": name,
                    "description": (
                        f"Base strategy: {request.base_description.strip()}\n"
                        f"Improvement lens: {instruction}\n"
                        f"Lessons to incorporate: {lesson_block}"
                    ),
                    "source": "teacher_v2",
                    "score": None,
                    "status": "proposed",
                }
            )
        return variants


class StructuredBenchmarkSandbox:
    """Safe first-stage sandbox.

    It never executes generated source code. Candidates are compared from explicit,
    inspectable score vectors plus regression/safety gates. A code-execution sandbox
    can be added later behind a separate permission boundary.
    """

    def __init__(self) -> None:
        self.evaluator = Evaluator()

    def evaluate_candidate(self, candidate) -> dict[str, Any]:
        evaluation = self.evaluator.evaluate(candidate.scores)
        eligible = (
            candidate.regression_passed
            and candidate.safety_passed
            and candidate.confidence >= 0.75
        )
        return {
            "name": candidate.name,
            "description": candidate.description,
            "score": evaluation["overall"],
            "evaluation": evaluation,
            "confidence": candidate.confidence,
            "regression_passed": candidate.regression_passed,
            "safety_passed": candidate.safety_passed,
            "eligible": eligible,
        }


class EvolutionLab:
    minimum_gain = 0.01

    def __init__(self, store: SQLiteStore, strategies: StrategyLibrary) -> None:
        self.store = store
        self.strategies = strategies
        self.teacher = TeacherV2()
        self.sandbox = StructuredBenchmarkSandbox()

    def propose(self, request: EvolutionProposalRequest) -> dict[str, Any]:
        variants = self.teacher.propose(request)
        event = self.store.add_event(
            "evolution_proposal",
            {
                "strategy_key": request.strategy_key,
                "base_description": request.base_description,
                "lessons": request.lessons,
                "variants": variants,
            },
        )
        return {
            "experiment_id": event["id"],
            "strategy_key": request.strategy_key,
            "variants": variants,
            "execution_policy": {
                "generated_code_execution": False,
                "automatic_source_modification": False,
                "promotion_requires_benchmark": True,
            },
        }

    def benchmark(self, request: EvolutionBenchmarkRequest) -> dict[str, Any]:
        results = [
            self.sandbox.evaluate_candidate(candidate)
            for candidate in request.candidates
        ]
        results.sort(key=lambda item: item["score"], reverse=True)

        eligible = [
            item
            for item in results
            if item["eligible"]
            and item["score"] >= request.baseline_score + self.minimum_gain
        ]
        winner = eligible[0] if eligible else None
        promotion = None

        if winner is not None:
            existing = [
                item
                for item in self.store.list_strategies(limit=1000)
                if item.get("strategy_key") == request.strategy_key
            ]
            next_version = max(
                (int(item.get("version", 0)) for item in existing),
                default=0,
            ) + 1

            promotion = self.strategies.submit(
                StrategyCandidateRequest(
                    strategy_key=request.strategy_key,
                    version=next_version,
                    description=winner["description"],
                    score=winner["score"],
                    confidence=winner["confidence"],
                    regression_passed=winner["regression_passed"],
                    safety_passed=winner["safety_passed"],
                )
            )

        event = self.store.add_event(
            "evolution_benchmark",
            {
                "strategy_key": request.strategy_key,
                "baseline_score": request.baseline_score,
                "candidate_results": results,
                "winner": winner,
                "promotion": promotion,
                "sandbox": "structured_benchmark_v1",
            },
        )
        return {
            "experiment_id": event["id"],
            "baseline_score": request.baseline_score,
            "results": results,
            "winner": winner,
            "promotion": promotion,
            "policy": {
                "minimum_gain": self.minimum_gain,
                "requires_regression_pass": True,
                "requires_safety_pass": True,
                "minimum_confidence": 0.75,
                "generated_code_execution": False,
                "self_modifying_code": False,
            },
        }

    def recent_experiments(self, limit: int = 50) -> dict[str, Any]:
        return {
            "proposals": self.store.list_events("evolution_proposal", limit=limit),
            "benchmarks": self.store.list_events("evolution_benchmark", limit=limit),
        }

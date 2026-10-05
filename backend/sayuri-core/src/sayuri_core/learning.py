from __future__ import annotations

from statistics import fmean
from typing import Any

from .schemas import LearningCycleRequest, ScoreVector, StrategyCandidateRequest
from .storage import SQLiteStore


class Evaluator:
    weights = {
        "accuracy": 0.25,
        "reasoning": 0.20,
        "memory_use": 0.15,
        "tool_use": 0.10,
        "efficiency": 0.10,
        "consistency": 0.15,
        "user_acceptance": 0.05,
    }
    pass_threshold = 0.75
    weak_threshold = 0.70

    def evaluate(self, scores: ScoreVector) -> dict[str, Any]:
        values = scores.model_dump()
        weighted_sum = 0.0
        active_weight = 0.0
        for key, weight in self.weights.items():
            value = values[key]
            if value is None:
                continue
            weighted_sum += float(value) * weight
            active_weight += weight

        overall = weighted_sum / active_weight if active_weight else 0.0
        weak = [
            key
            for key, value in values.items()
            if value is not None and float(value) < self.weak_threshold
        ]
        return {
            "overall": round(overall, 6),
            "passed": overall >= self.pass_threshold,
            "weak_areas": weak,
            "scores": values,
            "formula": {
                "weights": self.weights,
                "pass_threshold": self.pass_threshold,
                "missing_dimensions": [
                    key for key, value in values.items() if value is None
                ],
            },
        }


class Teacher:
    lessons = {
        "accuracy": "Verify critical facts against source evidence before finalizing.",
        "reasoning": "Test the conclusion against at least one alternative explanation.",
        "memory_use": "Retrieve relevant prior facts and experience before solving the task.",
        "tool_use": "Choose tools by task requirements and verify tool outputs before use.",
        "efficiency": "Reduce redundant steps while preserving verification checkpoints.",
        "consistency": "Cross-check the final answer for internal contradictions.",
        "user_acceptance": "Incorporate explicit user corrections into the next attempt.",
    }

    def teach(
        self,
        evaluation: dict[str, Any],
        errors: list[str],
        observed_lessons: list[str],
    ) -> dict[str, Any]:
        generated = [
            self.lessons[area]
            for area in evaluation["weak_areas"]
            if area in self.lessons
        ]
        generated.extend(
            f"Prevent recurrence of error: {error[:500]}" for error in errors[:20]
        )
        merged: list[str] = []
        seen: set[str] = set()
        for item in [*observed_lessons, *generated]:
            clean = item.strip()
            if clean and clean not in seen:
                seen.add(clean)
                merged.append(clean)
        return {
            "lessons": merged,
            "lesson_count": len(merged),
            "source": "deterministic_teacher_v1",
        }


class LearningEngine:
    def __init__(self, store: SQLiteStore) -> None:
        self.store = store
        self.evaluator = Evaluator()
        self.teacher = Teacher()

    def complete_task(self, request: LearningCycleRequest) -> dict[str, Any]:
        evaluation = self.evaluator.evaluate(request.scores)
        evaluation_record = self.store.add_event(
            "evaluation",
            {
                "task_type": request.task_type,
                "strategy_key": request.strategy_key,
                **evaluation,
            },
        )

        lesson = self.teacher.teach(
            evaluation,
            request.errors,
            request.observed_lessons,
        )
        teacher_record = self.store.add_event(
            "teacher_lesson",
            {
                "task_type": request.task_type,
                "strategy_key": request.strategy_key,
                **lesson,
            },
        )

        if evaluation["passed"] and not evaluation["weak_areas"]:
            summary = "Task passed evaluation without measured weak dimensions."
        elif evaluation["passed"]:
            summary = "Task passed, but improvement is required in: " + ", ".join(
                evaluation["weak_areas"]
            )
        else:
            summary = "Task did not meet the quality threshold."

        reflection = self.store.add_event(
            "reflection",
            {
                "task_type": request.task_type,
                "strategy_key": request.strategy_key,
                "summary": summary,
                "weak_areas": evaluation["weak_areas"],
                "corrected_error_candidates": request.errors[:20],
                "next_actions": lesson["lessons"][:20],
                "quality_score": evaluation["overall"],
                "passed": evaluation["passed"],
            },
        )

        experience = self.store.add_event(
            "experience",
            {
                "task_type": request.task_type,
                "strategy_key": request.strategy_key,
                "outcome": request.outcome,
                "quality_score": evaluation["overall"],
                "passed": evaluation["passed"],
                "confidence": request.confidence,
                "errors": request.errors,
                "lessons": lesson["lessons"],
                "evidence": request.evidence,
            },
        )

        self.store.record_strategy_usage(
            request.strategy_key,
            success=bool(evaluation["passed"]),
        )

        return {
            "evaluation": evaluation_record,
            "teacher": teacher_record,
            "reflection": reflection,
            "experience": experience,
            "next_step": (
                "retain_strategy"
                if evaluation["passed"]
                else "candidate_strategy_improvement"
            ),
        }


class StrategyLibrary:
    minimum_confidence = 0.75
    minimum_gain = 0.01

    def __init__(self, store: SQLiteStore) -> None:
        self.store = store

    def submit(self, candidate: StrategyCandidateRequest) -> dict[str, Any]:
        active = self.store.active_strategy(candidate.strategy_key)
        gates = {
            "regression": candidate.regression_passed,
            "safety": candidate.safety_passed,
            "confidence": candidate.confidence >= self.minimum_confidence,
            "quality_gain": (
                active is None
                or candidate.score >= float(active["score"]) + self.minimum_gain
            ),
        }
        promoted = all(gates.values())
        record = self.store.add_strategy(
            {
                **candidate.model_dump(),
                "status": "active" if promoted else "rejected",
                "gate_results": gates,
                "previous_active_id": active["id"] if active else None,
            }
        )
        if promoted and active is not None:
            self.store.update_strategy_status(active["id"], "superseded")

        return {
            "strategy": record,
            "promoted": promoted,
            "previous_active": active,
            "policy": {
                "minimum_confidence": self.minimum_confidence,
                "minimum_gain": self.minimum_gain,
                "requires_regression_pass": True,
                "requires_safety_pass": True,
                "self_modifying_code": False,
            },
        }


class DevelopmentMetrics:
    def __init__(self, store: SQLiteStore) -> None:
        self.store = store

    def snapshot(self) -> dict[str, Any]:
        evaluations = self.store.list_events("evaluation", limit=1000)
        experiences = self.store.count_events("experience")
        reflections = self.store.count_events("reflection")
        facts = self.store.count_facts()
        confirmed_hypotheses = self.store.count_confirmed_hypotheses()
        strategies = self.store.list_strategies(limit=1000)
        active = [item for item in strategies if item.get("status") == "active"]

        quality = (
            fmean(float(item["overall"]) for item in evaluations)
            if evaluations
            else 0.0
        )
        pass_rate = (
            sum(1 for item in evaluations if item.get("passed")) / len(evaluations)
            if evaluations
            else 0.0
        )

        experience_progress = min(experiences / 100.0, 1.0)
        knowledge_progress = min(facts / 500.0, 1.0)
        strategy_progress = min(len(active) / 20.0, 1.0)
        learning_progress = min(reflections / 100.0, 1.0)

        index = 100 * (
            0.30 * quality
            + 0.20 * pass_rate
            + 0.20 * experience_progress
            + 0.15 * knowledge_progress
            + 0.10 * strategy_progress
            + 0.05 * learning_progress
        )

        corrected = sum(
            len(item.get("corrected_error_candidates", []))
            for item in self.store.list_events("reflection", limit=1000)
        )

        return {
            "development_index": round(index, 2),
            "interpretation": (
                "Operational learning progress based on local verified records; "
                "not a measure of general intelligence."
            ),
            "quality": round(quality * 100, 2),
            "pass_rate": round(pass_rate * 100, 2),
            "experience_events": experiences,
            "verified_facts": facts,
            "reflections": reflections,
            "active_strategies": len(active),
            "confirmed_hypotheses": confirmed_hypotheses,
            "corrected_error_candidates": corrected,
            "strategy_usage": self.store.strategy_usage(),
            "formula": {
                "quality": 0.30,
                "pass_rate": 0.20,
                "experience_progress": 0.20,
                "knowledge_progress": 0.15,
                "strategy_progress": 0.10,
                "learning_progress": 0.05,
            },
        }

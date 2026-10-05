from __future__ import annotations

from typing import Any

from .schemas import FactCreateRequest, HypothesisCreateRequest, HypothesisUpdateRequest
from .storage import SQLiteStore


class ConfidenceEngine:
    @staticmethod
    def describe(value: float) -> dict[str, float | str]:
        bounded = max(0.0, min(1.0, value))
        if bounded >= 0.90:
            label = "verified"
        elif bounded >= 0.75:
            label = "high"
        elif bounded >= 0.50:
            label = "hypothesis"
        else:
            label = "low"
        return {
            "confidence": bounded,
            "percent": round(bounded * 100, 2),
            "class": label,
        }


class KnowledgeStore:
    def __init__(self, store: SQLiteStore) -> None:
        self.store = store
        self.confidence = ConfidenceEngine()

    def add_fact(self, request: FactCreateRequest) -> dict[str, Any]:
        fact, contradictions = self.store.add_fact(**request.model_dump())
        return {
            "fact": {
                **fact,
                "confidence_meta": self.confidence.describe(request.confidence),
            },
            "contradictions": contradictions,
        }

    def contradictions(self) -> list[dict[str, Any]]:
        return self.store.list_contradictions()

    def add_hypothesis(self, request: HypothesisCreateRequest) -> dict[str, Any]:
        record = self.store.add_hypothesis(**request.model_dump())
        return {
            **record,
            "confidence_meta": self.confidence.describe(request.confidence),
        }

    def update_hypothesis(
        self,
        hypothesis_id: str,
        request: HypothesisUpdateRequest,
    ) -> dict[str, Any]:
        record = self.store.update_hypothesis(
            hypothesis_id,
            request.status,
            request.confidence,
        )
        return {
            **record,
            "confidence_meta": self.confidence.describe(float(record["confidence"])),
        }

    def hypotheses(self) -> list[dict[str, Any]]:
        return self.store.list_hypotheses()

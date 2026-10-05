from __future__ import annotations

import json
from typing import Any

from .storage import SQLiteStore


class MemoryRetriever:
    """Transparent first-stage retrieval over Sayuri-owned SQLite records."""

    def __init__(self, store: SQLiteStore) -> None:
        self.store = store

    @staticmethod
    def _tokens(query: str) -> set[str]:
        return {
            token.strip().casefold()
            for token in query.replace("\n", " ").split(" ")
            if len(token.strip()) >= 2
        }

    @staticmethod
    def _clip(value: Any, limit: int = 500) -> str:
        text = str(value).strip()
        return text if len(text) <= limit else text[: limit - 1] + "…"

    def retrieve(self, query: str, limit: int = 8) -> dict[str, Any]:
        facts = self.store.search_facts(query, limit=limit)
        experiences = self.store.search_events("experience", query, limit=max(2, limit // 2))

        tokens = self._tokens(query)
        strategies = []
        for strategy in self.store.list_strategies(limit=300):
            if strategy.get("status") != "active":
                continue
            haystack = json.dumps(strategy, ensure_ascii=False).casefold()
            score = sum(1 for token in tokens if token in haystack)
            if score:
                strategies.append((score, strategy))
        strategies.sort(key=lambda item: item[0], reverse=True)
        active_strategies = [item[1] for item in strategies[:4]]

        contradictions = []
        for item in self.store.list_contradictions():
            haystack = " ".join(
                str(item.get(key, ""))
                for key in ("entity", "attribute", "existing_value", "incoming_value")
            ).casefold()
            if any(token in haystack for token in tokens):
                contradictions.append(item)
        contradictions = contradictions[:8]

        references: list[dict[str, Any]] = []
        lines: list[str] = []

        for fact in facts:
            reference = {
                "kind": "fact",
                "id": fact["id"],
                "source": fact["source"],
                "confidence": fact["confidence"],
            }
            references.append(reference)
            lines.append(
                "FACT | "
                f"{self._clip(fact['entity'], 120)} / "
                f"{self._clip(fact['attribute'], 120)} = "
                f"{self._clip(fact['value'])} "
                f"(confidence={float(fact['confidence']):.2f}; "
                f"source={self._clip(fact['source'], 180)})"
            )

        for experience in experiences:
            references.append(
                {
                    "kind": "experience",
                    "id": experience.get("id"),
                    "source": "experience-memory",
                    "confidence": experience.get("confidence"),
                }
            )
            lines.append(
                "EXPERIENCE | "
                f"task={self._clip(experience.get('task_type', ''), 100)}; "
                f"strategy={self._clip(experience.get('strategy_key', ''), 100)}; "
                f"outcome={self._clip(experience.get('outcome', ''))}"
            )

        for strategy in active_strategies:
            references.append(
                {
                    "kind": "strategy",
                    "id": strategy.get("id"),
                    "source": "strategy-library",
                    "confidence": strategy.get("confidence"),
                }
            )
            lines.append(
                "STRATEGY | "
                f"{self._clip(strategy.get('strategy_key', ''), 120)}: "
                f"{self._clip(strategy.get('description', ''))}"
            )

        for contradiction in contradictions:
            references.append(
                {
                    "kind": "contradiction",
                    "id": contradiction.get("id"),
                    "source": "knowledge-contradiction",
                    "confidence": None,
                }
            )
            lines.append(
                "CONTRADICTION | "
                f"{self._clip(contradiction.get('entity', ''), 120)} / "
                f"{self._clip(contradiction.get('attribute', ''), 120)}: "
                f"{self._clip(contradiction.get('existing_value', ''), 220)} <> "
                f"{self._clip(contradiction.get('incoming_value', ''), 220)}"
            )

        context_text = "\n".join(lines)
        if len(context_text) > 6_000:
            context_text = context_text[:5_999] + "…"

        return {
            "facts": facts,
            "experiences": experiences,
            "strategies": active_strategies,
            "contradictions": contradictions,
            "references": references,
            "context_text": context_text,
            "counts": {
                "facts": len(facts),
                "experiences": len(experiences),
                "strategies": len(active_strategies),
                "contradictions": len(contradictions),
            },
        }

from pathlib import Path

from sayuri_core.knowledge import KnowledgeStore
from sayuri_core.schemas import FactCreateRequest
from sayuri_core.storage import SQLiteStore


def test_conflicting_fact_creates_contradiction(tmp_path: Path) -> None:
    knowledge = KnowledgeStore(SQLiteStore(tmp_path / "sayuri.db"))

    first = knowledge.add_fact(
        FactCreateRequest(
            entity="vehicle-18",
            attribute="plate",
            value="A123AA",
            confidence=0.99,
            source="garage-card",
        )
    )
    assert first["contradictions"] == []

    second = knowledge.add_fact(
        FactCreateRequest(
            entity="vehicle-18",
            attribute="plate",
            value="A128AA",
            confidence=0.91,
            source="invoice-883",
        )
    )
    assert len(second["contradictions"]) == 1

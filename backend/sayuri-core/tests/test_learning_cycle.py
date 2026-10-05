from pathlib import Path

from sayuri_core.learning import LearningEngine
from sayuri_core.schemas import LearningCycleRequest, ScoreVector
from sayuri_core.storage import SQLiteStore


def test_learning_cycle_persists_experience(tmp_path: Path) -> None:
    store = SQLiteStore(tmp_path / "sayuri.db")
    engine = LearningEngine(store)

    result = engine.complete_task(
        LearningCycleRequest(
            task_type="document_analysis",
            strategy_key="extract_then_crosscheck",
            outcome="document processed",
            scores=ScoreVector(
                accuracy=0.90,
                reasoning=0.80,
                memory_use=0.65,
                tool_use=0.90,
                efficiency=0.80,
                consistency=0.85,
                user_acceptance=None,
            ),
            evidence=["page:1"],
            confidence=0.88,
        )
    )

    assert result["experience"]["task_type"] == "document_analysis"
    assert store.count_events("experience") == 1
    assert store.count_events("reflection") == 1
    assert "memory_use" in result["evaluation"]["weak_areas"]

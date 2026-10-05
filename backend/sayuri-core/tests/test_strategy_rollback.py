from sayuri_core.learning import StrategyLibrary
from sayuri_core.schemas import StrategyCandidateRequest
from sayuri_core.storage import SQLiteStore


def _candidate(version: int, score: float) -> StrategyCandidateRequest:
    return StrategyCandidateRequest(
        strategy_key="document_analysis",
        version=version,
        description=f"strategy v{version}",
        score=score,
        confidence=0.95,
        regression_passed=True,
        safety_passed=True,
    )


def test_strategy_rollback_restores_previous_version(tmp_path) -> None:
    store = SQLiteStore(tmp_path / "sayuri.db")
    library = StrategyLibrary(store)
    first = library.submit(_candidate(1, 0.80))
    second = library.submit(_candidate(2, 0.90))
    assert first["promoted"] is True
    assert second["promoted"] is True

    result = library.rollback("document_analysis", "regression detected")

    assert result["rolled_back"]["version"] == 2
    assert result["restored"]["version"] == 1
    assert store.active_strategy("document_analysis")["version"] == 1
    assert store.count_events("strategy_rollback") == 1

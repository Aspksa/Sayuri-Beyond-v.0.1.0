from pathlib import Path

from sayuri_core.learning import StrategyLibrary
from sayuri_core.schemas import StrategyCandidateRequest
from sayuri_core.storage import SQLiteStore


def test_strategy_requires_quality_gain(tmp_path: Path) -> None:
    library = StrategyLibrary(SQLiteStore(tmp_path / "sayuri.db"))

    first = library.submit(
        StrategyCandidateRequest(
            strategy_key="contract_compare",
            version=1,
            description="baseline",
            score=0.80,
            confidence=0.90,
            regression_passed=True,
            safety_passed=True,
        )
    )
    assert first["promoted"] is True

    weaker = library.submit(
        StrategyCandidateRequest(
            strategy_key="contract_compare",
            version=2,
            description="weaker candidate",
            score=0.79,
            confidence=0.95,
            regression_passed=True,
            safety_passed=True,
        )
    )
    assert weaker["promoted"] is False

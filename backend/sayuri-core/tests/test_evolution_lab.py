from pathlib import Path

from sayuri_core.evolution_lab import EvolutionLab
from sayuri_core.learning import StrategyLibrary
from sayuri_core.schemas import (
    EvolutionBenchmarkCandidate,
    EvolutionBenchmarkRequest,
    EvolutionProposalRequest,
    ScoreVector,
)
from sayuri_core.storage import SQLiteStore


def _scores(value: float) -> ScoreVector:
    return ScoreVector(
        accuracy=value,
        reasoning=value,
        memory_use=value,
        tool_use=value,
        efficiency=value,
        consistency=value,
        user_acceptance=value,
    )


def test_teacher_v2_proposes_multiple_variants(tmp_path: Path) -> None:
    store = SQLiteStore(tmp_path / "sayuri.db")
    lab = EvolutionLab(store, StrategyLibrary(store))

    result = lab.propose(
        EvolutionProposalRequest(
            strategy_key="document_check",
            base_description="Extract facts, then answer.",
            lessons=["Check contradictions before finalizing."],
            variants=4,
        )
    )

    assert len(result["variants"]) == 4
    assert all(item["score"] is None for item in result["variants"])
    assert result["execution_policy"]["generated_code_execution"] is False


def test_benchmark_promotes_only_best_eligible_candidate(tmp_path: Path) -> None:
    store = SQLiteStore(tmp_path / "sayuri.db")
    lab = EvolutionLab(store, StrategyLibrary(store))

    result = lab.benchmark(
        EvolutionBenchmarkRequest(
            strategy_key="document_check",
            baseline_score=0.70,
            candidates=[
                EvolutionBenchmarkCandidate(
                    name="safe-strong",
                    description="Use memory, evidence, and contradiction checks.",
                    scores=_scores(0.90),
                    confidence=0.95,
                    regression_passed=True,
                    safety_passed=True,
                ),
                EvolutionBenchmarkCandidate(
                    name="unsafe-higher",
                    description="Higher score but failed safety.",
                    scores=_scores(0.95),
                    confidence=0.99,
                    regression_passed=True,
                    safety_passed=False,
                ),
            ],
        )
    )

    assert result["winner"]["name"] == "safe-strong"
    assert result["promotion"]["promoted"] is True
    assert result["promotion"]["strategy"]["status"] == "active"


def test_benchmark_rejects_non_improving_candidate(tmp_path: Path) -> None:
    store = SQLiteStore(tmp_path / "sayuri.db")
    lab = EvolutionLab(store, StrategyLibrary(store))

    result = lab.benchmark(
        EvolutionBenchmarkRequest(
            strategy_key="document_check",
            baseline_score=0.80,
            candidates=[
                EvolutionBenchmarkCandidate(
                    name="not-better",
                    description="No measurable gain.",
                    scores=_scores(0.805),
                    confidence=0.95,
                    regression_passed=True,
                    safety_passed=True,
                )
            ],
        )
    )

    assert result["winner"] is None
    assert result["promotion"] is None

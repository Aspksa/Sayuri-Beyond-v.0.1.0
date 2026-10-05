from sayuri_core.evolution_gate import EvolutionGate
from sayuri_core.memrl_adapter import MemRLAdapter
from sayuri_core.schemas import LearningCycleRequest, ScoreVector
from sayuri_core.storage import SQLiteStore


def _request(
    confidence: float = 0.9,
    evidence: list[str] | None = None,
) -> LearningCycleRequest:
    return LearningCycleRequest(
        task_type="service_note",
        strategy_key="service_note_v1",
        outcome="completed",
        scores=ScoreVector(
            accuracy=0.9,
            reasoning=0.9,
            memory_use=0.9,
            tool_use=0.9,
            efficiency=0.9,
            consistency=0.9,
            user_acceptance=0.9,
        ),
        evidence=["page:1"] if evidence is None else evidence,
        confidence=confidence,
    )


def test_gate_reinforces_verified_success(tmp_path) -> None:
    store = SQLiteStore(tmp_path / "sayuri.db")
    gate = EvolutionGate(store, MemRLAdapter(store))
    result = gate.observe(
        _request(),
        {"overall": 0.90, "passed": True},
        ["keep source references"],
    )
    assert result["decision"] == "reinforce_existing_strategy"


def test_gate_requires_evidence(tmp_path) -> None:
    store = SQLiteStore(tmp_path / "sayuri.db")
    gate = EvolutionGate(store, MemRLAdapter(store))
    result = gate.observe(
        _request(evidence=[]),
        {"overall": 0.90, "passed": True},
        [],
    )
    assert result["decision"] == "candidate_strategy_improvement"

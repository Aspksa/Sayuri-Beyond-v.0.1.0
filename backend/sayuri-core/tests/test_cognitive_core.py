from sayuri_core.cognitive import CognitiveCore
from sayuri_core.schemas import CognitivePrepareRequest, CognitiveVerifyRequest
from sayuri_core.storage import SQLiteStore


def test_governor_uses_tree_for_contradictions(tmp_path):
    core = CognitiveCore(SQLiteStore(tmp_path / "sayuri.db"))
    result = core.prepare(
        CognitivePrepareRequest(
            task_type="document_analysis",
            goal="Compare invoice with contract",
            complexity=0.6,
            confidence=0.8,
            contradiction_count=2,
            tool_required=True,
            context={"document_id": "invoice-17"},
        )
    )

    assert result["governor"]["mode"] == "tree"
    assert result["governor"]["verification_required"] is True
    assert any(step["action"] == "resolve_contradictions" for step in result["plan"])
    assert any(step["action"] == "validate_tool_outputs" for step in result["plan"])
    assert result["state"]["state"] == "thinking"
    assert result["working_memory"]


def test_high_risk_requires_human_confirmation(tmp_path):
    core = CognitiveCore(SQLiteStore(tmp_path / "sayuri.db"))
    result = core.prepare(
        CognitivePrepareRequest(
            task_type="external_action",
            goal="Perform a high-impact external action",
            risk="high",
        )
    )

    assert result["governor"]["mode"] == "guarded"
    assert result["governor"]["human_confirmation_required"] is True


def test_verifier_blocks_unresolved_failures(tmp_path):
    core = CognitiveCore(SQLiteStore(tmp_path / "sayuri.db"))
    prepared = core.prepare(
        CognitivePrepareRequest(
            task_type="research",
            goal="Produce verified answer",
            tool_required=True,
        )
    )

    result = core.verify(
        CognitiveVerifyRequest(
            task_id=prepared["task_id"],
            evidence=["source-a"],
            unresolved_contradictions=1,
            tool_failures=1,
            confidence=0.9,
            critical_claims_checked=True,
            safety_passed=True,
        )
    )

    assert result["verification"]["passed"] is False
    assert result["verification"]["decision"] == "revise"
    assert result["state"]["state"] == "blocked"


def test_finalize_clears_short_term_memory_but_keeps_events(tmp_path):
    store = SQLiteStore(tmp_path / "sayuri.db")
    core = CognitiveCore(store)
    prepared = core.prepare(
        CognitivePrepareRequest(
            task_type="chat",
            goal="Answer a question",
            context={"screen": "chat"},
        )
    )

    result = core.finalize(
        prepared["task_id"],
        learning_event_id="experience-1",
        clear_working_memory=True,
    )

    assert result["state"]["state"] == "idle"
    assert core.working_memory.snapshot(prepared["task_id"]) == []
    events = store.list_events("cognitive_event", limit=100)
    assert any(event["event"] == "task_completed" for event in events)

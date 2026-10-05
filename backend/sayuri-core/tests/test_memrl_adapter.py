from sayuri_core.memrl_adapter import MemRLAdapter
from sayuri_core.storage import SQLiteStore


def test_memrl_shadow_episode_is_persisted(tmp_path) -> None:
    store = SQLiteStore(tmp_path / "sayuri.db")
    adapter = MemRLAdapter(store)

    result = adapter.record_episode(
        task_type="document_analysis",
        strategy_key="service_note_v1",
        quality_score=0.90,
        passed=True,
        confidence=0.90,
        outcome="ok",
        errors=[],
        lessons=["keep source references"],
        evidence=["page:1"],
        retrieved_memory_ids=["memory-1"],
    )

    assert result["reward"] > 0
    assert result["applied_to_memrl"] is False
    episodes = store.list_events("memrl_episode")
    assert len(episodes) == 1
    assert episodes[0]["strategy_key"] == "service_note_v1"


def test_memrl_reward_penalizes_failed_low_quality_task(tmp_path) -> None:
    adapter = MemRLAdapter(SQLiteStore(tmp_path / "sayuri.db"))
    reward = adapter.reward(quality_score=0.20, passed=False, confidence=0.40)
    assert reward < 0

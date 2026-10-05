import pytest

from sayuri_core.chat_engine import SayuriChatEngine
from sayuri_core.cognitive import CognitiveCore
from sayuri_core.config import Settings
from sayuri_core.memory_retrieval import MemoryRetriever
from sayuri_core.runtime import LLMRuntimeBridge
from sayuri_core.schemas import ChatRequest, ScreenContextRequest
from sayuri_core.screen_context import ScreenContextRegistry
from sayuri_core.skills import SkillRegistry
from sayuri_core.storage import SQLiteStore
from sayuri_core.timeline import CognitiveTimeline


def build_chat(tmp_path):
    store = SQLiteStore(tmp_path / "sayuri.db")
    settings = Settings(llm_provider="mock")
    cognitive = CognitiveCore(store)
    runtime = LLMRuntimeBridge(settings)
    memory = MemoryRetriever(store)
    screens = ScreenContextRegistry()
    skills = SkillRegistry(settings)
    chat = SayuriChatEngine(
        store=store,
        cognitive=cognitive,
        runtime=runtime,
        memory=memory,
        screens=screens,
        skills=skills,
    )
    return store, runtime, memory, screens, skills, chat


def test_mock_runtime_is_key_free(tmp_path):
    _, runtime, _, _, _, _ = build_chat(tmp_path)
    status = runtime.status()

    assert status["available"] is True
    assert status["provider"] == "mock"
    assert status["api_key_present"] is False

    result = runtime.generate([{"role": "user", "content": "Привет"}])
    assert result["provider"] == "mock"
    assert "mock-режиме" in result["content"]


def test_memory_retrieval_finds_verified_fact(tmp_path):
    store, _, memory, _, _, _ = build_chat(tmp_path)
    store.add_fact(
        entity="car-17",
        attribute="vin",
        value="ABC123XYZ",
        confidence=0.98,
        source="garage-card",
    )

    result = memory.retrieve("Какой VIN у car-17?")

    assert result["counts"]["facts"] == 1
    assert result["facts"][0]["value"] == "ABC123XYZ"
    assert result["references"][0]["source"] == "garage-card"


def test_screen_context_is_ephemeral_and_used_by_chat(tmp_path):
    store, _, _, screens, _, chat = build_chat(tmp_path)
    store.add_fact(
        entity="document-418",
        attribute="type",
        value="waybill",
        confidence=0.95,
        source="document-card",
    )
    screens.update(
        ScreenContextRequest(
            session_id="session-a",
            route="/documents/418",
            title="Путевой лист №418",
            module="documents",
            selected_entity="document-418",
        )
    )

    result = chat.respond(
        ChatRequest(
            session_id="session-a",
            message="Что известно про document-418?",
        )
    )

    assert result["runtime"]["provider"] == "mock"
    assert result["screen_context"]["route"] == "/documents/418"
    assert result["memory"]["counts"]["facts"] == 1
    assert result["verification"]["passed"] is True
    assert screens.status()["persistent"] is False

    timeline = CognitiveTimeline(store).list(task_id=result["task_id"], limit=50)
    events = {item["event"] for item in timeline}
    assert "task_started" in events
    assert "runtime_call" in events
    assert "chat_turn" in events


def test_runtime_rejects_plain_http_for_remote_provider():
    runtime = LLMRuntimeBridge(
        Settings(
            llm_provider="openai-compatible",
            llm_base_url="http://example.com/v1",
            llm_model="model",
            llm_api_key="secret",
        )
    )

    with pytest.raises(RuntimeError, match="must use HTTPS"):
        runtime.generate([{"role": "user", "content": "test"}])


def test_mcp_registry_is_catalog_only():
    skills = SkillRegistry(
        Settings(
            mcp_servers_json=(
                '[{"name":"github","transport":"remote",'
                '"description":"GitHub","enabled":true}]'
            )
        )
    )

    result = skills.list()
    assert result["mcp"]["servers"][0]["name"] == "github"
    assert result["mcp"]["servers"][0]["execution_enabled"] is False
    assert result["mcp"]["execution_enabled"] is False

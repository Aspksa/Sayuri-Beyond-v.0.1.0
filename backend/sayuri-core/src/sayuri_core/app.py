from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .chat_engine import SayuriChatEngine
from .cognitive import CognitiveCore
from .config import get_settings
from .evolution_engine import EvolutionEngine
from .evolution_lab import EvolutionLab
from .knowledge import KnowledgeStore
from .learning import DevelopmentMetrics, LearningEngine, StrategyLibrary
from .logic_engine import LogicEngine
from .memory_retrieval import MemoryRetriever
from .runtime import LLMRuntimeBridge
from .screen_context import ScreenContextRegistry
from .skills import SkillRegistry
from .timeline import CognitiveTimeline
from .schemas import (
    ChatRequest,
    CognitiveCompleteRequest,
    CognitivePrepareRequest,
    CognitiveVerifyRequest,
    EvolutionBenchmarkRequest,
    EvolutionProposalRequest,
    FactCreateRequest,
    HypothesisCreateRequest,
    HypothesisUpdateRequest,
    LearningCycleRequest,
    LogicRequest,
    ScreenContextRequest,
    StrategyCandidateRequest,
)
from .storage import SQLiteStore

settings = get_settings()
app = FastAPI(
    title="SAYURI Core",
    version="0.2.0",
    description="Cognitive backend for SAYURI BEYOND",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

data_path = Path(settings.data_dir)
store = SQLiteStore(data_path / "sayuri.db")
evolution = EvolutionEngine()
logic = LogicEngine() if settings.enable_logic else None
learning = LearningEngine(store)
strategies = StrategyLibrary(store)
knowledge = KnowledgeStore(store)
development = DevelopmentMetrics(store)
evolution_lab = EvolutionLab(store, strategies)
cognitive = CognitiveCore(store)
runtime = LLMRuntimeBridge(settings)
memory_retriever = MemoryRetriever(store)
screens = ScreenContextRegistry()
skills = SkillRegistry(settings)
timeline = CognitiveTimeline(store)
chat = SayuriChatEngine(
    store=store,
    cognitive=cognitive,
    runtime=runtime,
    memory=memory_retriever,
    screens=screens,
    skills=skills,
)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "sayuri-core",
        "version": "0.2.0",
        "environment": settings.environment,
        "database": str(data_path / "sayuri.db"),
        "logic": logic.health() if logic else {"available": False, "disabled": True},
        "evolution": evolution.status()
        if settings.enable_evolution
        else {"available": False, "disabled": True},
        "learning": {
            "available": settings.enable_learning,
            "mode": "supervised",
            "teacher": "teacher_v2",
            "self_modifying_code": False,
        },
        "cognitive": {
            "available": True,
            "components": cognitive.status()["components"],
            "working_memory_persistent": False,
            "long_term_events_persistent": True,
        },
        "runtime": runtime.status(),
        "screen_context": screens.status(),
        "skills": {
            "available": len(skills.list()["skills"]),
            "mcp_execution_enabled": skills.list()["mcp"]["execution_enabled"],
        },
    }


@app.get("/v1/runtime/status")
def runtime_status() -> dict:
    return runtime.status()


@app.post("/v1/context/screen")
def update_screen_context(request: ScreenContextRequest) -> dict:
    return screens.update(request)


@app.get("/v1/context/screen/{session_id}")
def get_screen_context(session_id: str) -> dict:
    snapshot = screens.snapshot(session_id)
    return {"context": snapshot, "persistent": False}


@app.get("/v1/memory/recall")
def recall_memory(
    q: str = Query(min_length=1, max_length=20_000),
    limit: int = Query(default=8, ge=1, le=30),
) -> dict:
    result = memory_retriever.retrieve(q, limit=limit)
    return {
        "counts": result["counts"],
        "facts": result["facts"],
        "experiences": result["experiences"],
        "strategies": result["strategies"],
        "contradictions": result["contradictions"],
        "references": result["references"],
    }


@app.get("/v1/skills")
def list_skills() -> dict:
    return skills.list()


@app.get("/v1/timeline")
def cognitive_timeline(
    task_id: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
) -> dict:
    return {
        "items": timeline.list(task_id=task_id, limit=limit),
        "private_reasoning_exposed": False,
    }


@app.post("/v1/chat")
def sayuri_chat(request: ChatRequest) -> dict:
    try:
        return chat.respond(request)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/v1/cognitive/status")
def cognitive_status(task_id: str | None = Query(default=None)) -> dict:
    return cognitive.status(task_id)


@app.post("/v1/cognitive/prepare")
def cognitive_prepare(request: CognitivePrepareRequest) -> dict:
    return cognitive.prepare(request)


@app.post("/v1/cognitive/verify")
def cognitive_verify(request: CognitiveVerifyRequest) -> dict:
    return cognitive.verify(request)


@app.post("/v1/cognitive/complete")
def cognitive_complete(request: CognitiveCompleteRequest) -> dict:
    if not settings.enable_learning:
        raise HTTPException(status_code=503, detail="learning engine is disabled")
    learning_result = learning.complete_task(request)
    cognitive_result = cognitive.finalize(
        request.task_id,
        learning_event_id=learning_result["experience"]["id"],
        clear_working_memory=request.clear_working_memory,
    )
    return {
        "cognitive": cognitive_result,
        "learning": learning_result,
        "development": development.snapshot(),
    }


@app.get("/v1/evolution/status")
def evolution_status() -> dict:
    if not settings.enable_evolution:
        return {"available": False, "disabled": True}
    return evolution.status()


@app.post("/v1/evolution/propose")
def propose_evolution(request: EvolutionProposalRequest) -> dict:
    if not settings.enable_evolution:
        raise HTTPException(status_code=503, detail="evolution engine is disabled")
    return evolution_lab.propose(request)


@app.post("/v1/evolution/benchmark")
def benchmark_evolution(request: EvolutionBenchmarkRequest) -> dict:
    if not settings.enable_evolution:
        raise HTTPException(status_code=503, detail="evolution engine is disabled")
    return evolution_lab.benchmark(request)


@app.get("/v1/evolution/experiments")
def evolution_experiments(limit: int = Query(default=50, ge=1, le=500)) -> dict:
    return evolution_lab.recent_experiments(limit=limit)


@app.post("/v1/logic/evaluate")
def evaluate_logic(request: LogicRequest) -> dict:
    if logic is None:
        raise HTTPException(status_code=503, detail="logic engine is disabled")
    try:
        return {"result": logic.run(request.code)}
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"{type(exc).__name__}: {exc}",
        ) from exc


@app.post("/v1/learning/complete-task")
def complete_learning_cycle(request: LearningCycleRequest) -> dict:
    if not settings.enable_learning:
        raise HTTPException(status_code=503, detail="learning engine is disabled")
    return learning.complete_task(request)


@app.get("/v1/memory/experiences")
def recent_experience(limit: int = Query(default=50, ge=1, le=500)) -> dict:
    return {"items": store.list_events("experience", limit=limit)}


@app.post("/v1/strategies/candidates")
def submit_strategy_candidate(request: StrategyCandidateRequest) -> dict:
    return strategies.submit(request)


@app.get("/v1/strategies")
def list_strategies() -> dict:
    return {"items": store.list_strategies()}


@app.post("/v1/knowledge/facts")
def add_fact(request: FactCreateRequest) -> dict:
    return knowledge.add_fact(request)


@app.get("/v1/knowledge/contradictions")
def list_contradictions() -> dict:
    return {"items": knowledge.contradictions()}


@app.post("/v1/knowledge/hypotheses")
def add_hypothesis(request: HypothesisCreateRequest) -> dict:
    return knowledge.add_hypothesis(request)


@app.patch("/v1/knowledge/hypotheses/{hypothesis_id}")
def update_hypothesis(
    hypothesis_id: str,
    request: HypothesisUpdateRequest,
) -> dict:
    try:
        return knowledge.update_hypothesis(hypothesis_id, request)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="hypothesis not found") from exc


@app.get("/v1/knowledge/hypotheses")
def list_hypotheses() -> dict:
    return {"items": knowledge.hypotheses()}


@app.get("/v1/development")
def development_status() -> dict:
    return development.snapshot()

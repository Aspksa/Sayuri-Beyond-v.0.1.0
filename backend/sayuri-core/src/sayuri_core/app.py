from pathlib import Path

from fastapi import FastAPI, HTTPException, Query

from .config import get_settings
from .evolution_engine import EvolutionEngine
from .knowledge import KnowledgeStore
from .learning import DevelopmentMetrics, LearningEngine, StrategyLibrary
from .logic_engine import LogicEngine
from .schemas import (
    FactCreateRequest,
    HypothesisCreateRequest,
    HypothesisUpdateRequest,
    LearningCycleRequest,
    LogicRequest,
    StrategyCandidateRequest,
)
from .storage import SQLiteStore

settings = get_settings()
app = FastAPI(
    title="SAYURI Core",
    version="0.1.0",
    description="Cognitive backend for SAYURI BEYOND",
)

data_path = Path(settings.data_dir)
store = SQLiteStore(data_path / "sayuri.db")
evolution = EvolutionEngine()
logic = LogicEngine() if settings.enable_logic else None
learning = LearningEngine(store)
strategies = StrategyLibrary(store)
knowledge = KnowledgeStore(store)
development = DevelopmentMetrics(store)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "sayuri-core",
        "version": "0.1.0",
        "environment": settings.environment,
        "database": str(data_path / "sayuri.db"),
        "logic": logic.health() if logic else {"available": False, "disabled": True},
        "evolution": evolution.status()
        if settings.enable_evolution
        else {"available": False, "disabled": True},
        "learning": {
            "available": settings.enable_learning,
            "mode": "supervised",
            "self_modifying_code": False,
        },
    }


@app.get("/v1/evolution/status")
def evolution_status() -> dict:
    if not settings.enable_evolution:
        return {"available": False, "disabled": True}
    return evolution.status()


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

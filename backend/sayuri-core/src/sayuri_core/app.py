from pathlib import Path

from fastapi import FastAPI, HTTPException, Query

from .config import get_settings
from .evolution_engine import EvolutionEngine
from .evolution_gate import EvolutionGate
from .evolution_lab import EvolutionLab
from .knowledge import KnowledgeStore
from .learning import DevelopmentMetrics, LearningEngine, StrategyLibrary
from .logic_engine import LogicEngine
from .memrl_adapter import MemRLAdapter
from .schemas import (
    EvolutionBenchmarkRequest,
    EvolutionProposalRequest,
    FactCreateRequest,
    HypothesisCreateRequest,
    HypothesisUpdateRequest,
    LearningCycleRequest,
    LogicRequest,
    StrategyCandidateRequest,
    StrategyRollbackRequest,
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
memrl = MemRLAdapter(store, enabled=settings.enable_memrl)
evolution_gate = EvolutionGate(store, memrl)
learning = LearningEngine(store, evolution_gate=evolution_gate)
strategies = StrategyLibrary(store)
knowledge = KnowledgeStore(store)
development = DevelopmentMetrics(store)
evolution_lab = EvolutionLab(store, strategies)


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
        "memrl": memrl.status(),
        "learning": {
            "available": settings.enable_learning,
            "mode": "supervised",
            "teacher": "teacher_v2",
            "self_modifying_code": False,
            "automatic_strategy_promotion": False,
        },
    }


@app.get("/v1/evolution/status")
def evolution_status() -> dict:
    if not settings.enable_evolution:
        return {"available": False, "disabled": True, "memrl": memrl.status()}
    result = evolution.status()
    result["memrl"] = memrl.status()
    result["gate"] = {
        "mode": "supervised",
        "minimum_confidence": evolution_gate.minimum_confidence,
        "minimum_reward": evolution_gate.minimum_reward,
        "automatic_strategy_promotion": False,
        "self_modifying_code": False,
    }
    return result


@app.get("/v1/evolution/memrl")
def memrl_status() -> dict:
    return memrl.status()


@app.get("/v1/evolution/episodes")
def evolution_episodes(limit: int = Query(default=50, ge=1, le=500)) -> dict:
    return {
        "items": store.list_events("memrl_episode", limit=limit),
        "gate_events": store.list_events("evolution_gate", limit=limit),
    }


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


@app.post("/v1/strategies/{strategy_key}/rollback")
def rollback_strategy(
    strategy_key: str,
    request: StrategyRollbackRequest,
) -> dict:
    try:
        return strategies.rollback(strategy_key, request.reason)
    except KeyError as exc:
        raise HTTPException(
            status_code=409,
            detail=f"rollback unavailable: {exc.args[0]}",
        ) from exc


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

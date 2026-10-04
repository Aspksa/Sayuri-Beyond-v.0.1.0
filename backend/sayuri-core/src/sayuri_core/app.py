from fastapi import FastAPI, HTTPException

from .config import get_settings
from .evolution_engine import EvolutionEngine
from .logic_engine import LogicEngine
from .schemas import LogicRequest

settings = get_settings()
app = FastAPI(
    title="SAYURI Core",
    version="0.1.0",
    description="Cognitive backend for SAYURI BEYOND",
)

evolution = EvolutionEngine()
logic = LogicEngine() if settings.enable_logic else None


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "sayuri-core",
        "version": "0.1.0",
        "environment": settings.environment,
        "logic": logic.health() if logic else {"available": False, "disabled": True},
        "evolution": evolution.status()
        if settings.enable_evolution
        else {"available": False, "disabled": True},
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

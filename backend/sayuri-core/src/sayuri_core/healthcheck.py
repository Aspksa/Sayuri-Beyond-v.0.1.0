import json
from pathlib import Path

from .config import get_settings
from .evolution_engine import EvolutionEngine
from .logic_engine import LogicEngine
from .memrl_adapter import MemRLAdapter
from .storage import SQLiteStore


REQUIRED_OPTIMIZERS = {
    "textgrad",
    "aflow",
    "mipro",
    "evoprompt_de",
    "evoprompt_ga",
}


def main() -> None:
    settings = get_settings()
    store = SQLiteStore(Path(settings.data_dir) / "sayuri.db")
    report = {
        "logic": LogicEngine().health(),
        "evolution": EvolutionEngine().status(),
        "memrl": MemRLAdapter(store, enabled=settings.enable_memrl).status(),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))

    if not report["logic"].get("available"):
        raise SystemExit("Hyperon health check failed")
    if not report["evolution"].get("available"):
        raise SystemExit("EvoAgentX health check failed")

    optimizers = report["evolution"].get("optimizers", {})
    missing = sorted(
        name
        for name in REQUIRED_OPTIMIZERS
        if not optimizers.get(name, {}).get("available")
    )
    if missing:
        raise SystemExit(
            "EvoAgentX optimizer health check failed: " + ", ".join(missing)
        )


if __name__ == "__main__":
    main()

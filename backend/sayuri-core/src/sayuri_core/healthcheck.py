import json

from .evolution_engine import EvolutionEngine
from .logic_engine import LogicEngine


REQUIRED_OPTIMIZERS = {
    "textgrad",
    "aflow",
    "mipro",
    "evoprompt_de",
    "evoprompt_ga",
}


def main() -> None:
    report = {
        "logic": LogicEngine().health(),
        "evolution": EvolutionEngine().status(),
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

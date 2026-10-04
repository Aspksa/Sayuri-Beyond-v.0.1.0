import json

from .evolution_engine import EvolutionEngine
from .logic_engine import LogicEngine


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


if __name__ == "__main__":
    main()

import json
from importlib import import_module
from typing import Any


OPTIMIZERS = {
    "textgrad": ("evoagentx.optimizers", "TextGradOptimizer"),
    "aflow": ("evoagentx.optimizers", "AFlowOptimizer"),
    "mipro": ("evoagentx.optimizers", "MiproOptimizer"),
    "evoprompt_de": ("evoagentx.optimizers.evoprompt_optimizer", "DEOptimizer"),
    "evoprompt_ga": ("evoagentx.optimizers.evoprompt_optimizer", "GAOptimizer"),
}


def probe() -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for name, (module_name, symbol) in OPTIMIZERS.items():
        try:
            module = import_module(module_name)
            getattr(module, symbol)
            result[name] = {"available": True}
        except Exception as exc:
            result[name] = {
                "available": False,
                "error": f"{type(exc).__name__}: {exc}",
            }
    return result


def main() -> None:
    optimizers = probe()
    report = {
        "runtime": "evolution-worker",
        "optimizers": optimizers,
        "self_modifying_code": False,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))

    missing = sorted(
        name for name, state in optimizers.items() if not state.get("available")
    )
    if missing:
        raise SystemExit(
            "Evolution Worker optimizer health check failed: " + ", ".join(missing)
        )


if __name__ == "__main__":
    main()

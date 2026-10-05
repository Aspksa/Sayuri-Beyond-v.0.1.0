import json
from importlib import import_module
from importlib.metadata import PackageNotFoundError, version
from importlib.util import find_spec
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


def probe_memrl() -> dict[str, Any]:
    installed = find_spec("memrl") is not None
    installed_version = None
    if installed:
        try:
            installed_version = version("memrl")
        except PackageNotFoundError:
            installed_version = "unknown"
    return {
        "available": installed,
        "version": installed_version,
        "pinned_revision": "c1b322ca43de36ddf64c6712f89d0095bfc35ce0",
        "mode": "ready_for_provider_binding" if installed else "missing",
    }


def main() -> None:
    optimizers = probe()
    memrl = probe_memrl()
    report = {
        "runtime": "evolution-worker",
        "optimizers": optimizers,
        "memrl": memrl,
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
    if not memrl["available"]:
        raise SystemExit("Evolution Worker MemRL health check failed")


if __name__ == "__main__":
    main()

import json
from importlib import import_module
from importlib.metadata import PackageNotFoundError, version


PINNED_REVISION = "c1b322ca43de36ddf64c6712f89d0095bfc35ce0"


def probe_memrl() -> dict:
    try:
        module = import_module("memrl.service.memory_service")
        getattr(module, "MemoryService")
        try:
            installed_version = version("memrl")
        except PackageNotFoundError:
            installed_version = "unknown"
        return {
            "available": True,
            "version": installed_version,
            "memory_service": True,
            "pinned_revision": PINNED_REVISION,
        }
    except Exception as exc:
        return {
            "available": False,
            "memory_service": False,
            "pinned_revision": PINNED_REVISION,
            "error": f"{type(exc).__name__}: {exc}",
        }


def main() -> None:
    memrl = probe_memrl()
    report = {
        "runtime": "memrl-worker",
        "memrl": memrl,
        "weight_updates": False,
        "automatic_strategy_promotion": False,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if not memrl["available"]:
        raise SystemExit("MemRL Worker health check failed")


if __name__ == "__main__":
    main()

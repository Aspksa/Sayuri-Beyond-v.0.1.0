from __future__ import annotations

from importlib.metadata import PackageNotFoundError, version
from typing import Any


class EvolutionEngine:
    """Lightweight Sayuri-side adapter for EvoAgentX.

    Heavy optimizer runtimes live in a separate evolution environment so normal
    chat/API startup does not import RAG, browser, vector or ML dependencies.
    """

    package_name = "evoagentx"
    optimizer_names = (
        "textgrad",
        "aflow",
        "mipro",
        "evoprompt_de",
        "evoprompt_ga",
    )

    def status(self) -> dict[str, Any]:
        try:
            installed_version = version(self.package_name)
        except PackageNotFoundError:
            return {
                "available": False,
                "engine": "evoagentx",
                "error": "package not installed",
            }

        return {
            "available": True,
            "engine": "evoagentx",
            "version": installed_version,
            "mode": "supervised",
            "self_modifying_code": False,
            "optimizer_runtime": {
                "mode": "isolated_worker",
                "environment": ".venv-evolution",
                "required_for": list(self.optimizer_names),
            },
            "capabilities": [
                "evaluation",
                "controlled_strategy_evolution",
                "human_in_the_loop",
                "external_optimizer_worker",
            ],
        }

    def generate_workflow(self, goal: str, llm: Any) -> Any:
        raise RuntimeError(
            "Heavy EvoAgentX workflow generation is isolated from Sayuri Core. "
            "Run it through the Evolution Worker environment."
        )

from __future__ import annotations

from importlib import import_module
from importlib.metadata import PackageNotFoundError, version
from typing import Any


class EvolutionEngine:
    """Adapter around EvoAgentX with capability probing."""

    package_name = "evoagentx"

    optimizer_imports = {
        "textgrad": ("evoagentx.optimizers", "TextGradOptimizer"),
        "aflow": ("evoagentx.optimizers", "AFlowOptimizer"),
        "mipro": ("evoagentx.optimizers", "MiproOptimizer"),
        "evoprompt_de": ("evoagentx.optimizers.evoprompt_optimizer", "DEOptimizer"),
        "evoprompt_ga": ("evoagentx.optimizers.evoprompt_optimizer", "GAOptimizer"),
    }

    @classmethod
    def _optimizer_status(cls) -> dict[str, dict[str, Any]]:
        status: dict[str, dict[str, Any]] = {}
        for name, (module_name, symbol) in cls.optimizer_imports.items():
            try:
                module = import_module(module_name)
                getattr(module, symbol)
                status[name] = {"available": True}
            except Exception as exc:  # diagnostic boundary
                status[name] = {
                    "available": False,
                    "error": f"{type(exc).__name__}: {exc}",
                }
        return status

    def status(self) -> dict[str, Any]:
        try:
            installed_version = version(self.package_name)
        except PackageNotFoundError:
            return {
                "available": False,
                "engine": "evoagentx",
                "error": "package not installed",
            }

        optimizers = self._optimizer_status()
        return {
            "available": True,
            "engine": "evoagentx",
            "version": installed_version,
            "mode": "supervised",
            "self_modifying_code": False,
            "optimizers": optimizers,
            "capabilities": [
                "workflow_generation",
                "evaluation",
                "workflow_optimization",
                "prompt_evolution",
                "memory_integration",
                "human_in_the_loop",
            ],
        }

    def generate_workflow(self, goal: str, llm: Any) -> Any:
        if not goal.strip():
            raise ValueError("goal must not be empty")
        if llm is None:
            raise ValueError("a configured LLM instance is required")

        from evoagentx.workflow import WorkFlowGenerator

        return WorkFlowGenerator(llm=llm).generate_workflow(goal)

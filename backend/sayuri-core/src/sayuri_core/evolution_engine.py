from __future__ import annotations

from importlib.metadata import PackageNotFoundError, version
from typing import Any


class EvolutionEngine:
    """Adapter around EvoAgentX.

    Sayuri keeps control of goals, scoring, approvals and stored experience.
    EvoAgentX supplies workflow generation/evolution primitives.
    """

    package_name = "evoagentx"

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
            "capabilities": [
                "workflow_generation",
                "evaluation",
                "workflow_optimization",
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

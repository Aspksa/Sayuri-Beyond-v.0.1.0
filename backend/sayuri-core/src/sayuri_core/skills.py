from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from typing import Any

from .config import Settings


@dataclass(frozen=True)
class SkillSpec:
    key: str
    name: str
    description: str
    capability: str
    enabled: bool = True
    execution: str = "core"

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


class SkillRegistry:
    """Capabilities known to Sayuri Core.

    v0.2 catalogs MCP servers but does not execute arbitrary MCP commands.
    """

    builtins = (
        SkillSpec(
            key="memory.recall",
            name="Memory Recall",
            description="Retrieve relevant verified facts and prior experience.",
            capability="memory",
        ),
        SkillSpec(
            key="knowledge.contradictions",
            name="Contradiction Check",
            description="Surface conflicting knowledge before finalizing an answer.",
            capability="knowledge",
        ),
        SkillSpec(
            key="cognitive.plan",
            name="Cognitive Planning",
            description="Choose reasoning depth and build an observable operation plan.",
            capability="reasoning",
        ),
        SkillSpec(
            key="result.verify",
            name="Result Verification",
            description="Apply deterministic safety and integrity gates.",
            capability="verification",
        ),
        SkillSpec(
            key="learning.capture",
            name="Experience Capture",
            description="Record supervised evaluation, reflection and lessons.",
            capability="learning",
        ),
    )

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._mcp_servers = self._parse_mcp_servers(settings.mcp_servers_json)

    @staticmethod
    def _parse_mcp_servers(raw: str) -> list[dict[str, Any]]:
        try:
            value = json.loads(raw or "[]")
        except json.JSONDecodeError:
            return []
        if not isinstance(value, list):
            return []

        servers: list[dict[str, Any]] = []
        for item in value[:100]:
            if not isinstance(item, dict):
                continue
            name = str(item.get("name", "")).strip()
            if not name:
                continue
            servers.append(
                {
                    "name": name[:120],
                    "transport": str(item.get("transport", "unknown"))[:40],
                    "description": str(item.get("description", ""))[:500],
                    "enabled": bool(item.get("enabled", False)),
                    "execution_enabled": False,
                }
            )
        return servers

    def list(self) -> dict[str, Any]:
        return {
            "skills": [skill.as_dict() for skill in self.builtins],
            "mcp": {
                "servers": self._mcp_servers,
                "execution_enabled": False,
                "policy": (
                    "v0.2 is catalog-only. Arbitrary MCP process execution is "
                    "disabled until an explicit permission/tool gateway is added."
                ),
            },
        }

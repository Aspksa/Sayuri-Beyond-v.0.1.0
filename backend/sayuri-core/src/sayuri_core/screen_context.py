from __future__ import annotations

import threading
from typing import Any

from .schemas import ScreenContextRequest
from .storage import utc_now


class ScreenContextRegistry:
    """Ephemeral UI context.

    Screen state helps Sayuri understand what the user is looking at, but it is
    deliberately not promoted into long-term memory or SQLite facts.
    """

    def __init__(self, max_sessions: int = 256) -> None:
        self.max_sessions = max_sessions
        self._lock = threading.RLock()
        self._sessions: dict[str, dict[str, Any]] = {}

    def update(self, request: ScreenContextRequest) -> dict[str, Any]:
        snapshot = {
            "session_id": request.session_id,
            "route": request.route,
            "title": request.title,
            "module": request.module,
            "selected_entity": request.selected_entity,
            "metadata": request.metadata,
            "updated_at": utc_now(),
        }
        with self._lock:
            self._sessions[request.session_id] = snapshot
            self._prune()
        return dict(snapshot)

    def _prune(self) -> None:
        if len(self._sessions) <= self.max_sessions:
            return
        ordered = sorted(
            self._sessions.items(),
            key=lambda item: item[1].get("updated_at", ""),
        )
        for session_id, _ in ordered[: len(self._sessions) - self.max_sessions]:
            self._sessions.pop(session_id, None)

    def snapshot(self, session_id: str) -> dict[str, Any] | None:
        with self._lock:
            item = self._sessions.get(session_id)
            return dict(item) if item else None

    def status(self) -> dict[str, Any]:
        with self._lock:
            return {
                "active_sessions": len(self._sessions),
                "max_sessions": self.max_sessions,
                "persistent": False,
            }

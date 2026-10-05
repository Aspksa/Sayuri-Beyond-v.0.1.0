from __future__ import annotations

from typing import Any

from .storage import SQLiteStore


class CognitiveTimeline:
    """User-safe operational timeline.

    It reports observable state/tool/runtime events and never exposes hidden
    chain-of-thought or private reasoning traces.
    """

    labels = {
        "task_started": "Задача получена",
        "plan_ready": "План подготовлен",
        "action_started": "Выполнение начато",
        "verification_completed": "Проверка завершена",
        "learning_completed": "Обучающий цикл завершён",
        "task_completed": "Задача завершена",
        "runtime_failed": "Ошибка AI runtime",
    }

    def __init__(self, store: SQLiteStore) -> None:
        self.store = store

    def _cognitive_item(self, record: dict[str, Any]) -> dict[str, Any]:
        event = record.get("event", "cognitive_event")
        payload = record.get("payload") or {}
        allowed = {
            key: payload[key]
            for key in (
                "mode",
                "verification_required",
                "step_count",
                "passed",
                "decision",
                "confidence",
                "blockers",
            )
            if key in payload
        }
        return {
            "id": record.get("id"),
            "created_at": record.get("created_at"),
            "category": "cognitive",
            "event": event,
            "label": self.labels.get(event, event.replace("_", " ").title()),
            "task_id": record.get("task_id"),
            "details": allowed,
        }

    def list(self, task_id: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []

        for record in self.store.list_events("cognitive_event", limit=250):
            if task_id and record.get("task_id") != task_id:
                continue
            items.append(self._cognitive_item(record))

        for record in self.store.list_events("runtime_call", limit=100):
            if task_id and record.get("task_id") != task_id:
                continue
            items.append(
                {
                    "id": record.get("id"),
                    "created_at": record.get("created_at"),
                    "category": "runtime",
                    "event": "runtime_call",
                    "label": "AI runtime ответил",
                    "task_id": record.get("task_id"),
                    "details": {
                        key: record.get(key)
                        for key in (
                            "provider",
                            "model",
                            "elapsed_ms",
                            "answer_chars",
                            "success",
                        )
                        if key in record
                    },
                }
            )

        for record in self.store.list_events("chat_turn", limit=100):
            if task_id and record.get("task_id") != task_id:
                continue
            items.append(
                {
                    "id": record.get("id"),
                    "created_at": record.get("created_at"),
                    "category": "chat",
                    "event": "chat_turn",
                    "label": "Ответ передан в чат",
                    "task_id": record.get("task_id"),
                    "details": {
                        key: record.get(key)
                        for key in (
                            "route",
                            "provider",
                            "verification_passed",
                            "memory_references",
                        )
                        if key in record
                    },
                }
            )

        items.sort(key=lambda item: item.get("created_at") or "", reverse=True)
        return items[: max(1, min(limit, 200))]

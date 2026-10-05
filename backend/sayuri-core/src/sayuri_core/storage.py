from __future__ import annotations

import json
import re
import sqlite3
import threading
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


class SQLiteStore:
    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        self._conn = sqlite3.connect(self.path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        with self._lock:
            self._conn.execute("PRAGMA journal_mode=WAL")
            self._conn.execute("PRAGMA foreign_keys=ON")
            self._conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS events (
                    id TEXT PRIMARY KEY, kind TEXT NOT NULL,
                    created_at TEXT NOT NULL, payload TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_events_kind_created
                ON events(kind, created_at DESC);

                CREATE TABLE IF NOT EXISTS strategies (
                    id TEXT PRIMARY KEY, strategy_key TEXT NOT NULL,
                    version INTEGER NOT NULL, score REAL NOT NULL,
                    confidence REAL NOT NULL, status TEXT NOT NULL,
                    created_at TEXT NOT NULL, payload TEXT NOT NULL,
                    UNIQUE(strategy_key, version)
                );
                CREATE TABLE IF NOT EXISTS strategy_usage (
                    strategy_key TEXT PRIMARY KEY,
                    uses INTEGER NOT NULL DEFAULT 0,
                    failures INTEGER NOT NULL DEFAULT 0,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS facts (
                    id TEXT PRIMARY KEY, entity TEXT NOT NULL,
                    attribute TEXT NOT NULL, value TEXT NOT NULL,
                    confidence REAL NOT NULL, source TEXT NOT NULL,
                    active INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_facts_entity_attribute
                ON facts(entity, attribute, active);

                CREATE TABLE IF NOT EXISTS contradictions (
                    id TEXT PRIMARY KEY,
                    existing_fact_id TEXT NOT NULL,
                    new_fact_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(existing_fact_id) REFERENCES facts(id),
                    FOREIGN KEY(new_fact_id) REFERENCES facts(id)
                );
                CREATE TABLE IF NOT EXISTS hypotheses (
                    id TEXT PRIMARY KEY,
                    statement TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    status TEXT NOT NULL,
                    evidence TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                """
            )
            self._conn.commit()

    def add_event(self, kind: str, payload: dict[str, Any]) -> dict[str, Any]:
        record = {"id": str(uuid.uuid4()), "kind": kind, "created_at": utc_now(), **payload}
        with self._lock, self._conn:
            self._conn.execute(
                "INSERT INTO events(id, kind, created_at, payload) VALUES (?, ?, ?, ?)",
                (record["id"], kind, record["created_at"], json.dumps(record, ensure_ascii=False)),
            )
        return record

    def list_events(self, kind: str, limit: int = 100) -> list[dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT payload FROM events WHERE kind=? ORDER BY created_at DESC LIMIT ?",
                (kind, max(1, min(limit, 1000))),
            ).fetchall()
        return [json.loads(row["payload"]) for row in rows]

    def count_events(self, kind: str) -> int:
        with self._lock:
            row = self._conn.execute(
                "SELECT COUNT(*) AS count FROM events WHERE kind=?", (kind,)
            ).fetchone()
        return int(row["count"])

    def add_strategy(self, payload: dict[str, Any]) -> dict[str, Any]:
        record = {"id": str(uuid.uuid4()), "created_at": utc_now(), **payload}
        with self._lock, self._conn:
            self._conn.execute(
                """INSERT INTO strategies(
                    id,strategy_key,version,score,confidence,status,created_at,payload
                ) VALUES (?,?,?,?,?,?,?,?)""",
                (
                    record["id"], record["strategy_key"], record["version"],
                    record["score"], record["confidence"], record["status"],
                    record["created_at"], json.dumps(record, ensure_ascii=False),
                ),
            )
        return record

    def active_strategy(self, strategy_key: str) -> dict[str, Any] | None:
        with self._lock:
            row = self._conn.execute(
                """SELECT payload FROM strategies
                WHERE strategy_key=? AND status='active'
                ORDER BY version DESC LIMIT 1""",
                (strategy_key,),
            ).fetchone()
        return json.loads(row["payload"]) if row else None

    def update_strategy_status(self, strategy_id: str, status: str) -> None:
        with self._lock, self._conn:
            row = self._conn.execute(
                "SELECT payload FROM strategies WHERE id=?", (strategy_id,)
            ).fetchone()
            if row is None:
                raise KeyError(strategy_id)
            payload = json.loads(row["payload"])
            payload["status"] = status
            self._conn.execute(
                "UPDATE strategies SET status=?, payload=? WHERE id=?",
                (status, json.dumps(payload, ensure_ascii=False), strategy_id),
            )

    def list_strategies(self, limit: int = 200) -> list[dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT payload FROM strategies ORDER BY created_at DESC LIMIT ?",
                (max(1, min(limit, 1000)),),
            ).fetchall()
        return [json.loads(row["payload"]) for row in rows]

    def record_strategy_usage(self, strategy_key: str, success: bool) -> None:
        with self._lock, self._conn:
            self._conn.execute(
                """INSERT INTO strategy_usage(strategy_key,uses,failures,updated_at)
                VALUES (?,1,?,?)
                ON CONFLICT(strategy_key) DO UPDATE SET
                    uses=uses+1,
                    failures=failures+excluded.failures,
                    updated_at=excluded.updated_at""",
                (strategy_key, 0 if success else 1, utc_now()),
            )

    def strategy_usage(self) -> list[dict[str, Any]]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT strategy_key,uses,failures,updated_at FROM strategy_usage"
            ).fetchall()
        return [dict(row) for row in rows]

    def add_fact(self, entity: str, attribute: str, value: str, confidence: float, source: str):
        fact = {
            "id": str(uuid.uuid4()), "entity": entity, "attribute": attribute,
            "value": value, "confidence": confidence, "source": source,
            "active": True, "created_at": utc_now(),
        }
        contradictions = []
        with self._lock, self._conn:
            existing = self._conn.execute(
                """SELECT * FROM facts WHERE entity=? AND attribute=? AND active=1
                ORDER BY created_at DESC""", (entity, attribute)
            ).fetchall()
            self._conn.execute(
                """INSERT INTO facts(id,entity,attribute,value,confidence,source,active,created_at)
                VALUES (?,?,?,?,?,?,1,?)""",
                (fact["id"],entity,attribute,value,confidence,source,fact["created_at"]),
            )
            normalized = value.strip().casefold()
            for row in existing:
                if str(row["value"]).strip().casefold() == normalized:
                    continue
                contradiction = {
                    "id": str(uuid.uuid4()),
                    "existing_fact_id": row["id"],
                    "new_fact_id": fact["id"],
                    "status": "open",
                    "created_at": utc_now(),
                    "existing_value": row["value"],
                    "incoming_value": value,
                }
                self._conn.execute(
                    """INSERT INTO contradictions(
                    id,existing_fact_id,new_fact_id,status,created_at) VALUES (?,?,?,?,?)""",
                    (
                        contradiction["id"], contradiction["existing_fact_id"],
                        contradiction["new_fact_id"], "open", contradiction["created_at"],
                    ),
                )
                contradictions.append(contradiction)
        return fact, contradictions

    def list_contradictions(self):
        with self._lock:
            rows = self._conn.execute(
                """SELECT c.id,c.status,c.created_at,
                ef.entity,ef.attribute,ef.value AS existing_value,
                nf.value AS incoming_value
                FROM contradictions c
                JOIN facts ef ON ef.id=c.existing_fact_id
                JOIN facts nf ON nf.id=c.new_fact_id
                WHERE c.status='open' ORDER BY c.created_at DESC"""
            ).fetchall()
        return [dict(row) for row in rows]

    def add_hypothesis(self, statement: str, evidence: list[str], confidence: float):
        now = utc_now()
        record = {
            "id": str(uuid.uuid4()), "statement": statement, "evidence": evidence,
            "confidence": confidence, "status": "open",
            "created_at": now, "updated_at": now,
        }
        with self._lock, self._conn:
            self._conn.execute(
                """INSERT INTO hypotheses(
                id,statement,confidence,status,evidence,created_at,updated_at
                ) VALUES (?,?,?,?,?,?,?)""",
                (
                    record["id"], statement, confidence, "open",
                    json.dumps(evidence, ensure_ascii=False), now, now,
                ),
            )
        return record

    def update_hypothesis(self, hypothesis_id: str, status: str, confidence: float | None):
        with self._lock, self._conn:
            row = self._conn.execute(
                "SELECT * FROM hypotheses WHERE id=?", (hypothesis_id,)
            ).fetchone()
            if row is None:
                raise KeyError(hypothesis_id)
            new_confidence = row["confidence"] if confidence is None else confidence
            now = utc_now()
            self._conn.execute(
                "UPDATE hypotheses SET status=?,confidence=?,updated_at=? WHERE id=?",
                (status,new_confidence,now,hypothesis_id),
            )
        return {
            "id": hypothesis_id, "statement": row["statement"],
            "evidence": json.loads(row["evidence"]),
            "confidence": new_confidence, "status": status,
            "created_at": row["created_at"], "updated_at": now,
        }

    def list_hypotheses(self):
        with self._lock:
            rows = self._conn.execute(
                """SELECT id,statement,confidence,status,evidence,created_at,updated_at
                FROM hypotheses ORDER BY updated_at DESC"""
            ).fetchall()
        return [{**dict(row), "evidence": json.loads(row["evidence"])} for row in rows]

    @staticmethod
    def _search_tokens(query: str) -> list[str]:
        return sorted(
            {
                token
                for token in re.findall(
                    r"[^\\W_]+(?:-[^\\W_]+)*",
                    query.casefold(),
                    flags=re.UNICODE,
                )
                if len(token) >= 2
            }
        )

    def search_facts(self, query: str, limit: int = 8) -> list[dict[str, Any]]:
        tokens = self._search_tokens(query)
        if not tokens:
            return []
        with self._lock:
            rows = self._conn.execute(
                """SELECT id,entity,attribute,value,confidence,source,created_at
                FROM facts WHERE active=1
                ORDER BY confidence DESC, created_at DESC LIMIT 500"""
            ).fetchall()

        scored: list[tuple[int, float, dict[str, Any]]] = []
        for row in rows:
            item = dict(row)
            haystack = " ".join(
                str(item.get(key, ""))
                for key in ("entity", "attribute", "value", "source")
            ).casefold()
            score = sum(1 for token in tokens if token in haystack)
            if score:
                scored.append((score, float(item["confidence"]), item))

        scored.sort(key=lambda item: (item[0], item[1]), reverse=True)
        return [item[2] for item in scored[: max(1, min(limit, 50))]]

    def search_events(
        self,
        kind: str,
        query: str,
        limit: int = 8,
        scan_limit: int = 500,
    ) -> list[dict[str, Any]]:
        tokens = self._search_tokens(query)
        if not tokens:
            return []
        events = self.list_events(kind, limit=max(1, min(scan_limit, 1000)))
        scored: list[tuple[int, dict[str, Any]]] = []
        for event in events:
            haystack = json.dumps(event, ensure_ascii=False).casefold()
            score = sum(1 for token in tokens if token in haystack)
            if score:
                scored.append((score, event))
        scored.sort(
            key=lambda item: (item[0], item[1].get("created_at", "")),
            reverse=True,
        )
        return [item[1] for item in scored[: max(1, min(limit, 50))]]

    def count_facts(self) -> int:
        with self._lock:
            row = self._conn.execute("SELECT COUNT(*) AS count FROM facts").fetchone()
        return int(row["count"])

    def count_confirmed_hypotheses(self) -> int:
        with self._lock:
            row = self._conn.execute(
                "SELECT COUNT(*) AS count FROM hypotheses WHERE status='confirmed'"
            ).fetchone()
        return int(row["count"])

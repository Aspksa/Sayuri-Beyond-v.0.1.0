# Sayuri Core

Backend cognitive layer for **SAYURI BEYOND v0.1.0 — Awakening**.

## Engines

- **EvoAgentX 0.1.4** — workflow generation/evaluation and supervised evolution.
- **OpenCog Hyperon 0.2.10 / MeTTa** — symbolic logic and knowledge reasoning.
- **Sayuri Learning Layer** — our own persistent learning, teacher, reflection, strategy governance and knowledge checks.
- **MemRL 0.1.0** — optional episodic runtime reinforcement layer, pinned to a reviewed Git revision.

These engines are dependencies, not the identity of Sayuri. Sayuri-specific memory, verified knowledge, policies and experience remain in this repository.

## Cognitive loop

```text
Task result
   ↓
Evaluator
   ↓
Teacher
   ↓
Reflection
   ↓
Experience Memory
   ↓
Strategy Library
   ↓
Development Metrics
```

Strategy promotion currently requires all four gates:

- regression tests passed;
- safety tests passed;
- confidence >= 0.75;
- measurable quality gain over the active strategy.

Self-modifying source code remains disabled.

## MemRL evolution layer

Sayuri records each completed task as a reward-labelled episodic learning event.
MemRL is integrated behind a Sayuri-owned adapter:

- **shadow mode** — default until the production LLM and embedding providers are wired; reward episodes are stored locally and nothing is lost;
- **active mode** — a configured MemRL `MemoryService` can be bound and receives Q-value updates for retrieved memory IDs;
- MemRL never promotes a new Sayuri strategy on its own;
- strategy changes still require regression, safety, confidence and measurable quality gates;
- every promoted strategy can be rolled back to the latest superseded version.

Install the optional pinned MemRL layer after the base environment exists:

```powershell
./install.ps1
./install-evolution.ps1
```


## Persistence

Local persistence uses SQLite with WAL mode:

```text
backend/sayuri-core/data/sayuri.db
```

The database is excluded from Git.

## Knowledge layer

Facts are stored with confidence and source. A new value for the same entity + attribute does **not** silently overwrite the old value: Sayuri creates an open contradiction record.

Hypotheses are kept separate from facts and have explicit states:
`open`, `confirmed`, `rejected`.

## Development index

`GET /v1/development` returns a transparent operational learning-progress index based on quality, pass rate, accumulated experience, verified facts, active strategies and reflections. It is **not an IQ score** and not a claim of general intelligence.

## Windows installation

From `backend/sayuri-core`:

```powershell
./install.ps1
./run.ps1
```

## Main API

- `GET /health`
- `POST /v1/logic/evaluate`
- `GET /v1/evolution/status`
- `GET /v1/evolution/memrl`
- `GET /v1/evolution/episodes`
- `POST /v1/learning/complete-task`
- `GET /v1/memory/experiences`
- `POST /v1/strategies/candidates`
- `GET /v1/strategies`
- `POST /v1/strategies/{strategy_key}/rollback`
- `POST /v1/knowledge/facts`
- `GET /v1/knowledge/contradictions`
- `POST /v1/knowledge/hypotheses`
- `PATCH /v1/knowledge/hypotheses/{id}`
- `GET /v1/knowledge/hypotheses`
- `GET /v1/development`

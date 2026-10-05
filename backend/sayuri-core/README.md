# Sayuri Core

Backend cognitive layer for **SAYURI BEYOND v0.1.0 — Awakening**.

## Engines

- **EvoAgentX 0.1.4 + optimizer extras** — workflow generation, evaluation and supervised optimization.
- **OpenCog Hyperon 0.2.10 / MeTTa** — symbolic logic and knowledge reasoning.
- **Sayuri Learning Layer** — persistent learning, teacher, reflection, strategy governance and knowledge checks.
- **Evolution Lab** — controlled candidate generation, benchmark comparison and gated promotion.
- **MemRL 0.1.0** — optional episodic runtime reinforcement layer, pinned to a reviewed Git revision.

EvoAgentX optimizers available to the project include TextGrad, AFlow, MIPRO and EvoPrompt GA/DE. They are capability providers; they do not own Sayuri's identity, memory or promotion policy.

## Cognitive loop

```text
Task result
   ↓
Evaluator
   ↓
Teacher v2
   ↓
Reflection
   ↓
Experience Memory
   ↓
MemRL reward episode
   ↓
Evolution Gate
   ↓
Evolution Lab
   ├── candidate A
   ├── candidate B
   ├── candidate C
   └── candidate D
          ↓
Structured Benchmark Sandbox
          ↓
Strategy Library gates
          ↓
Development Metrics
```

## Evolution safety

The current sandbox does **not execute generated source code**. Candidate strategies are compared using explicit score vectors and must pass all of these gates:

- regression tests passed;
- safety tests passed;
- confidence >= 0.75;
- benchmark score improves by at least 0.01;
- Strategy Library accepts the candidate against the active version.

MemRL does not modify model weights and does not promote strategies by itself. It records reward-labelled episodic experience and, after a production MemRL `MemoryService` is connected, can update utility values for retrieved memories.

Self-modifying source code remains disabled. Every promoted strategy can be rolled back to the latest superseded version.

A future code-evolution sandbox must be a separate isolated process/container with a permission boundary and rollback.

## MemRL evolution layer

The MemRL adapter has two runtime states:

- **shadow mode** — safe default. Reward episodes are saved locally even when MemRL or the production LLM/embedding providers are not configured;
- **active mode** — a configured MemRL `MemoryService` is bound and receives reward/Q-value updates for memory IDs that actually participated in the task.

This separation lets SAYURI collect useful learning signals now without making the base installation or CI depend on the heavier MemRL stack.

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

Learning records include evaluations, teacher lessons, reflections, experiences, MemRL episodes, Evolution Gate decisions, strategy versions and rollback events.

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

The base installer installs EvoAgentX with its optimizer extras. MemRL remains optional and is installed with `install-evolution.ps1`.

## Main API

- `GET /health`
- `POST /v1/logic/evaluate`
- `GET /v1/evolution/status`
- `GET /v1/evolution/memrl`
- `GET /v1/evolution/episodes`
- `POST /v1/evolution/propose`
- `POST /v1/evolution/benchmark`
- `GET /v1/evolution/experiments`
- `POST /v1/learning/complete-task`
- `GET /v1/memory/experiences`
- `POST /v1/strategies/candidates`
- `POST /v1/strategies/{strategy_key}/rollback`
- `GET /v1/strategies`
- `POST /v1/knowledge/facts`
- `GET /v1/knowledge/contradictions`
- `POST /v1/knowledge/hypotheses`
- `PATCH /v1/knowledge/hypotheses/{id}`
- `GET /v1/knowledge/hypotheses`
- `GET /v1/development`

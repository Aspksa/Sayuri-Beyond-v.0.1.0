# Sayuri Core

Backend cognitive layer for **SAYURI BEYOND v0.1.0 — Awakening**.

## Engines

- **EvoAgentX 0.1.4 + optimizer extras** — workflow generation, evaluation and supervised optimization.
- **OpenCog Hyperon 0.2.10 / MeTTa** — symbolic logic and knowledge reasoning.
- **Sayuri Learning Layer** — persistent learning, teacher, reflection, strategy governance and knowledge checks.
- **Evolution Lab** — controlled candidate generation, benchmark comparison and gated promotion.

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

Self-modifying source code remains disabled.

A future code-evolution sandbox must be a separate isolated process/container with a permission boundary and rollback.

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

The installer now installs EvoAgentX with its optimizer extras.

## Main API

- `GET /health`
- `POST /v1/logic/evaluate`
- `GET /v1/evolution/status`
- `POST /v1/evolution/propose`
- `POST /v1/evolution/benchmark`
- `GET /v1/evolution/experiments`
- `POST /v1/learning/complete-task`
- `GET /v1/memory/experiences`
- `POST /v1/strategies/candidates`
- `GET /v1/strategies`
- `POST /v1/knowledge/facts`
- `GET /v1/knowledge/contradictions`
- `POST /v1/knowledge/hypotheses`
- `PATCH /v1/knowledge/hypotheses/{id}`
- `GET /v1/knowledge/hypotheses`
- `GET /v1/development`

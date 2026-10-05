# Sayuri Core

Backend cognitive layer for **SAYURI BEYOND v0.1.0 — Awakening**.

## Runtime split

Sayuri now uses two Python environments on purpose.

### 1. Lightweight Core — normal daily runtime

Contains:

- EvoAgentX base 0.1.4;
- Hyperon / MeTTa 0.2.10;
- FastAPI;
- Sayuri memory, learning, Teacher v2, knowledge and Evolution Lab governance.

Install:

```powershell
./install.ps1
./run.ps1
```

Environment:

```text
.venv/
```

This is the environment used by the normal chat/API process.

### 2. Evolution Worker — heavy optimizer runtime

Contains the official full EvoAgentX optional stack required by its optimizer import graph, including TextGrad, AFlow, MIPRO, EvoPrompt, RAG/tool dependencies and ML libraries.

Install only when evolution jobs are needed:

```powershell
./install-evolution.ps1
```

Environment:

```text
.venv-evolution/
```

This separation prevents heavy RAG/browser/ML dependencies from slowing ordinary Sayuri startup.

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

The normal Evolution Lab does **not execute generated source code**. Candidate strategies are compared using explicit score vectors and must pass:

- regression tests;
- safety tests;
- confidence >= 0.75;
- benchmark improvement >= 0.01;
- Strategy Library promotion policy.

Self-modifying source code remains disabled.

The heavy Evolution Worker is capability-isolated from the normal API process. Later, communication between Core and Worker will use an explicit job protocol rather than importing heavy optimizer modules into the chat process.

## Persistence

Local persistence uses SQLite with WAL mode:

```text
backend/sayuri-core/data/sayuri.db
```

The database is excluded from Git.

## Knowledge layer

Facts are stored with confidence and source. A new value for the same entity + attribute does **not** silently overwrite the old value: Sayuri creates an open contradiction record.

Hypotheses are separate from facts and use explicit states:
`open`, `confirmed`, `rejected`.

## Development index

`GET /v1/development` returns a transparent operational learning-progress index based on real local records. It is not an IQ score.

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

## Health checks

Lightweight Core:

```powershell
.\.venv\Scripts\python.exe -m sayuri_core.healthcheck
```

Heavy Evolution Worker:

```powershell
.\.venv-evolution\Scripts\python.exe -m sayuri_core.evolution_healthcheck
```

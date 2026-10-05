# Sayuri Core

Backend cognitive layer for **SAYURI BEYOND v0.1.0 — Awakening**.

## Runtime split

Sayuri uses two Python environments on purpose.

### 1. Lightweight Core — normal daily runtime

Contains:

- EvoAgentX base 0.1.4;
- Hyperon / MeTTa 0.2.10;
- FastAPI;
- Sayuri cognitive governor, planner and verifier;
- bounded working memory plus persistent cognitive events;
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

## Cognitive Core v0.1

The normal task lifecycle is now explicit and observable:

```text
Task
  ↓
Agent State: planning
  ↓
Cognitive Governor
  ├── fast_chain
  ├── deliberate_chain
  ├── tree
  └── guarded
  ↓
Planner
  ↓
Working Memory
  ↓
Tools / reasoning runtime
  ↓
Verifier
  ├── evidence
  ├── contradictions
  ├── tool failures
  ├── safety
  └── confidence
  ↓
Learning Engine
  ↓
Experience + Reflection + Teacher lessons
  ↓
Development Metrics
```

### Memory split

Working memory is intentionally short-lived and bounded:

- maximum 64 items per active task;
- maximum 128 active task buckets;
- cleared after completion by default;
- never treated as verified long-term knowledge.

Long-term records remain in SQLite:

- cognitive events;
- evaluations;
- reflections;
- experience;
- strategies;
- verified facts;
- contradictions;
- hypotheses.

This prevents temporary reasoning context from silently becoming permanent knowledge.

### Cognitive Governor

The governor selects reasoning depth from measurable task signals:

- low complexity + sufficient confidence → `fast_chain`;
- moderate complexity or tool use → `deliberate_chain`;
- contradictions or low confidence → `tree`;
- high-risk action → `guarded` and human confirmation required.

The governor does not expose hidden chain-of-thought. It returns an operational mode, reasons, verification requirements and allowed number of alternatives.

### Verifier

A result is blocked when any hard gate fails:

- safety gate;
- unresolved contradiction;
- tool failure;
- unchecked critical claim;
- confidence below the acceptance threshold.

Verification events are persisted for diagnostics and the future Cognitive Timeline UI.

## Learning loop

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

Cognitive lifecycle:

- `GET /v1/cognitive/status`
- `POST /v1/cognitive/prepare`
- `POST /v1/cognitive/verify`
- `POST /v1/cognitive/complete`

Learning and evolution:

- `POST /v1/learning/complete-task`
- `GET /v1/memory/experiences`
- `GET /v1/evolution/status`
- `POST /v1/evolution/propose`
- `POST /v1/evolution/benchmark`
- `GET /v1/evolution/experiments`

Logic, strategy and knowledge:

- `POST /v1/logic/evaluate`
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

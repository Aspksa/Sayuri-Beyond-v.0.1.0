# Sayuri Core

Backend cognitive layer for **SAYURI BEYOND v0.1.0 — Awakening**.

## Architecture

The normal Sayuri runtime stays lightweight:

- **EvoAgentX 0.1.4 base** — agent workflow primitives.
- **OpenCog Hyperon 0.2.10 / MeTTa** — symbolic logic and knowledge reasoning.
- **Sayuri Learning Layer** — evaluator, teacher, reflection, persistent experience and strategy governance.
- **MemRL Adapter** — records reward-labelled episodic experience in shadow mode without requiring MemRL in the normal runtime.
- **Evolution Lab** — controlled strategy proposal and benchmark flow.

Heavy evolution dependencies run in a separate environment created by `install-evolution.ps1`:

- EvoAgentX `[all]` optimizer stack;
- TextGrad, AFlow, MIPRO and EvoPrompt;
- MemRL 0.1.0 pinned to a reviewed Git revision.

## Cognitive loop

```text
Task result
   ↓
Evaluator
   ↓
Teacher / Reflection
   ↓
Experience Memory
   ↓
MemRL-compatible reward episode
   ↓
Sayuri Evolution Gate
   ├── verified success → reinforce experience
   └── weak/failing task → improvement candidate
                         ↓
                   Evolution Lab
                   ├── candidate A
                   ├── candidate B
                   ├── candidate C
                   └── candidate D
                          ↓
                Structured Benchmark Sandbox
                          ↓
                Strategy Library safety gates
                          ↓
                 promote or reject
                          ↓
                 versioned rollback
```

## MemRL modes

The normal core does **not** import or require the MemRL package.

- **Shadow mode**: every completed task can already be stored as a reward-labelled episode with evidence, confidence, errors, lessons and retrieved memory IDs.
- **Evolution Worker mode**: MemRL is installed in `.venv-evolution` and is ready for provider binding. Once the production LLM and embedding providers are wired, the adapter can forward rewards to MemRL's `MemoryService.update_values()`.

This keeps normal chat startup fast while preserving learning signals for later reinforcement.

## Evolution safety

Self-modifying source code remains disabled.

A strategy is not trusted just because a model proposed it. Promotion remains behind explicit regression, safety, confidence and quality-improvement gates. The MemRL layer never promotes strategies by itself.

Every promoted strategy can be rolled back atomically to the previous verified version.

## Persistence

Local persistence uses SQLite with WAL mode:

```text
backend/sayuri-core/data/sayuri.db
```

The database is excluded from Git. Stored learning records include evaluations, teacher lessons, reflections, experiences, MemRL episodes, Evolution Gate decisions, strategy versions and rollback events.

## Knowledge layer

Facts are stored with confidence and source. A conflicting value for the same entity + attribute creates an open contradiction instead of silently overwriting the earlier fact.

Hypotheses remain separate from facts and use explicit states: `open`, `confirmed`, `rejected`.

## Development index

`GET /v1/development` exposes transparent operational learning progress from verified local records. It is not an IQ score or a claim of general intelligence.

## Windows installation

Normal Sayuri runtime:

```powershell
./install.ps1
./run.ps1
```

Isolated Evolution Worker with heavy EvoAgentX optimizers + MemRL:

```powershell
./install-evolution.ps1
```

The worker uses its own `.venv-evolution` environment so the normal assistant stays light.

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

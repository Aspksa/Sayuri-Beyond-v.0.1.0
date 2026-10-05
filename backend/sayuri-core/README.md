# Sayuri Core

Backend cognitive layer for **SAYURI BEYOND v0.1.0 — Awakening**.

## Architecture

Sayuri now has three separated runtime layers so normal conversation stays fast and learning dependencies cannot destabilize the assistant.

### 1. Sayuri Core — normal runtime

- **EvoAgentX 0.1.4 base** — agent workflow primitives.
- **OpenCog Hyperon 0.2.10 / MeTTa** — symbolic logic and knowledge reasoning.
- **Sayuri Learning Layer** — evaluator, teacher, reflection, persistent experience and strategy governance.
- **MemRL Adapter** — records reward-labelled episodic experience in shadow mode without importing MemRL.
- **Evolution Gate** — decides whether verified experience reinforces the current strategy or becomes an improvement candidate.
- **Evolution Lab** — controlled strategy proposal and benchmark flow.

### 2. Evolution Worker — heavy EvoAgentX optimization

Installed in `.venv-evolution`:

- EvoAgentX `[all]`;
- TextGrad;
- AFlow;
- MIPRO;
- EvoPrompt GA / DE.

### 3. MemRL Worker — episodic reinforcement

Installed separately in `.venv-memrl` from `workers/memrl/requirements.txt`:

- MemRL 0.1.0;
- MemRL MemoryService;
- its MemoryOS/runtime dependencies.

The MemRL worker does **not install the `sayuri-core` package**, so EvoAgentX and its LiteLLM/OpenAI dependency chain never enter the MemRL environment.

The two heavy workers are intentionally separate. Their current transitive OpenAI SDK requirements are incompatible in one Python environment, so SAYURI does not force or bypass dependency resolution.

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

The normal core does **not** require the MemRL package.

- **Shadow mode** — every completed task can be stored immediately as a reward-labelled episode with evidence, confidence, errors, lessons and retrieved memory IDs.
- **MemRL Worker mode** — MemRL runs in its own environment and can later receive those episodes through Sayuri's adapter/service boundary.
- **Active reinforcement** — after the production LLM and embedding providers are connected, retrieved memory IDs can receive reward/Q-value updates through MemRL's `MemoryService.update_values()`.

No model weights are changed by this runtime learning layer.

## Evolution safety

Self-modifying source code remains disabled.

A strategy is never trusted merely because a model proposed it. Promotion remains behind explicit regression, safety, confidence and quality-improvement gates. MemRL cannot promote a strategy by itself.

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

Heavy EvoAgentX Evolution Worker:

```powershell
./install-evolution.ps1
```

MemRL reinforcement worker:

```powershell
./install-memrl.ps1
```

The workers use separate virtual environments so the normal assistant stays lightweight and dependency-safe.

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

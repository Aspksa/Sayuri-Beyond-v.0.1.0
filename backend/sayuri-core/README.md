# Sayuri Core

Backend cognitive layer for **SAYURI BEYOND v0.1.0 — Awakening**.

## Installed engines

- **EvoAgentX 0.1.4** — agent workflows, evaluation and future evolution loops.
- **OpenCog Hyperon 0.2.10 / MeTTa** — symbolic logic and knowledge reasoning.

These are dependencies, not the identity of Sayuri. Sayuri-specific memory, policies, personality, evaluation criteria and learned experience live in this repository.

## Windows installation

From `backend/sayuri-core`:

```powershell
./install.ps1
./run.ps1
```

The installer creates a local Python 3.12 virtual environment at `.venv` and installs Sayuri Core plus the two engines.

## Manual installation

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
sayuri-core-health
sayuri-core
```

API defaults to `http://127.0.0.1:8765`.

## Initial API

- `GET /health`
- `GET /v1/evolution/status`
- `POST /v1/logic/evaluate`

Self-modifying code is intentionally **not enabled** at this stage. Evolution first operates on workflows, prompts, strategies and evaluations with explicit checkpoints.

#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
python3.12 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
python -m sayuri_core.healthcheck

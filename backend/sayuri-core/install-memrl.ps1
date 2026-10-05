$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Here

Write-Host "SAYURI MemRL Worker: creating isolated Python 3.12 environment..."

if (Get-Command py -ErrorAction SilentlyContinue) {
    & py -3.12 -m venv .venv-memrl
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    & python -m venv .venv-memrl
} else {
    throw "Python 3.12 was not found."
}

$Python = Join-Path $Here ".venv-memrl\Scripts\python.exe"

& $Python -m pip install --upgrade pip
& $Python -m pip install -e ".[memrl]"

Write-Host ""
Write-Host "Running MemRL Worker health check..."
& $Python -m sayuri_core.memrl_healthcheck

Write-Host ""
Write-Host "SAYURI MemRL Worker installed successfully."
Write-Host "This environment is isolated from EvoAgentX because their OpenAI SDK dependency ranges currently conflict."

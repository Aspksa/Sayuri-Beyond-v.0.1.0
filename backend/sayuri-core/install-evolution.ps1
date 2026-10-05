$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Here

Write-Host "SAYURI Evolution Worker: creating isolated Python 3.12 environment..."

if (Get-Command py -ErrorAction SilentlyContinue) {
    & py -3.12 -m venv .venv-evolution
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    & python -m venv .venv-evolution
} else {
    throw "Python 3.12 was not found."
}

$Python = Join-Path $Here ".venv-evolution\Scripts\python.exe"

& $Python -m pip install --upgrade pip
& $Python -m pip install -e ".[evolution]"

Write-Host ""
Write-Host "Running Evolution Worker optimizer health check..."
& $Python -m sayuri_core.evolution_healthcheck

Write-Host ""
Write-Host "SAYURI Evolution Worker installed successfully."
Write-Host "This environment is used only for heavy optimization/evolution jobs."

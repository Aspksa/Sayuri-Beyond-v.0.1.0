$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Here

Write-Host "SAYURI Core: creating Python 3.12 environment..."

if (Get-Command py -ErrorAction SilentlyContinue) {
    & py -3.12 -m venv .venv
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    & python -m venv .venv
} else {
    throw "Python 3.12 was not found."
}

$Python = Join-Path $Here ".venv\Scripts\python.exe"

& $Python -m pip install --upgrade pip
& $Python -m pip install -e ".[dev]"

Write-Host ""
Write-Host "Running Sayuri Core health check..."
& $Python -m sayuri_core.healthcheck

Write-Host ""
Write-Host "SAYURI Core installed successfully."

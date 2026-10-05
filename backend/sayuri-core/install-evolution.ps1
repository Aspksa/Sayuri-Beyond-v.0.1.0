$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Here

$Python = Join-Path $Here ".venv\Scripts\python.exe"

if (-not (Test-Path $Python)) {
    throw "Virtual environment is missing. Run .\install.ps1 first."
}

Write-Host "SAYURI Core: installing pinned MemRL evolution extra..."
& $Python -m pip install -e ".[evolution]"

Write-Host ""
Write-Host "Checking MemRL package..."
& $Python -c "import memrl; print('MemRL import: OK')"

Write-Host ""
Write-Host "MemRL evolution extra installed."

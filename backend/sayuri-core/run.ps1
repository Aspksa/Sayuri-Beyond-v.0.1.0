$ErrorActionPreference = "Stop"
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = Join-Path $Here ".venv\Scripts\python.exe"

if (-not (Test-Path $Python)) {
    throw "Virtual environment is missing. Run .\install.ps1 first."
}

Set-Location $Here
& $Python -m sayuri_core

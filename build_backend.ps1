# Build script for packaging the Python backend using PyInstaller
# This script bundles the FastAPI application and ML models for the Tauri sidecar

Write-Host "Building Python backend with PyInstaller..."
$ErrorActionPreference = "Stop"

# Ensure PyInstaller is installed
.\src-python\venv\Scripts\pip install pyinstaller

# Build the executable
# --onefile: Create a single executable
# --name: Name of the executable (must match what Tauri expects, e.g. docmind-engine-x86_64-pc-windows-msvc.exe)
# --add-data: Include any necessary non-python files (like the llama model, paddle models, etc.)
# Note: For the MVP, we assume models are placed in 'models' folder next to the executable after installation.

$TauriSidecarName = "docmind-engine-x86_64-pc-windows-msvc"

.\src-python\venv\Scripts\pyinstaller --noconfirm --onefile --console `
    --name $TauriSidecarName `
    --distpath .\src-tauri\bin `
    --workpath .\build `
    --clean `
    .\src-python\main.py

Write-Host "Build complete! Sidecar executable placed in src-tauri\bin\$TauriSidecarName.exe"

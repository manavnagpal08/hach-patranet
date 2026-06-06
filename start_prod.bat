@echo off
echo ===========================================
echo Starting Patranet Production Server
echo ===========================================

REM Ensure we are in the project root directory
cd /d "%~dp0"

REM Check if dist exists
if not exist "dist\" (
    echo Error: Frontend 'dist' directory not found!
    echo Please run 'npm run build' first.
    pause
    exit /b 1
)

REM Activate virtual environment if it exists, otherwise just run python
if exist "src-python\venv\Scripts\activate.bat" (
    call "src-python\venv\Scripts\activate.bat"
    python src-python\main.py
) else (
    python src-python\main.py
)

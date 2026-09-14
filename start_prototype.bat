@echo off
echo ====================================================================
echo   LAUNCHING HYDERABAD URBAN TRAFFIC INTELLIGENCE PLATFORM
echo ====================================================================
echo.
echo Starting FastAPI Backend Server on http://127.0.0.1:8000 ...
start "Urban Traffic API Backend" cmd /k "cd /d d:\sih127 && python start_backend.py"
echo.
echo Starting React Traffic Intelligence Dashboard on http://localhost:5173 ...
start "Urban Traffic React Dashboard" cmd /k "cd /d d:\sih127\frontend && npm run dev"
echo.
echo Both services launched successfully! Open http://localhost:5173 in your browser.

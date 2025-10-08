@echo off
echo Starting AI Note App Development Environment...

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd backend && venv\Scripts\activate && python -m app.main"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
pause

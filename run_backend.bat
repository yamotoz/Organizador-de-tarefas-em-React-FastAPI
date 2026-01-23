@echo off
echo Starting Backend Server...
cd backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload
pause

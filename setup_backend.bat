@echo off
echo Setting up Backend Environment...
cd backend
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
echo Installing dependencies...
.\venv\Scripts\python.exe -m pip install -r requirements.txt
echo Setup Complete!
pause

@echo off
echo ======================================================================
echo   Launching TestFusion - Integrated Software Testing Platform
echo   Technology Stack: Python Flask + SQLite + Pytest + Coverage.py
echo ======================================================================
echo.

cd /d "%~dp0"

echo 1. Checking Python dependencies...
python -m pip install -r requirements.txt --quiet

echo.
echo 2. Starting Flask Server on http://localhost:5000 ...
echo    Demo Credentials:
echo      Tester: tester / Tester@123
echo      Admin:  admin / Admin@123
echo.

start http://localhost:5000

python app.py
pause

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
echo    Default Credentials:
echo      Tester: tester / Tester@123
echo      Admin:  admin / Admin@123
echo.

:: Wait 2 seconds for Flask to bind port 5000, then open browser
start "" cmd /c "ping 127.0.0.1 -n 3 >nul && start http://localhost:5000"

python app.py
pause

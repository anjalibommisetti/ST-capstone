@echo off
echo ======================================================================
echo   Launching TestFusion - Integrated Software Testing Platform
echo   Technology Stack: Python Flask + SQLite + Pytest + Coverage.py
echo ======================================================================
echo.

cd /d "%~dp0"

echo Starting TestFusion Flask Server on http://localhost:5000 ...
echo Default Credentials:
echo   Tester: tester / Tester@123
echo   Admin:  admin / Admin@123
echo.

start http://localhost:5000

python app.py
pause

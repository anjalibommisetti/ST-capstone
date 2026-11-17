@echo off
echo ========================================================
echo   Launching TestFusion Full Platform (Backend + Frontend)
echo ========================================================

start "TestFusion Backend (Spring Boot :8080)" cmd /k "%~dp0run-backend.bat"
timeout /t 3 /nobreak >nul
start "TestFusion Frontend (Vite React :5173)" cmd /k "%~dp0run-frontend.bat"

echo.
echo Both servers are launching in separate windows!
echo Once started, open your browser at: http://localhost:5173
echo.
pause


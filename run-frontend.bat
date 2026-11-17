@echo off
echo ========================================================
echo   Starting TestFusion Vite Frontend (Port 5173)
echo ========================================================

cd /d "%~dp0frontend"
echo Launching React + Vite dev server...
call npm run dev
pause


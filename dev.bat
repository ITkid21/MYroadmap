@echo off
title StudyFlow - Local Development Server
echo ========================================================
echo         StudyFlow: Vite Dev Server (npm run dev)
echo ========================================================
echo.
cd /d "%~dp0"

echo Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system.
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo In the meantime, you can run StudyFlow right away by
    echo double-clicking 'start-studyflow.bat'!
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing dependencies first (npm install)...
    call npm install
)

echo Starting Vite dev server on http://localhost:3000 ...
call npm run dev
pause

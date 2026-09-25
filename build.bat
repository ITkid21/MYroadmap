@echo off
title StudyFlow - Production Builder
echo ========================================================
echo            StudyFlow: Production Build
echo ========================================================
echo.
cd /d "%~dp0"

echo Step 1: Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system.
    echo Please download and install Node.js from https://nodejs.org/ to use npm commands.
    echo.
    echo NOTE: You can already use the fully working StudyFlow app right now
    echo simply by double-clicking 'start-studyflow.bat' or opening 'StudyFlow.html'!
    echo.
    pause
    exit /b 1
)

echo Node.js is installed.
echo.

if not exist node_modules (
    echo Step 2: Installing project dependencies (npm install)...
    echo Please wait a moment while packages are downloaded...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b 1
    )
) else (
    echo Step 2: Dependencies are ready.
)

echo.
echo Step 3: Running Vite production build (npm run build)...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   BUILD SUCCESSFUL! Production bundle created in 'dist'
    echo ========================================================
    echo You can now deploy the 'dist' folder to Vercel, Netlify, or any hosting platform!
) else (
    echo.
    echo [ERROR] Build failed. Please inspect the message above.
)

echo.
pause

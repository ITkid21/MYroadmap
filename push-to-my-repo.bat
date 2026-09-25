@echo off
title Uploading StudyFlow to GitHub
echo ========================================================
echo   Uploading StudyFlow to:
echo   https://github.com/kartavyajain22052006-gif/study-tracker1
echo ========================================================
echo.
cd /d "%~dp0"

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed on this system.
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo Step 1: Preparing local repository...
if not exist ".git" (
    git init
)

git branch -M main

echo Step 2: Connecting to https://github.com/kartavyajain22052006-gif/study-tracker1.git ...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/kartavyajain22052006-gif/study-tracker1.git

echo Step 3: Staging all files and components...
git add .

echo Step 4: Committing project...
git commit -m "Upload StudyFlow personal study tracker complete application"

echo.
echo Step 5: Uploading all code to GitHub (main branch)...
echo (If a browser window appears, click Authorize/Sign In)
echo.
git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo      SUCCESS! All files are now live on GitHub!
    echo ========================================================
    echo Opening your repository in your browser...
    start https://github.com/kartavyajain22052006-gif/study-tracker1
) else (
    echo.
    echo [ERROR] Push encountered an issue. See details above.
)

echo.
pause

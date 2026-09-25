@echo off
title StudyFlow - Push to GitHub
echo ========================================================
echo               Push StudyFlow to GitHub
echo ========================================================
echo.
cd /d "%~dp0"

:: 1. Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your system PATH.
    echo Please download and install Git from: https://git-scm.com/
    echo During installation, keep the default options and restart this script.
    echo.
    pause
    exit /b 1
)

echo [OK] Git is detected on your system.
echo.

:: 2. Prompt for GitHub repository URL if remote is not set
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo Before proceeding, please create an empty repository on GitHub:
    echo 1. Go to https://github.com/new
    echo 2. Name your repository (e.g., studyflow)
    echo 3. Leave "Initialize with README" UNCHECKED
    echo 4. Click "Create repository"
    echo 5. Copy the HTTPS repository URL (e.g., https://github.com/username/studyflow.git)
    echo.
    set /p REPO_URL="Paste your GitHub repository URL here: "
)

if not defined REPO_URL (
    git remote get-url origin >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] No GitHub repository URL was provided.
        pause
        exit /b 1
    )
)

echo.
echo ========================================================
echo Initializing Git and preparing files...
echo ========================================================

:: Initialize repository if not already initialized
if not exist ".git" (
    git init
)

:: Set default branch to main
git branch -M main

:: Add or update remote
if defined REPO_URL (
    git remote remove origin >nul 2>nul
    git remote add origin %REPO_URL%
)

:: Stage all files
echo Staging files (respecting .gitignore)...
git add .

:: Commit
echo Creating commit...
git commit -m "Initial commit: StudyFlow Personal Study Tracker application"

echo.
echo Pushing to GitHub (main branch)...
echo (If prompted, log in via your browser window)...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo      SUCCESS! All code has been pushed to GitHub!
    echo ========================================================
    echo You can now refresh your GitHub repository page to see all your files.
    echo You can also connect this repository to Vercel for instant deployment!
) else (
    echo.
    echo [INFO] If the push was rejected because the repository already has commits,
    echo attempting to reconcile with: git push -u origin main --force
    echo.
    set /p FORCE_CHOICE="Do you want to overwrite the remote repository? (y/n): "
    if /i "%FORCE_CHOICE%"=="y" (
        git push -u origin main --force
    )
)

echo.
pause

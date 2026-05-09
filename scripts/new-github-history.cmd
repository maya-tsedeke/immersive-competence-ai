@echo off
REM Nuclear option: ONE new commit, no old objects. Requires .git to be removed before git init.
REM If you see "Reinitialized existing Git repository" without renaming .git first, history was NOT cleared.
REM Run from CMD: scripts\new-github-history.cmd

setlocal EnableExtensions
set "REMOTE_URL=https://github.com/maya-tsedeke/immersive-competence-ai.git"

cd /d "%~dp0.."
if not exist "package.json" (
  echo ERROR: Run from immersive-competence-ai root ^(folder with package.json^).
  exit /b 1
)

echo.
echo This will DELETE or replace your current .git folder after backing it up as .git-backup-before-reset
echo ^(if that backup exists, it will be removed first^).
echo Close Cursor/IDE tabs for this repo if rename fails ^(OneDrive file locks^).
echo Press Ctrl+C to cancel, or
pause

if exist ".git-backup-before-reset" (
  echo Removing stale .git-backup-before-reset ...
  rmdir /s /q ".git-backup-before-reset"
  if exist ".git-backup-before-reset" (
    echo ERROR: Could not delete .git-backup-before-reset. Delete it manually, then rerun.
    exit /b 1
  )
)

if exist ".git" (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Rename-Item -LiteralPath '.git' -NewName '.git-backup-before-reset' -ErrorAction Stop"
  if errorlevel 1 (
    echo ERROR: Could not rename .git. Close apps using this repo, retry, or rename .git manually in Explorer.
    exit /b 1
  )
)

if exist ".git" (
  echo ERROR: .git still exists after rename. Aborting.
  exit /b 1
)

git init
git rev-parse HEAD >nul 2>&1
if %errorlevel% equ 0 (
  echo ERROR: .git still has a HEAD ^(reused old history^). The .git folder was not reset. Aborting.
  exit /b 1
)

git branch -M master
git remote remove origin 2>nul
git remote add origin "%REMOTE_URL%"
git add -A

REM Fail if known huge paths slipped into the index (.gitignore must block them)
git ls-files | findstr /i /c:"studentVle.csv" /c:"dialogue_features.csv" /c:"ml.zip" /c:"oulad_extracted" /c:"dialogue_extracted" >nul 2>&1
if %errorlevel% equ 0 (
  echo ERROR: Large or raw ML paths are still staged. Check .gitignore and run: git status
  git ls-files | findstr /i /c:"ml/data/"
  exit /b 1
)

git status
git commit -m "Initial commit: Immersive Competence AI (ML data local-only per .gitignore)"

echo Verifying pack does not balloon ^(expect well under 100 MB total for a fresh tree^) ...
git count-objects -vH

git push -u origin master --force-with-lease
if errorlevel 1 (
  echo Push failed.
  exit /b 1
)

echo.
echo Push OK. You may delete folder: .git-backup-before-reset
exit /b 0

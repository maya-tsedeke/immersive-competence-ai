@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Same flow as complete-github-repo.ps1 — use this when Git works in CMD but not PowerShell.
set "REMOTE_URL=https://github.com/maya-tsedeke/immersive-competence-ai.git"

cd /d "%~dp0.."
if not exist "package.json" (
  echo ERROR: package.json missing. Open CMD in the immersive-competence-ai folder ^(parent of scripts^).
  exit /b 1
)
echo Repository root: %CD%

if not exist ".git" git init

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin "!REMOTE_URL!"
) else (
  git remote set-url origin "!REMOTE_URL!"
)

git branch -M master

git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Add Immersive Competence AI Next.js prototype (UEF / ThingLink-style demo)"
)

git fetch origin master 2>nul
if errorlevel 1 goto :do_push

set "LOCAL_REV="
set "REMOTE_REV="
for /f "usebackq delims=" %%L in (`git rev-parse master 2^>nul`) do set "LOCAL_REV=%%L"
for /f "usebackq delims=" %%R in (`git rev-parse origin/master 2^>nul`) do set "REMOTE_REV=%%R"

if not defined LOCAL_REV goto :do_push
if not defined REMOTE_REV goto :do_push
if "!LOCAL_REV!"=="!REMOTE_REV!" goto :do_push

echo Merging remote history (e.g. initial README) with local project...
git pull origin master --allow-unrelated-histories --no-edit
if errorlevel 1 (
  echo Merge had issues. Fix conflicts, then: git commit ^&^& git push -u origin master
  exit /b 1
)

:do_push
git push -u origin master
if errorlevel 1 (
  echo Push failed. Try: git pull origin master --rebase ^&^& git push -u origin master
  exit /b 1
)
echo Done. Remote: !REMOTE_URL!
exit /b 0

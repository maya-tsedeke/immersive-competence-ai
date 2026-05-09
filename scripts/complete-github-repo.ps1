# Connect this folder to GitHub and push the full Immersive Competence AI project.
# Prerequisite: Git for Windows installed, GitHub auth (HTTPS: credential manager or PAT).
#
# Usage — from repo root:
#   PowerShell:  .\scripts\complete-github-repo.ps1
#   CMD:         scripts\complete-github-repo.cmd   (if Git works in cmd but not Windows PowerShell)
#
# If GitHub already has a "first commit" (README only), this script merges it with
# --allow-unrelated-histories. Resolve conflicts in README if prompted, then push again.

$ErrorActionPreference = "Stop"
$RemoteUrl = "https://github.com/maya-tsedeke/immersive-competence-ai.git"

$gitCmdDirs = @(
    "$env:ProgramFiles\Git\cmd",
    "${env:ProgramFiles(x86)}\Git\cmd",
    "$env:LocalAppData\Programs\Git\cmd"
)
foreach ($d in $gitCmdDirs) {
    if ($d -and (Test-Path (Join-Path $d "git.exe"))) {
        $env:Path = "$d;$env:Path"
        break
    }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git not found in PATH. Install Git for Windows and restart the terminal: https://git-scm.com/download/win"
    exit 1
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path (Join-Path $root "package.json"))) {
    Write-Error "Run this script from the immersive-competence-ai repo root (package.json missing)."
    exit 1
}

Write-Host "Repository root: $root"

if (-not (Test-Path ".git")) {
    git init
}

$hasOrigin = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    git remote set-url origin $RemoteUrl
} else {
    git remote add origin $RemoteUrl
}

git branch -M master

# Stage everything (respects .gitignore — node_modules, .next, out excluded)
git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "Nothing to commit (tree clean)."
} else {
    git commit -m "Add Immersive Competence AI Next.js prototype (UEF / ThingLink-style demo)"
}

# Remote may already have the GitHub UI 'first commit'
git fetch origin master 2>$null
if ($LASTEXITCODE -eq 0) {
    $local = git rev-parse master 2>$null
    $remote = git rev-parse origin/master 2>$null
    if ($local -and $remote -and ($local -ne $remote)) {
        Write-Host "Merging remote history (e.g. initial README) with local project..."
        git pull origin master --allow-unrelated-histories --no-edit
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Merge had issues. Fix conflicts, then: git commit && git push -u origin master"
            exit 1
        }
    }
}

git push -u origin master
if ($LASTEXITCODE -eq 0) {
    Write-Host "Done. Remote: $RemoteUrl"
} else {
    Write-Warning "Push failed. Try: git pull origin master --rebase && git push -u origin master"
    exit 1
}

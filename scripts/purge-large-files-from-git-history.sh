#!/usr/bin/env bash
# Run in Git Bash (Git for Windows). Removes large paths from *all* commits so GitHub accepts the push.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Purging ml/data/raw, ml/data/processed, and root zip archives from git history..."
echo "Press Ctrl+C to cancel within 5 seconds."
sleep 5

export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch --force --index-filter \
  "git rm -rf --cached --ignore-unmatch ml/data/processed ml/data/raw ml.zip ml/src.zip src.zip \"src (2).zip\"" \
  --prune-empty HEAD

git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Done. Verify: git push -u origin master --force-with-lease"
echo "(Use --force-with-lease only if you are sure no one else pushed to master.)"

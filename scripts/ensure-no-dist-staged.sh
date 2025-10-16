#!/usr/bin/env bash
set -uo pipefail

CHANGED_FILES=$(git diff --cached --name-only --diff-filter=AM)

if [ -z "$CHANGED_FILES" ]; then
  exit 0
fi

if echo "$CHANGED_FILES" | grep -q '^dist/'; then
  echo "\033[31mError:\033[0m The dist/ folder must not be committed. It is generated automatically during merges to dev or main." >&2
  echo "Please remove the dist/ files from the commit and try again." >&2
  exit 1
fi

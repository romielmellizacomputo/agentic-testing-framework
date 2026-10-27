#!/usr/bin/env bash
# Runs agent-written unit-test drafts (unit-drafts/) against a throwaway copy of your app repo.
# The real repo is only read (rsync source + node_modules symlink); nothing is written into it.
#
# Usage:  APP_REPO=~/my-app bash tools/unit-sandbox.sh [name-filter]
# Env:    APP_REPO (required)  SANDBOX (default ~/.agentic-testing-sandbox)
#         TEST_CMD (default: npx jest --ci)   NODE_VERSION (optional, used with nvm)
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${APP_REPO:?Set APP_REPO to your app checkout}"
SANDBOX="${SANDBOX:-$HOME/.agentic-testing-sandbox}"
FILTER="${1:-}"
TEST_CMD="${TEST_CMD:-npx jest --ci}"

[ -d "$REPO" ] || { echo "App repo not found: $REPO"; exit 1; }
case "$SANDBOX" in "$REPO"|"$REPO"/*|"/"|"$HOME") echo "Unsafe SANDBOX location: $SANDBOX"; exit 1;; esac

mapfile -t DRAFTS < <(cd "$HERE/unit-drafts" && find . -type f \( -name '*.spec.*' -o -name '*.test.*' \) | sed 's#^\./##' | grep -i -- "$FILTER" || true)
[ ${#DRAFTS[@]} -gt 0 ] || { echo "No drafts in unit-drafts/ matching '$FILTER'"; exit 1; }

echo "Syncing $REPO -> $SANDBOX (no .git, no node_modules)"
mkdir -p "$SANDBOX"
rsync -a --delete --exclude node_modules --exclude .git --exclude coverage --exclude .env --exclude '.env.*' "$REPO/" "$SANDBOX/"
[ -d "$REPO/node_modules" ] && ln -sfn "$REPO/node_modules" "$SANDBOX/node_modules"

for d in "${DRAFTS[@]}"; do mkdir -p "$SANDBOX/$(dirname "$d")"; cp "$HERE/unit-drafts/$d" "$SANDBOX/$d"; done

if [ -n "${NODE_VERSION:-}" ] && [ -s "$HOME/.nvm/nvm.sh" ]; then . "$HOME/.nvm/nvm.sh" >/dev/null; nvm use "$NODE_VERSION" >/dev/null; fi
echo "Node $(node -v) - running ${#DRAFTS[@]} draft(s)"
cd "$SANDBOX"
# shellcheck disable=SC2086
$TEST_CMD "${DRAFTS[@]}"

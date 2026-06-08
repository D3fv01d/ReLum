#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_PORT="${VERIFY_SERVER_PORT:-18080}"
SERVER_LOG="${TMPDIR:-/tmp}/relum-verify-server.log"

cd "$ROOT_DIR"

echo "==> Checking diff whitespace"
git diff --check

echo "==> Building frontend"
npm run build

echo "==> Running frontend tests"
CI=true npm test -- --watchAll=false --passWithNoTests

echo "==> Auditing frontend production dependencies"
npm audit --omit=dev

echo "==> Auditing server production dependencies"
(cd server && npm audit --omit=dev)

echo "==> Checking backend JavaScript syntax"
find server/src -name '*.js' -print0 | xargs -0 -n 1 node --check

echo "==> Starting backend health probe on port ${SERVER_PORT}"
rm -f "$SERVER_LOG"
(cd server && PORT="$SERVER_PORT" node src/index.js >"$SERVER_LOG" 2>&1) &
server_pid=$!

cleanup() {
  if kill -0 "$server_pid" >/dev/null 2>&1; then
    kill "$server_pid" >/dev/null 2>&1 || true
    wait "$server_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

for _ in {1..20}; do
  if curl -fsS "http://localhost:${SERVER_PORT}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

curl -fsSI "http://localhost:${SERVER_PORT}/api/health" | grep -qi '^X-Request-Id:'
curl -sSI "http://localhost:${SERVER_PORT}/api/target/images" | grep -qi '^X-RateLimit-Limit:'

echo "==> Verification complete"

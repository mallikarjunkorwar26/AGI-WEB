#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd "$WORKSPACE_ROOT"

if ! command -v pnpm >/dev/null 2>&1; then
  printf '%s\n' "Error: pnpm is required. Install Node.js and pnpm, then run this script again." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  pnpm install --frozen-lockfile
fi

if [ ! -f .env ]; then
  printf '%s\n' "Error: .env is missing. Copy .env.example to .env and configure it first." >&2
  exit 1
fi

export DOTENV_CONFIG_PATH="${DOTENV_CONFIG_PATH:-$WORKSPACE_ROOT/.env}"

printf '%s\n' "Starting Atlant Global India API and website..."
printf '%s\n' "Website: http://localhost:19167"
printf '%s\n' "API:     http://localhost:3001"
printf '%s\n' "Press Ctrl+C to stop both services."

pnpm --parallel \
  --filter @workspace/api-server \
  --filter @workspace/atlant-global-india \
  run dev

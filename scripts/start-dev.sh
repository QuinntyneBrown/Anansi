#!/usr/bin/env bash
set -euo pipefail

# Anansi Development Launcher
# Starts database, API, and frontend in parallel

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

APP="studio-manager"
TOOLS=""

usage() {
  cat <<EOF

  Anansi Development Launcher
  ============================

  Usage: start-dev.sh [options]

  Options:
    --app <name>   Angular app to serve (default: studio-manager)
    --tools        Also start pgAdmin on port 5050
    --help         Show this help

  Apps: studio-manager, client-gallery, online-store,
        website-builder, booking-site, mobile-gallery

  Examples:
    ./scripts/start-dev.sh                          # db + api + studio-manager
    ./scripts/start-dev.sh --app client-gallery     # db + api + client-gallery
    ./scripts/start-dev.sh --tools                  # db + pgAdmin + api + studio-manager

EOF
  exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --app)   APP="$2"; shift 2 ;;
    --tools) TOOLS=1; shift ;;
    --help)  usage ;;
    *)       shift ;;
  esac
done

# Load .env if present
if [[ -f .env ]]; then
  set -a; source .env; set +a
fi

POSTGRES_USER="${POSTGRES_USER:-anansi}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill "${API_PID:-}" "${APP_PID:-}" 2>/dev/null || true
  wait "${API_PID:-}" "${APP_PID:-}" 2>/dev/null || true
  echo -e "${GREEN}API and frontend stopped. Database still running (use ./dev.sh down to stop).${NC}"
}
trap cleanup EXIT INT TERM

echo ""
echo -e "${BOLD}  ============================================${NC}"
echo -e "${BOLD}   Anansi Development Environment${NC}"
echo -e "${BOLD}  ============================================${NC}"
echo ""

# 1. Start Docker services
echo -e "${GREEN}[1/3] Starting PostgreSQL...${NC}"
if [[ -n "$TOOLS" ]]; then
  docker compose --profile tools up -d
  echo -e "      ${CYAN}pgAdmin: http://localhost:${PGADMIN_PORT:-5050}${NC}"
else
  docker compose up -d
fi

echo "      Waiting for PostgreSQL to be ready..."
until docker compose exec -T db pg_isready -U "$POSTGRES_USER" >/dev/null 2>&1; do
  sleep 2
done
echo -e "      ${GREEN}PostgreSQL ready on localhost:${POSTGRES_PORT}${NC}"
echo ""

# 2. Start API in background
echo -e "${GREEN}[2/3] Starting API (dotnet watch)...${NC}"
dotnet watch run --project src/Anansi.Api &
API_PID=$!
echo -e "      ${CYAN}API: http://localhost:5236${NC}"
echo ""

# 3. Wait briefly, then start Angular
sleep 3
echo -e "${GREEN}[3/3] Starting Angular app: ${APP}...${NC}"
cd src/Anansi.Web
npx ng serve "$APP" --open &
APP_PID=$!
cd "$ROOT_DIR"
echo -e "      ${CYAN}Frontend: http://localhost:4200${NC}"
echo ""

echo -e "${BOLD}  ============================================${NC}"
echo -e "   Database:  localhost:${POSTGRES_PORT}"
echo -e "   API:       http://localhost:5236"
echo -e "   Frontend:  http://localhost:4200 (${APP})"
[[ -n "$TOOLS" ]] && echo -e "   pgAdmin:   http://localhost:${PGADMIN_PORT:-5050}"
echo ""
echo -e "   Press ${BOLD}Ctrl+C${NC} to stop API and frontend."
echo -e "   Database keeps running (use ./dev.sh down)."
echo -e "${BOLD}  ============================================${NC}"
echo ""

# Wait for background processes
wait

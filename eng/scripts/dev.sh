#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

usage() {
  cat <<EOF
Anansi Development Helper

Usage: ./eng/scripts/dev.sh <command> [options]

Commands:
  up            Start PostgreSQL (and optionally pgAdmin)
  down          Stop all Docker services
  api           Run the .NET API with hot-reload
  app [name]    Serve an Angular app (default: studio-manager)
  status        Show status of Docker services
  db:reset      Drop and recreate the database
  logs          Tail database container logs

Apps: studio-manager, client-gallery, online-store,
      website-builder, booking-site, mobile-gallery

Examples:
  ./eng/scripts/dev.sh up                  # Start database
  ./eng/scripts/dev.sh up --tools          # Start database + pgAdmin
  ./eng/scripts/dev.sh api                 # Run API on http://localhost:5236
  ./eng/scripts/dev.sh app                 # Serve studio-manager on http://localhost:4200
  ./eng/scripts/dev.sh app client-gallery  # Serve client-gallery on http://localhost:4200
EOF
}

cmd_up() {
  echo -e "${GREEN}Starting PostgreSQL...${NC}"
  if [[ "${1:-}" == "--tools" ]]; then
    docker compose --profile tools up -d
    echo -e "${CYAN}pgAdmin available at http://localhost:${PGADMIN_PORT:-5050}${NC}"
  else
    docker compose up -d
  fi
  echo -e "${GREEN}PostgreSQL available at localhost:${POSTGRES_PORT:-5432}${NC}"
}

cmd_down() {
  echo -e "${YELLOW}Stopping all services...${NC}"
  docker compose --profile tools down
}

cmd_api() {
  echo -e "${GREEN}Starting API with hot-reload...${NC}"
  echo -e "${CYAN}API: http://localhost:5236${NC}"
  echo -e "${CYAN}OpenAPI: http://localhost:5236/openapi/v1.json${NC}"
  dotnet watch run --project src/Anansi.Api
}

cmd_app() {
  local app="${1:-studio-manager}"
  local valid_apps="studio-manager client-gallery online-store website-builder booking-site mobile-gallery"

  if ! echo "$valid_apps" | grep -qw "$app"; then
    echo -e "${YELLOW}Unknown app: $app${NC}"
    echo "Valid apps: $valid_apps"
    exit 1
  fi

  echo -e "${GREEN}Serving ${app}...${NC}"
  cd src/Anansi.Web
  npx ng serve "$app"
}

cmd_status() {
  docker compose ps
}

cmd_db_reset() {
  echo -e "${YELLOW}Dropping and recreating database...${NC}"
  docker compose exec db psql -U "${POSTGRES_USER:-anansi}" -c "DROP DATABASE IF EXISTS ${POSTGRES_DB:-anansi};"
  docker compose exec db psql -U "${POSTGRES_USER:-anansi}" -c "CREATE DATABASE ${POSTGRES_DB:-anansi};"
  echo -e "${GREEN}Database reset. Restart the API to re-run migrations.${NC}"
}

cmd_logs() {
  docker compose logs -f db
}

# Load .env if present
if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

case "${1:-}" in
  up)       shift; cmd_up "$@" ;;
  down)     cmd_down ;;
  api)      cmd_api ;;
  app)      shift; cmd_app "$@" ;;
  status)   cmd_status ;;
  db:reset) cmd_db_reset ;;
  logs)     cmd_logs ;;
  *)        usage ;;
esac

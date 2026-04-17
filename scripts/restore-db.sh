#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
SERVICE_NAME="${SERVICE_NAME:-postgres}"

usage() {
  echo "Usage: $0 <path-to-backup.dump> [--yes]"
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

BACKUP_FILE="$1"
AUTO_CONFIRM="${2:-}"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

if [[ "$AUTO_CONFIRM" != "--yes" ]]; then
  echo "This operation will overwrite database contents."
  read -r -p "Type RESTORE to continue: " confirm
  if [[ "$confirm" != "RESTORE" ]]; then
    echo "Restore cancelled."
    exit 1
  fi
fi

echo "Uploading backup into container..."
cat "$BACKUP_FILE" | docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  exec -T "$SERVICE_NAME" sh -lc 'cat > /tmp/restore.dump'

echo "Restoring database from dump..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  exec -T "$SERVICE_NAME" sh -lc 'PGPASSWORD="$POSTGRES_PASSWORD" pg_restore --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB" /tmp/restore.dump'

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  exec -T "$SERVICE_NAME" sh -lc 'rm -f /tmp/restore.dump'

echo "Restore completed."

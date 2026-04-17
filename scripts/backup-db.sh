#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
SERVICE_NAME="${SERVICE_NAME:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

timestamp="$(date +%Y%m%d_%H%M%S)"
backup_file="$BACKUP_DIR/vrc_quality_connect_${timestamp}.dump"

echo "Creating backup: $backup_file"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  exec -T "$SERVICE_NAME" sh -lc 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -F c' \
  > "$backup_file"

if [[ -n "$RETENTION_DAYS" ]]; then
  find "$BACKUP_DIR" -type f -name '*.dump' -mtime "+$RETENTION_DAYS" -delete
fi

echo "Backup completed: $backup_file"

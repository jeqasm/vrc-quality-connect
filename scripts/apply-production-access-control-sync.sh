#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKEND_SERVICE="${BACKEND_SERVICE:-backend}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
DB_USER="${DB_USER:-vrc_app}"
DB_NAME="${DB_NAME:-vrc_quality_connect}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_PATH="${SQL_PATH:-${SCRIPT_DIR}/sql/sync-access-control-catalog.sql}"

if [[ ! -f "${SQL_PATH}" ]]; then
  echo "SQL file not found: ${SQL_PATH}" >&2
  exit 1
fi

compose_cmd=(docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}")

echo "[1/4] Applying Prisma migrations..."
"${compose_cmd[@]}" exec -T "${BACKEND_SERVICE}" npx prisma migrate deploy

echo "[2/4] Running seed sync..."
if ! "${compose_cmd[@]}" exec -T "${BACKEND_SERVICE}" node dist/prisma/seed.js; then
  "${compose_cmd[@]}" exec -T "${BACKEND_SERVICE}" npm run prisma:seed
fi

echo "[3/4] Applying SQL sync fallback for access-control catalog..."
"${compose_cmd[@]}" exec -T "${POSTGRES_SERVICE}" \
  psql -v ON_ERROR_STOP=1 -U "${DB_USER}" -d "${DB_NAME}" -f - < "${SQL_PATH}"

echo "[4/4] Verifying activity-records permissions in DB..."
"${compose_cmd[@]}" exec -T "${POSTGRES_SERVICE}" \
  psql -U "${DB_USER}" -d "${DB_NAME}" \
  -c "select code from access_permissions where code like 'activity-records.%' order by code;"

echo "Access-control sync completed successfully."

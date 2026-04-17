# Production Access-Control Sync

This procedure syncs production database access-control data with the latest repository state.

## Included actions

1. Apply Prisma migrations (`prisma migrate deploy`)
2. Run seed sync (`node dist/prisma/seed.js` with `npm run prisma:seed` fallback)
3. Apply SQL fallback sync for access-control catalog and role/group permission mappings
4. Print verification query for `activity-records.*` permissions

## Server prerequisites

- Repository updated on server to the target release/tag
- `docker-compose.prod.yml` and `.env.production` are present
- Backend and Postgres services are running
- The script exists at `scripts/apply-production-access-control-sync.sh`

## Run on server

From project root:

```bash
chmod +x scripts/apply-production-access-control-sync.sh
./scripts/apply-production-access-control-sync.sh
```

Optional env overrides:

```bash
ENV_FILE=.env.production \
COMPOSE_FILE=docker-compose.prod.yml \
BACKEND_SERVICE=backend \
POSTGRES_SERVICE=postgres \
DB_USER=vrc_app \
DB_NAME=vrc_quality_connect \
./scripts/apply-production-access-control-sync.sh
```

## What this fixes for v0.3.0

- Ensures presence of:
  - `activity-records.qa.view`
  - `activity-records.support.view`
  - `activity-records.management.view`
- Ensures group assignments for department groups and report/activity tabs
- Synchronizes baseline role permissions for `employee` and `manager` to match current seed strategy

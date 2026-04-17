# Production Deployment Guide

This guide describes deployment on a Linux server with Docker and an existing reverse proxy.

## 1. Prerequisites

- Docker Engine + Docker Compose plugin installed
- Access to `ghcr.io` from the server
- Reverse proxy already running on the host (Nginx/Traefik/Caddy)

## 2. Files to place on server

Copy these files to the deployment directory, for example `/opt/vrc-quality-connect`:

- `docker-compose.prod.yml`
- `.env.production` (create from `.env.production.example`)
- `backend/.env.production` (create from `backend/.env.production.example`)

## 3. Prepare environment files

Create root env:

```bash
cp .env.production.example .env.production
```

Create backend env:

```bash
mkdir -p backend
cp backend/.env.production.example backend/.env.production
```

Fill real values in:

- `.env.production`: `APP_IMAGE_TAG`, `POSTGRES_*`
- `backend/.env.production`: `DATABASE_URL`, `FRONTEND_URL`, optional integration vars

## 4. Authenticate server in GHCR

Use a GitHub PAT with `read:packages`:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u jeqasm --password-stdin
```

## 5. First start

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

Backend runs migrations automatically on startup:

- `npm run prisma:migrate:deploy`

## 6. Reverse proxy routing

Route external traffic to local ports:

- frontend: `127.0.0.1:8080`
- backend API: `127.0.0.1:3000` (or `/api` to this port)

## 7. Release update

1. Update version in `.env.production`:
   - `APP_IMAGE_TAG=vX.Y.Z`
2. Pull and restart:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## 8. Rollback

1. Set previous image tag in `.env.production`
2. Restart stack:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## 9. Diagnostics

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f backend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f frontend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f postgres
```

## 10. Database backups

Run manual backup:

```bash
./scripts/backup-db.sh
```

Optional retention cleanup on each run (example: 14 days):

```bash
RETENTION_DAYS=14 ./scripts/backup-db.sh
```

Restore from backup (destructive):

```bash
./scripts/restore-db.sh ./backups/vrc_quality_connect_YYYYMMDD_HHMMSS.dump
```

Non-interactive restore:

```bash
./scripts/restore-db.sh ./backups/vrc_quality_connect_YYYYMMDD_HHMMSS.dump --yes
```

Example cron (daily at 03:00, keep 14 days):

```cron
0 3 * * * cd /opt/vrc-quality-connect && RETENTION_DAYS=14 ./scripts/backup-db.sh >> /var/log/vrc-quality-connect-backup.log 2>&1
```

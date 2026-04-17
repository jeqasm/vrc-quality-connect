# VRC Quality Connect - handoff for server administrator

## 1) Repository and release version

- Repository: `https://github.com/jeqasm/vrc-quality-connect`
- Release to deploy: `v0.2.2`

Clone and checkout:

```bash
sudo mkdir -p /opt/vrc-quality-connect
sudo chown "$USER":"$USER" /opt/vrc-quality-connect
git clone https://github.com/jeqasm/vrc-quality-connect.git /opt/vrc-quality-connect
cd /opt/vrc-quality-connect
git checkout v0.2.2
chmod +x scripts/*.sh
```

## 2) Required files on server

Create production env files from templates:

```bash
cp .env.production.example .env.production
mkdir -p backend
cp backend/.env.production.example backend/.env.production
```

Fill values:

- `.env.production`:
  - `APP_IMAGE_TAG=v0.2.2`
  - `POSTGRES_DB=...`
  - `POSTGRES_USER=...`
  - `POSTGRES_PASSWORD=...`
- `backend/.env.production`:
  - `PORT=3000`
  - `FRONTEND_URL=https://<domain>`
  - `DATABASE_URL=postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@postgres:5432/<POSTGRES_DB>?schema=public`
  - optional: `LICENSE_REGISTRY_SHEET_URL`, `LICENSE_REGISTRY_SHEET_NAME`

## 3) GHCR access

Use GitHub PAT with scope `read:packages`:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u jeqasm --password-stdin
```

## 4) Start / update application

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

Backend applies migrations on startup.

## 5) Reverse proxy routes

- `https://<domain>/` -> `127.0.0.1:8080` (frontend)
- `https://<domain>/api` -> `127.0.0.1:3000` (backend)

HTTPS/TLS stays on existing reverse proxy layer.

## 6) Post-deploy checks

```bash
curl -I http://127.0.0.1:8080
curl http://127.0.0.1:3000/api/health
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f backend
```

## 7) Database backups

Manual backup:

```bash
./scripts/backup-db.sh
```

Daily cron backup (03:00, keep 14 days):

```cron
0 3 * * * cd /opt/vrc-quality-connect && RETENTION_DAYS=14 ./scripts/backup-db.sh >> /var/log/vrc-quality-connect-backup.log 2>&1
```

Restore from backup:

```bash
./scripts/restore-db.sh ./backups/vrc_quality_connect_YYYYMMDD_HHMMSS.dump
```

## 8) Information expected from product owner (already prepared)

Please provide to administrator:

- domain name
- `GHCR_TOKEN` with `read:packages`
- final values for `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- final `FRONTEND_URL`
- optional license registry settings (`LICENSE_REGISTRY_SHEET_URL`, `LICENSE_REGISTRY_SHEET_NAME`)

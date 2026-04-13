$ErrorActionPreference = "Stop"

$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
  throw ".env file was not found at $envPath"
}

$databaseUrlLine = Get-Content $envPath | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
if (-not $databaseUrlLine) {
  throw "DATABASE_URL is missing in backend/.env"
}

$databaseUrl = $databaseUrlLine.Substring("DATABASE_URL=".Length).Trim('"')
$uri = [System.Uri]$databaseUrl

$dbUser = [System.Uri]::UnescapeDataString($uri.UserInfo.Split(':')[0])
$dbPassword = if ($uri.UserInfo.Contains(':')) { [System.Uri]::UnescapeDataString($uri.UserInfo.Split(':')[1]) } else { "" }
$dbName = $uri.AbsolutePath.TrimStart('/')

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$backupDir = Join-Path $projectRoot "backups"
if (-not (Test-Path $backupDir)) {
  New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "vrc_quality_connect_$timestamp.dump"
$backupPath = Join-Path $backupDir $backupFile
$containerFile = "/tmp/$backupFile"
$containerName = if ($env:VRC_DB_CONTAINER) { $env:VRC_DB_CONTAINER } else { "vrc-quality-connect-postgres" }

docker exec -e PGPASSWORD=$dbPassword $containerName pg_dump -h localhost -p 5432 -U $dbUser -d $dbName -F c -f $containerFile
docker cp "${containerName}:$containerFile" $backupPath
docker exec $containerName rm -f $containerFile | Out-Null

Write-Output "Backup created: $backupPath"

import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), '.env');

function readDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (!fs.existsSync(envPath)) {
    throw new Error(`.env file was not found at ${envPath}`);
  }

  const raw = fs.readFileSync(envPath, 'utf8');
  const line = raw
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.startsWith('DATABASE_URL='));

  if (!line) {
    throw new Error('DATABASE_URL is missing in backend/.env');
  }

  return line.slice('DATABASE_URL='.length).replace(/^"|"$/g, '');
}

function checkTcp(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 2000);

    socket.once('connect', () => {
      clearTimeout(timeout);
      socket.end();
      resolve(true);
    });

    socket.once('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

async function run() {
  const databaseUrl = readDatabaseUrl();
  const parsedUrl = new URL(databaseUrl);
  const dbHost = parsedUrl.hostname;
  const dbPort = Number(parsedUrl.port || '5432');
  const dbName = parsedUrl.pathname.replace(/^\//, '');
  const dbUser = decodeURIComponent(parsedUrl.username);
  const schema = parsedUrl.searchParams.get('schema') || 'public';

  console.log(`Database host: ${dbHost}`);
  console.log(`Database port: ${dbPort}`);
  console.log(`Database name: ${dbName}`);
  console.log(`Database user: ${dbUser}`);
  console.log(`Database schema: ${schema}`);

  const isReachable = await checkTcp(dbHost, dbPort);

  if (!isReachable) {
    console.error(`Database is not reachable on ${dbHost}:${dbPort}`);
    process.exit(1);
  }

  console.log(`Database is reachable on ${dbHost}:${dbPort}`);
}

void run();

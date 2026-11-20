const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables from .env or .env.local if present
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (_) {}

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = 
  process.env.DATABASE_URL || 
  process.env.DATABASE_PRISMA_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL_UNPOOLED || 
  '';

if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  if (schema.includes('provider = "sqlite"')) {
    schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema);
    console.log('[prisma-prepare] Switched datasource provider to postgresql for production.');
  }
} else {
  if (schema.includes('provider = "postgresql"')) {
    schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
    fs.writeFileSync(schemaPath, schema);
    console.log('[prisma-prepare] Switched datasource provider to sqlite for local development.');
  } else {
    console.log('[prisma-prepare] Using local sqlite datasource.');
  }
}

// In serverless environments (like Vercel), direct PostgreSQL port 5432 is often IPv6-only
// and unreachable from build runners. Only run prisma db push when explicitly requested with RUN_PRISMA_DB_PUSH=1.
if (process.env.VERCEL && process.env.RUN_PRISMA_DB_PUSH === '1') {
  try {
    console.log('[prisma-prepare] Running prisma db push on Vercel...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });
  } catch (e) {
    console.warn('[prisma-prepare] prisma db push note:', e.message);
  }
}

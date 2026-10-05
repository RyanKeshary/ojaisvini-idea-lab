const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  // In Vercel deployment with remote Postgres, sync tables
  if (process.env.VERCEL) {
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
} else {
  console.log('[prisma-prepare] Using local sqlite datasource.');
}

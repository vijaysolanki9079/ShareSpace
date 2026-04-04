import pkg from 'pg';
const { Client } = pkg;
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseEnvFile(content) {
  const out = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/** Mirror Next-style env layering: .env then .env.local; do not override existing process.env. */
function applyRepoEnvFiles() {
  const merged = {};
  for (const name of ['.env', '.env.local']) {
    const p = join(__dirname, name);
    if (fs.existsSync(p)) {
      Object.assign(merged, parseEnvFile(fs.readFileSync(p, 'utf8')));
    }
  }
  for (const [key, val] of Object.entries(merged)) {
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

applyRepoEnvFiles();

function createPgClient() {
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error(
      'Missing DATABASE_URL or DIRECT_URL. Set one in .env.local or the environment (same as lib/server-db.ts).'
    );
  }
  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';
  return new Client({
    connectionString,
    ssl: { rejectUnauthorized },
  });
}

async function runMigration() {
  const client = createPgClient();
  try {
    console.log('🔐 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    console.log('📖 Reading migration SQL...');
    const sqlPath = `${__dirname}/prisma/migrations/init/migration.sql`;
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    const statements = sql.split(';').filter((stmt) => stmt.trim());

    let success = 0;
    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          console.log(`⚡ ${stmt.trim().substring(0, 50)}...`);
          await client.query(stmt);
          success++;
        } catch (e) {
          if (!e.message.includes('already exists')) {
            console.error(`   ⚠️  ${e.message}`);
          } else {
            console.log(`   ℹ️  Table/Index already exists`);
            success++;
          }
        }
      }
    }

    console.log('\n✅ Migration executed successfully!');
    console.log(`📊 Statements executed: ${success}/${statements.length}`);
    console.log('📊 Tables ready:');
    console.log('   - User');
    console.log('   - NGO');
    console.log('   - Account');
    console.log('   - Session');
    console.log('   - VerificationToken');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

runMigration();

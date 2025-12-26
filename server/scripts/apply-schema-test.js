/*
  Apply DDL from server/database/schema.sql into a separate `test` schema
  so tests can run against isolated tables without touching public tables.
*/
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error('SUPABASE_DB_URL is not set in .env');
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  console.log('Preparing test schema...');
  // Create test schema and set search path so unqualified objects are created in test
  await pool.query("CREATE SCHEMA IF NOT EXISTS test");
  await pool.query("SET search_path TO test, public");

  console.log('Applying schema.sql into test schema (statements applied individually) ...');

  const rawStatements = sql.split(';');
  for (let i = 0; i < rawStatements.length; i++) {
    let stmt = rawStatements[i].trim();
    if (!stmt) continue;
    const lines = stmt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    if (lines.every(l => l.startsWith('--') || l.startsWith('/*') || l.startsWith('*/'))) continue;
    while (lines.length && (lines[0].startsWith('--') || lines[0].startsWith('/*') || lines[0].startsWith('*/'))) lines.shift();
    if (lines.length === 0) continue;
    stmt = lines.join('\n');
    const firstWord = (stmt.split(/\s+/)[0] || '').toUpperCase();
    const allowed = ['CREATE','INSERT','ALTER','DROP','COMMENT','GRANT','REVOKE','SET','DO','BEGIN','COMMIT','WITH'];
    if (!allowed.includes(firstWord)) {
      console.log('Skipping non-SQL chunk:', firstWord || '(empty)');
      continue;
    }
    try {
      await pool.query(stmt + ';');
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      if (/already exists|duplicate key value|violates unique constraint|relation ".*" already exists/i.test(msg)) {
        console.log('Skipping existing object or duplicate during apply:', msg.split('\n')[0]);
        continue;
      }
      console.error('Error applying statement:', stmt.slice(0, 200));
      throw err;
    }
  }

  // Seed resource_types and EAV attributes in test schema if possible
  try {
    await pool.query(`INSERT INTO resource_types (name, description) VALUES
      ('Laptop','Portable computers for students and faculty'),
      ('Projector','Classroom projectors and mounts'),
      ('Software License','Licensed software subscriptions')
      ON CONFLICT (name) DO NOTHING`);
  } catch (e) {
    console.log('Could not seed resource_types in test schema:', e.message);
  }

  try {
    await pool.query(`INSERT INTO eav_attributes (entity_type, attribute_name, data_type, is_searchable)
      VALUES ('resource','isSoftware','boolean',FALSE), ('resource','purchaseDate','datetime',FALSE), ('resource','warrantyUntil','datetime',FALSE)
      ON CONFLICT (entity_type, attribute_name) DO NOTHING`);
  } catch (e) {
    console.log('Could not seed eav_attributes in test schema:', e.message);
  }

  console.log('Test schema apply complete.');
}

main().catch(err => {
  console.error('Failed to apply test schema:', err);
  process.exit(1);
}).finally(() => pool.end());

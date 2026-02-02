import { connectDB, sql } from './config/database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

async function runMigration() {
  try {
    console.log('Connecting to database...');
    const pool = await connectDB();

    console.log('Reading 2FA migration file...');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const migrationPath = join(__dirname, 'migrations', 'add_2fa_toggle.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('Running 2FA migration...');
    const batches = migrationSQL.split(/^\s*GO\s*$/gim).filter(batch => batch.trim());

    for (const batch of batches) {
      if (batch.trim()) {
        await pool.request().query(batch);
      }
    }

    console.log('2FA migration completed successfully!');
    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
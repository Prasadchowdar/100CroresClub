import { connectDB, sql } from './config/database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

async function runMigration() {
  try {
    console.log('ðŸ”Œ Connecting to database...');
    const pool = await connectDB();

    console.log('ðŸ“„ Reading migration file...');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const migrationPath = join(__dirname, 'migrations', 'add_settings_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('ðŸš€ Running migration...');

    // Split by GO statements and execute each batch
    const batches = migrationSQL.split(/^\s*GO\s*$/gim).filter(batch => batch.trim());

    for (const batch of batches) {
      if (batch.trim()) {
        await pool.request().query(batch);
      }
    }

    console.log('âœ… Migration completed successfully!');
    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('âŒ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

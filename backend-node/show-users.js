import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sql = require('mssql');
const dotenv = require('dotenv');
dotenv.config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

sql.connect(config).then(pool => {
  return pool.request().query('SELECT TOP 20 id, name, email, points, referral_count, created_at FROM users ORDER BY created_at DESC');
}).then(result => {
  console.log('\n=== USERS TABLE (Latest 20) ===\n');
  result.recordset.forEach(user => {
    console.log(`ID: ${user.id} | Name: ${user.name} | Email: ${user.email} | Points: ${user.points} | Referrals: ${user.referral_count || 0}`);
  });
  console.log(`\n---\nShowing latest 20 users\n`);
  process.exit(0);
}).catch(err => {
  console.error('DB Error:', err.message);
  process.exit(1);
});

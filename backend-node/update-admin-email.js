import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function updateAdminEmail() {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Connected to database');

    const result = await pool.request().query(`
      UPDATE admins
      SET email = 'lansush246@gmail.com'
      WHERE email = 'susheel@100crores.com'
    `);

    console.log(`✅ Updated ${result.rowsAffected[0]} row(s)`);

    const verify = await pool.request().query(`
      SELECT email FROM admins WHERE email = 'lansush246@gmail.com'
    `);

    console.log('✅ Verified admin email:', verify.recordset[0]?.email);

    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

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

let pool = null;

export const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server (RDS) Successfully!');
    return pool;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

export const getPool = () => pool;
export { sql };

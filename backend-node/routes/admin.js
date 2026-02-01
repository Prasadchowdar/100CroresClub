import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getPool, sql } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Admin auth middleware
const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const pool = getPool();

    const result = await pool.request()
      .input('id', sql.NVarChar, decoded.sub)
      .query('SELECT * FROM admins WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    req.admin = result.recordset[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const createAdminToken = (adminId) => {
  return jwt.sign({ sub: adminId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Admin Signup
router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full Name, Email, and Password are required' });
  }

  try {
    const pool = getPool();

    const existing = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM admins WHERE email = @email');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('id', sql.NVarChar, adminId)
      .input('full_name', sql.NVarChar, fullName)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO admins (id, full_name, email, password_hash, created_at)
        VALUES (@id, @full_name, @email, @password, @created_at)
      `);

    return res.status(201).json({ message: 'Admin Registration Successful' });
  } catch (err) {
    console.error('Admin signup error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  try {
    const pool = getPool();

    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM admins WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const admin = result.recordset[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    const token = createAdminToken(admin.id);

    return res.status(200).json({
      message: 'Login Successful',
      access_token: token,
      admin: {
        id: admin.id,
        fullName: admin.full_name,
        email: admin.email,
        createdAt: admin.created_at
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Dashboard Stats
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const pool = getPool();

    // Total users
    const totalUsersResult = await pool.request()
      .query('SELECT COUNT(*) as total FROM users');
    const totalUsers = totalUsersResult.recordset[0].total;

    // Today's registrations
    const todayResult = await pool.request()
      .query(`
        SELECT COUNT(*) as today
        FROM users
        WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)
      `);
    const todayRegistrations = todayResult.recordset[0].today;

    // Total points
    const totalPointsResult = await pool.request()
      .query('SELECT SUM(points) as total FROM users');
    const totalPoints = totalPointsResult.recordset[0].total || 0;

    // Users with referrals
    const referredUsersResult = await pool.request()
      .query('SELECT COUNT(*) as referred FROM users WHERE referred_by IS NOT NULL');
    const referredUsers = referredUsersResult.recordset[0].referred;

    // Top 5 referrers
    const topReferrersResult = await pool.request()
      .query(`
        SELECT TOP 5
          name,
          referral_code,
          referrals_count,
          points
        FROM users
        WHERE referrals_count > 0
        ORDER BY referrals_count DESC
      `);

    return res.status(200).json({
      totalUsers,
      todayRegistrations,
      totalPoints,
      referredUsers,
      topReferrers: topReferrersResult.recordset
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get Users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const { search } = req.query;

    let result;
    if (search) {
      result = await pool.request()
        .input('search', sql.NVarChar, `%${search}%`)
        .query(`
          SELECT
            id, name, phone, points, referral_code, referred_by,
            referrals_count, club_tier, last_reward_claim, created_at
          FROM users
          WHERE name LIKE @search OR phone LIKE @search
          ORDER BY created_at DESC
        `);
    } else {
      result = await pool.request()
        .query(`
          SELECT
            id, name, phone, points, referral_code, referred_by,
            referrals_count, club_tier, last_reward_claim, created_at
          FROM users
          ORDER BY created_at DESC
        `);
    }

    return res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Export Users as CSV
router.get('/export', authenticateAdmin, async (req, res) => {
  try {
    const pool = getPool();

    const result = await pool.request()
      .query(`
        SELECT
          id, name, phone, points, referral_code, referred_by,
          referrals_count, club_tier, created_at
        FROM users
        ORDER BY created_at DESC
      `);

    let csv = 'ID,Name,Phone,Points,Referral Code,Referred By,Referrals Count,Club Tier,Created At\n';

    result.recordset.forEach(user => {
      csv += `"${user.id}","${user.name || ''}","${user.phone || ''}","${user.points}","${user.referral_code || ''}","${user.referred_by || ''}","${user.referrals_count}","${user.club_tier}","${user.created_at}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="users_export.csv"');
    return res.send(csv);
  } catch (err) {
    console.error('Export users error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const pool = getPool();

    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM admins WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    // Delete old OTPs
    await pool.request()
      .input('email', sql.NVarChar, email)
      .query('DELETE FROM admin_otps WHERE email = @email');

    // Insert new OTP (expires in 10 minutes)
    await pool.request()
      .input('id', sql.NVarChar, uuidv4())
      .input('email', sql.NVarChar, email)
      .input('otp_code', sql.NVarChar, otp)
      .input('expires_at', sql.DateTime, new Date(Date.now() + 10 * 60 * 1000))
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO admin_otps (id, email, otp_code, expires_at, created_at)
        VALUES (@id, @email, @otp_code, @expires_at, @created_at)
      `);

    // TODO: Send email with OTP (for now just log it)
    console.log(`OTP for ${email}: ${otp}`);

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const pool = getPool();

    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('otp', sql.NVarChar, otp)
      .query(`
        SELECT TOP 1 * FROM admin_otps
        WHERE email = @email AND otp_code = @otp AND expires_at > GETDATE()
        ORDER BY created_at DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Change Password
router.post('/change-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and New Password are required' });
  }

  try {
    const pool = getPool();

    // Verify OTP
    const otpResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('otp', sql.NVarChar, otp)
      .query(`
        SELECT TOP 1 * FROM admin_otps
        WHERE email = @email AND otp_code = @otp AND expires_at > GETDATE()
        ORDER BY created_at DESC
      `);

    if (otpResult.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .query('UPDATE admins SET password_hash = @password WHERE email = @email');

    // Clear OTPs
    await pool.request()
      .input('email', sql.NVarChar, email)
      .query('DELETE FROM admin_otps WHERE email = @email');

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Change Email
router.post('/change-email', async (req, res) => {
  const { email, otp, newEmail } = req.body;

  if (!email || !otp || !newEmail) {
    return res.status(400).json({ message: 'Email, OTP, and New Email are required' });
  }

  try {
    const pool = getPool();

    // Verify OTP
    const otpResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('otp', sql.NVarChar, otp)
      .query(`
        SELECT TOP 1 * FROM admin_otps
        WHERE email = @email AND otp_code = @otp AND expires_at > GETDATE()
        ORDER BY created_at DESC
      `);

    if (otpResult.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if new email exists
    const existing = await pool.request()
      .input('email', sql.NVarChar, newEmail)
      .query('SELECT * FROM admins WHERE email = @email');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    await pool.request()
      .input('oldEmail', sql.NVarChar, email)
      .input('newEmail', sql.NVarChar, newEmail)
      .query('UPDATE admins SET email = @newEmail WHERE email = @oldEmail');

    // Clear OTPs
    await pool.request()
      .input('email', sql.NVarChar, email)
      .query('DELETE FROM admin_otps WHERE email = @email');

    return res.status(200).json({ message: 'Email updated successfully' });
  } catch (err) {
    console.error('Change email error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

export default router;
export { authenticateAdmin };

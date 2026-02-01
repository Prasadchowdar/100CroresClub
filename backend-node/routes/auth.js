import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Club tiers configuration (unlocked by referrals count)
const CLUB_TIERS = [
  { name: "1 Crore", referrals_required: 10 },
  { name: "5 Crore", referrals_required: 50 },
  { name: "10 Crore", referrals_required: 100 },
  { name: "25 Crore", referrals_required: 250 },
  { name: "50 Crore", referrals_required: 500 },
  { name: "75 Crore", referrals_required: 750 },
  { name: "100 Crore", referrals_required: 1000 },
];

const REFERRAL_REWARD_POINTS = 1000000;

// Helper functions
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '100CRCLUB';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const calculateClubTier = (referralsCount) => {
  let tier = 0;
  for (let i = 0; i < CLUB_TIERS.length; i++) {
    if (referralsCount >= CLUB_TIERS[i].referrals_required) {
      tier = i + 1;
    }
  }
  return tier;
};

const createToken = (userId) => {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Signup
router.post('/signup', async (req, res) => {
  const { phone, password, name, referral_code } = req.body;

  if (!phone || !password || !name) {
    return res.status(400).json({ message: 'Phone, password, and name are required' });
  }

  try {
    const pool = getPool();

    // Check if user exists
    const existing = await pool.request()
      .input('phone', sql.NVarChar, phone)
      .query('SELECT * FROM users WHERE phone = @phone');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Validate referral code if provided
    let referrer = null;
    if (referral_code) {
      const referrerResult = await pool.request()
        .input('code', sql.NVarChar, referral_code)
        .query('SELECT * FROM users WHERE referral_code = @code');

      if (referrerResult.recordset.length === 0) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
      referrer = referrerResult.recordset[0];
    }

    // Generate unique referral code
    let myReferralCode = generateReferralCode();
    let codeExists = true;
    while (codeExists) {
      const checkCode = await pool.request()
        .input('code', sql.NVarChar, myReferralCode)
        .query('SELECT * FROM users WHERE referral_code = @code');
      if (checkCode.recordset.length === 0) {
        codeExists = false;
      } else {
        myReferralCode = generateReferralCode();
      }
    }

    // Create user
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const initialPoints = 0;
    const initialReferrals = 0;
    const initialTier = calculateClubTier(initialReferrals);
    const now = new Date().toISOString();

    await pool.request()
      .input('id', sql.NVarChar, userId)
      .input('phone', sql.NVarChar, phone)
      .input('password', sql.NVarChar, hashedPassword)
      .input('name', sql.NVarChar, name)
      .input('points', sql.BigInt, initialPoints)
      .input('referral_code', sql.NVarChar, myReferralCode)
      .input('referrals_count', sql.Int, 0)
      .input('referred_by', sql.NVarChar, referrer ? referrer.id : null)
      .input('club_tier', sql.Int, initialTier)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO users (id, phone, password, name, points, referral_code, referrals_count, referred_by, club_tier, last_reward_claim, created_at)
        VALUES (@id, @phone, @password, @name, @points, @referral_code, @referrals_count, @referred_by, @club_tier, NULL, @created_at)
      `);

    // Update referrer if exists
    if (referrer) {
      const referrerNewPoints = referrer.points + REFERRAL_REWARD_POINTS;
      const referrerNewReferrals = (referrer.referrals_count || 0) + 1;
      const referrerNewTier = calculateClubTier(referrerNewReferrals);

      await pool.request()
        .input('id', sql.NVarChar, referrer.id)
        .input('points', sql.BigInt, referrerNewPoints)
        .input('tier', sql.Int, referrerNewTier)
        .query(`
          UPDATE users
          SET points = @points, club_tier = @tier, referrals_count = referrals_count + 1
          WHERE id = @id
        `);
    }

    const token = createToken(userId);

    return res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: userId,
        phone,
        name,
        points: initialPoints,
        referral_code: myReferralCode,
        referrals_count: 0,
        club_tier: initialTier,
        last_reward_claim: null,
        created_at: now
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone and password are required' });
  }

  try {
    const pool = getPool();

    const result = await pool.request()
      .input('phone', sql.NVarChar, phone)
      .query('SELECT * FROM users WHERE phone = @phone');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    const token = createToken(user.id);

    return res.status(200).json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        points: user.points,
        referral_code: user.referral_code,
        referrals_count: user.referrals_count,
        club_tier: user.club_tier,
        last_reward_claim: user.last_reward_claim,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  const user = req.user;

  return res.status(200).json({
    id: user.id,
    phone: user.phone,
    name: user.name,
    points: user.points,
    referral_code: user.referral_code,
    referrals_count: user.referrals_count,
    club_tier: user.club_tier,
    last_reward_claim: user.last_reward_claim,
    created_at: user.created_at
  });
});

export default router;

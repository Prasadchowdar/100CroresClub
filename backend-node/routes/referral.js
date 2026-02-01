import express from 'express';
import { getPool, sql } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const REFERRAL_REWARD_POINTS = 1000000;

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

const calculateClubTier = (referralsCount) => {
  let tier = 0;
  for (let i = 0; i < CLUB_TIERS.length; i++) {
    if (referralsCount >= CLUB_TIERS[i].referrals_required) {
      tier = i + 1;
    }
  }
  return tier;
};

// Apply referral code
router.post('/apply', authenticateToken, async (req, res) => {
  const user = req.user;
  const { referral_code } = req.body;

  if (!referral_code) {
    return res.status(400).json({ message: 'Referral code is required' });
  }

  if (user.referred_by) {
    return res.status(200).json({
      success: false,
      message: 'You have already used a referral code',
      points_earned: 0
    });
  }

  try {
    const pool = getPool();

    // Find referrer
    const referrerResult = await pool.request()
      .input('code', sql.NVarChar, referral_code)
      .query('SELECT * FROM users WHERE referral_code = @code');

    if (referrerResult.recordset.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'Invalid referral code',
        points_earned: 0
      });
    }

    const referrer = referrerResult.recordset[0];

    if (referrer.id === user.id) {
      return res.status(200).json({
        success: false,
        message: 'You cannot use your own referral code',
        points_earned: 0
      });
    }

    // Update current user (user who applied referral code gets points, tier stays same - no new referrals for them)
    const userNewPoints = user.points + REFERRAL_REWARD_POINTS;
    const userCurrentReferrals = user.referrals_count || 0;
    const userTier = calculateClubTier(userCurrentReferrals);

    await pool.request()
      .input('id', sql.NVarChar, user.id)
      .input('referred_by', sql.NVarChar, referrer.id)
      .input('points', sql.BigInt, userNewPoints)
      .input('tier', sql.Int, userTier)
      .query(`
        UPDATE users
        SET referred_by = @referred_by, points = @points, club_tier = @tier
        WHERE id = @id
      `);

    // Update referrer (gets points AND +1 referral, so tier may increase)
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

    return res.status(200).json({
      success: true,
      message: `Referral code applied! You and ${referrer.name} both earned ${REFERRAL_REWARD_POINTS.toLocaleString()} points!`,
      points_earned: REFERRAL_REWARD_POINTS
    });
  } catch (err) {
    console.error('Apply referral error:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Get referral stats
router.get('/stats', authenticateToken, async (req, res) => {
  const user = req.user;

  return res.status(200).json({
    referral_code: user.referral_code,
    referrals_count: user.referrals_count,
    points_per_referral: REFERRAL_REWARD_POINTS
  });
});

export default router;

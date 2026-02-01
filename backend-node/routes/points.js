import express from 'express';
import { getPool, sql } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Club tiers configuration (unlocked by referrals count, not points)
const CLUB_TIERS = [
  { name: "1 Crore", referrals_required: 10 },
  { name: "5 Crore", referrals_required: 50 },
  { name: "10 Crore", referrals_required: 100 },
  { name: "25 Crore", referrals_required: 250 },
  { name: "50 Crore", referrals_required: 500 },
  { name: "75 Crore", referrals_required: 750 },
  { name: "100 Crore", referrals_required: 1000 },
];

const DAILY_REWARD_POINTS = 10000;

const calculateClubTier = (referralsCount) => {
  let tier = 0;
  for (let i = 0; i < CLUB_TIERS.length; i++) {
    if (referralsCount >= CLUB_TIERS[i].referrals_required) {
      tier = i + 1;
    }
  }
  return tier;
};

const getNextClubInfo = (referralsCount) => {
  for (const club of CLUB_TIERS) {
    if (referralsCount < club.referrals_required) {
      return { referrals_required: club.referrals_required, name: club.name };
    }
  }
  return { referrals_required: null, name: null };
};

// Get points
router.get('/', authenticateToken, async (req, res) => {
  const user = req.user;
  const referralsCount = user.referrals_count || 0;
  const clubTier = calculateClubTier(referralsCount);
  const nextClub = getNextClubInfo(referralsCount);

  return res.status(200).json({
    points: user.points,
    referrals_count: referralsCount,
    club_tier: clubTier,
    next_club_referrals: nextClub.referrals_required,
    next_club_name: nextClub.name
  });
});

// Claim daily reward
router.post('/claim-daily', authenticateToken, async (req, res) => {
  const user = req.user;
  const pool = getPool();

  try {
    // IST timezone offset (5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(now.getTime() + istOffset);

    const lastClaim = user.last_reward_claim;

    if (lastClaim) {
      const lastClaimDate = new Date(lastClaim);
      const lastClaimIST = new Date(lastClaimDate.getTime() + istOffset);

      // Check if claimed today (IST)
      if (lastClaimIST.toDateString() === nowIST.toDateString()) {
        // Calculate time until midnight IST
        const tomorrowMidnight = new Date(nowIST);
        tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
        tomorrowMidnight.setHours(0, 0, 0, 0);

        return res.status(200).json({
          success: false,
          points_earned: 0,
          total_points: user.points,
          next_claim_available: tomorrowMidnight.toISOString(),
          message: 'Come back tomorrow'
        });
      }
    }

    // Award points (club_tier doesn't change - it's based on referrals, not points)
    const newPoints = user.points + DAILY_REWARD_POINTS;

    await pool.request()
      .input('id', sql.NVarChar, user.id)
      .input('points', sql.BigInt, newPoints)
      .input('claim_time', sql.DateTime, now)
      .query(`
        UPDATE users
        SET points = @points, last_reward_claim = @claim_time
        WHERE id = @id
      `);

    // Calculate tomorrow midnight IST
    const tomorrowMidnight = new Date(nowIST);
    tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
    tomorrowMidnight.setHours(0, 0, 0, 0);

    return res.status(200).json({
      success: true,
      points_earned: DAILY_REWARD_POINTS,
      total_points: newPoints,
      next_claim_available: tomorrowMidnight.toISOString(),
      message: `Congratulations! You earned ${DAILY_REWARD_POINTS.toLocaleString()} points!`
    });
  } catch (err) {
    console.error('Claim daily error:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Get cooldown
router.get('/cooldown', authenticateToken, async (req, res) => {
  const user = req.user;

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);

  const lastClaim = user.last_reward_claim;

  if (!lastClaim) {
    return res.status(200).json({
      can_claim: true,
      next_claim_available: nowIST.toISOString(),
      seconds_remaining: 0
    });
  }

  const lastClaimDate = new Date(lastClaim);
  const lastClaimIST = new Date(lastClaimDate.getTime() + istOffset);

  // If last claim was before today (IST), can claim
  if (lastClaimIST.toDateString() !== nowIST.toDateString()) {
    return res.status(200).json({
      can_claim: true,
      next_claim_available: nowIST.toISOString(),
      seconds_remaining: 0
    });
  }

  // Calculate time until midnight IST
  const tomorrowMidnight = new Date(nowIST);
  tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
  tomorrowMidnight.setHours(0, 0, 0, 0);

  const remaining = Math.floor((tomorrowMidnight.getTime() - nowIST.getTime()) / 1000);

  return res.status(200).json({
    can_claim: false,
    next_claim_available: tomorrowMidnight.toISOString(),
    seconds_remaining: remaining
  });
});

export default router;

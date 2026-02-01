import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Club tiers configuration (unlocked by referrals count)
const CLUB_TIERS = [
  { name: "1 Crore", referrals_required: 10, icon: "bronze" },
  { name: "5 Crore", referrals_required: 50, icon: "silver" },
  { name: "10 Crore", referrals_required: 100, icon: "gold" },
  { name: "25 Crore", referrals_required: 250, icon: "platinum" },
  { name: "50 Crore", referrals_required: 500, icon: "diamond" },
  { name: "75 Crore", referrals_required: 750, icon: "master" },
  { name: "100 Crore", referrals_required: 1000, icon: "grandmaster" },
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

// Get all clubs
router.get('/', authenticateToken, async (req, res) => {
  const user = req.user;
  const referralsCount = user.referrals_count || 0;

  const clubs = CLUB_TIERS.map((club, index) => ({
    id: index + 1,
    name: club.name,
    referrals_required: club.referrals_required,
    icon: club.icon,
    is_unlocked: referralsCount >= club.referrals_required
  }));

  return res.status(200).json({
    clubs,
    user_referrals: referralsCount,
    user_points: user.points,
    current_tier: calculateClubTier(referralsCount)
  });
});

export default router;

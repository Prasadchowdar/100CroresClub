import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Coins, Copy, Share2, Clock, Trophy, Lock, Medal, 
  Crown, Gem, Star, Award, CheckCircle2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

const CLUB_TIERS = [
  { name: 'Bronze Club', points: 10000000, icon: Medal, color: '#CD7F32' },
  { name: 'Silver Club', points: 50000000, icon: Medal, color: '#C0C0C0' },
  { name: 'Gold Club', points: 100000000, icon: Trophy, color: '#FFD700' },
  { name: 'Platinum Club', points: 250000000, icon: Gem, color: '#E5E4E2' },
  { name: 'Diamond Club', points: 500000000, icon: Gem, color: '#B9F2FF' },
  { name: 'Master Club', points: 750000000, icon: Crown, color: '#FF4500' },
  { name: 'Grandmaster Club', points: 1000000000, icon: Trophy, color: '#FFD700' },
];

const formatPoints = (points) => {
  if (points >= 10000000) {
    return `${(points / 10000000).toFixed(0)} Crore`;
  }
  return points.toLocaleString('en-IN');
};

const Dashboard = () => {
  const { user, token, refreshUser, axiosAuth } = useAuth();
  const navigate = useNavigate();
  const [cooldown, setCooldown] = useState(null);
  const [canClaim, setCanClaim] = useState(false);
  const [coinClicked, setCoinClicked] = useState(false);
  const [pointsAnimation, setPointsAnimation] = useState(null);
  const [referralStats, setReferralStats] = useState({ referrals_count: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCooldown = useCallback(async () => {
    try {
      const response = await axiosAuth().get('/points/cooldown');
      setCanClaim(response.data.can_claim);
      if (!response.data.can_claim) {
        setCooldown(response.data.seconds_remaining);
      } else {
        setCooldown(null);
      }
    } catch (error) {
      console.error('Error fetching cooldown:', error);
    }
  }, [axiosAuth]);

  const fetchReferralStats = useCallback(async () => {
    try {
      const response = await axiosAuth().get('/referral/stats');
      setReferralStats(response.data);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  }, [axiosAuth]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCooldown(), fetchReferralStats()]);
      setLoading(false);
    };
    loadData();
  }, [token, navigate, fetchCooldown, fetchReferralStats]);

  // Countdown timer
  useEffect(() => {
    if (cooldown === null || cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          setCanClaim(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const formatTime = (seconds) => {
    if (!seconds) return { days: 0, hours: 0, minutes: 0, secs: 0 };
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { days, hours, minutes, secs };
  };

  const handleCoinTap = async () => {
    if (!canClaim) {
      toast.error('Daily reward not available yet!');
      return;
    }

    setCoinClicked(true);
    setTimeout(() => setCoinClicked(false), 500);

    try {
      const response = await axiosAuth().post('/points/claim-daily');
      if (response.data.success) {
        setPointsAnimation('+10,000');
        setTimeout(() => setPointsAnimation(null), 1000);
        toast.success(response.data.message);
        await refreshUser();
        await fetchCooldown();
      } else {
        toast.info(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to claim reward');
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user?.referral_code || '');
    toast.success('Referral code copied!');
  };

  const shareReferralCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join 100CRORECLUB',
        text: `Join 100CRORECLUB and earn rewards! Use my referral code: ${user?.referral_code}`,
        url: window.location.origin,
      });
    } else {
      copyReferralCode();
    }
  };

  const timeLeft = formatTime(cooldown);
  const nextClub = CLUB_TIERS.find((club) => (user?.points || 0) < club.points);
  const progressToNextClub = nextClub
    ? ((user?.points || 0) / nextClub.points) * 100
    : 100;
  const pointsToNextClub = nextClub ? nextClub.points - (user?.points || 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome, <span className="text-gold">{user?.name}</span>
          </h1>
          <p className="font-manrope text-white/60">Track your progress and earn rewards</p>
        </div>

        {/* Top Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Points Card */}
          <Card className="lg:col-span-2 bg-[#141414] border-white/5 overflow-hidden animate-fade-in" data-testid="points-card">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
                    <Coins className="h-6 w-6 text-gold" />
                  </div>
                  <span className="font-cinzel text-lg text-white/80">YOUR POINTS</span>
                </div>
              </div>
              <p className="font-cinzel text-5xl sm:text-6xl font-bold text-gold mb-4" data-testid="points-display">
                {(user?.points || 0).toLocaleString('en-IN')}
              </p>
              <p className="font-manrope text-white/60">Points</p>

              {nextClub && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-manrope text-sm text-white/60">Progress to {nextClub.name}</span>
                    <span className="font-manrope text-sm text-gold">{progressToNextClub.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressToNextClub} className="h-2 bg-white/10" />
                  <p className="font-manrope text-sm text-white/40 mt-2">
                    {formatPoints(pointsToNextClub)} more points needed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offer Countdown */}
          <Card className="bg-[#141414] border-white/5 animate-fade-in stagger-1" data-testid="offer-card">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="font-cinzel text-sm text-gold mb-4 tracking-wider">OFFER ENDS IN</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Days', value: '07' },
                    { label: 'Hours', value: '23' },
                    { label: 'Mins', value: '59' },
                    { label: 'Secs', value: '59' },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <div className="bg-gold/10 rounded-lg py-3 px-2 mb-1">
                        <span className="font-cinzel text-2xl font-bold text-gold">{item.value}</span>
                      </div>
                      <span className="font-manrope text-xs text-white/40">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Rewards & Referral */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Rewards */}
          <Card className="bg-[#141414] border-white/5 animate-fade-in stagger-2" data-testid="daily-reward-card">
            <CardHeader>
              <CardTitle className="font-cinzel text-xl text-white">Daily Rewards</CardTitle>
              <p className="font-manrope text-white/60 text-sm">Tap the coin to earn 10,000 points daily!</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-8">
              {/* Coin */}
              <div className="relative mb-6">
                <button
                  onClick={handleCoinTap}
                  disabled={!canClaim}
                  className={`relative w-40 h-40 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center 
                    ${canClaim ? 'cursor-pointer hover:scale-105 animate-pulse-gold' : 'opacity-50 cursor-not-allowed'}
                    ${coinClicked ? 'animate-bounce-gold' : ''}
                    transition-transform duration-200 shadow-[0_0_40px_rgba(255,215,0,0.4)]`}
                  data-testid="coin-tap-btn"
                >
                  <span className="font-cinzel text-6xl font-bold text-black">₹</span>
                </button>
                
                {/* Points Animation */}
                {pointsAnimation && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 points-increment">
                    <span className="font-cinzel text-2xl font-bold text-gold">{pointsAnimation}</span>
                  </div>
                )}
              </div>

              {/* Countdown */}
              {!canClaim && cooldown ? (
                <div className="text-center">
                  <p className="font-manrope text-white/60 mb-3">Come back in</p>
                  <div className="flex gap-3">
                    {[
                      { label: 'Hours', value: timeLeft.hours.toString().padStart(2, '0') },
                      { label: 'Mins', value: timeLeft.minutes.toString().padStart(2, '0') },
                      { label: 'Secs', value: timeLeft.secs.toString().padStart(2, '0') },
                    ].map((item, i) => (
                      <div key={item.label} className="text-center">
                        <div className="bg-white/5 rounded-lg py-2 px-4 mb-1">
                          <span className="font-cinzel text-xl font-bold text-white">{item.value}</span>
                        </div>
                        <span className="font-manrope text-xs text-white/40">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="font-manrope text-gold text-lg">Tap to claim your reward!</p>
              )}
            </CardContent>
          </Card>

          {/* Refer & Earn */}
          <Card className="bg-[#141414] border-white/5 animate-fade-in stagger-3" data-testid="referral-card">
            <CardHeader>
              <CardTitle className="font-cinzel text-xl text-white">Refer & Earn</CardTitle>
              <p className="font-manrope text-white/60 text-sm">Share your code and earn 1,000,000 points per referral!</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Referral Code */}
              <div>
                <p className="font-manrope text-sm text-white/60 mb-2">Your Referral Code</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 font-mono text-gold text-lg tracking-wider" data-testid="referral-code">
                    {user?.referral_code}
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 px-4"
                    onClick={copyReferralCode}
                    data-testid="copy-referral-btn"
                  >
                    <Copy className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </div>

              {/* Share Button */}
              <Button
                className="w-full bg-gold text-black font-bold hover:bg-gold-light h-12 rounded-xl"
                onClick={shareReferralCode}
                data-testid="share-referral-btn"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share Referral Code
              </Button>

              {/* Stats */}
              <div className="pt-4 border-t border-white/10">
                <p className="font-manrope text-sm text-white/60 mb-2">Referral Statistics</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="font-cinzel text-3xl font-bold text-gold" data-testid="referrals-count">
                      {referralStats.referrals_count || 0}
                    </p>
                    <p className="font-manrope text-sm text-white/60">Completed Referrals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exclusive Clubs */}
        <Card className="bg-[#141414] border-white/5 animate-fade-in stagger-4" data-testid="clubs-section">
          <CardHeader>
            <CardTitle className="font-cinzel text-2xl text-white">Exclusive Clubs</CardTitle>
            <p className="font-manrope text-white/60">Unlock prestigious clubs by earning points!</p>
            {nextClub && (
              <p className="font-manrope text-gold mt-2">
                🚀 Earn {formatPoints(pointsToNextClub)} more points to join the {nextClub.name}!
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {CLUB_TIERS.map((club, index) => {
                const isUnlocked = (user?.points || 0) >= club.points;
                const IconComponent = club.icon;

                return (
                  <div
                    key={club.name}
                    className={`relative rounded-2xl border transition-all duration-300 overflow-hidden
                      ${isUnlocked 
                        ? 'bg-[#1a1a1a] border-gold/30 gold-glow' 
                        : 'bg-[#0f0f0f] border-white/5'}`}
                    data-testid={`club-card-${index}`}
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-white/40" />
                      </div>
                    )}
                    
                    <div className="p-4 text-center">
                      <div 
                        className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${club.color}20` }}
                      >
                        <IconComponent className="h-7 w-7" style={{ color: club.color }} />
                      </div>
                      <h3 className="font-cinzel text-sm font-semibold text-white mb-1 leading-tight">
                        {club.name}
                      </h3>
                      <p className="font-manrope text-xs text-gold">
                        {formatPoints(club.points)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

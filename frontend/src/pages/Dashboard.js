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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { toast } from 'sonner';

const CLUB_TIERS = [
  { name: '1 Crore', points: "Super", referrals_required: 10, icon: Medal, color: '#CD7F32', banner: '/assets/banners/1cr.jpg' },
  { name: '5 Crore ', points: "Mega", referrals_required: 50, icon: Medal, color: '#C0C0C0', banner: '/assets/banners/5cr.jpg' },
  { name: '10 Crore ', points: "Supreme", referrals_required: 100, icon: Trophy, color: '#FFD700', banner: '/assets/banners/10cr.jpg' },
  { name: '25 Crore ', points: "Ceo", referrals_required: 250, icon: Gem, color: '#E5E4E2', banner: '/assets/banners/25cr.jpg' },
  { name: '50 Crore ', points: "Super Ceo", referrals_required: 500, icon: Gem, color: '#B9F2FF', banner: '/assets/banners/50cr.jpg' },
  { name: '75 Crore ', points: "Mega Ceo", referrals_required: 750, icon: Crown, color: '#FF4500', banner: '/assets/banners/75cr.jpg' },
  { name: '100 Crore ', points: "Supreme Ceo", referrals_required: 1000, icon: Trophy, color: '#FFD700', banner: '/assets/banners/100cr.png' },
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

  const [canClaim, setCanClaim] = useState(false);
  const [coinClicked, setCoinClicked] = useState(false);
  const [pointsAnimation, setPointsAnimation] = useState(null);
  const [programTimeLeft, setProgramTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, secs: 0 });
  const [referralStats, setReferralStats] = useState({ referrals_count: 0 });
  const [interaction, setInteraction] = useState(null); // { type: 'withdraw' | 'referral', club: ... }
  const [loading, setLoading] = useState(true);

  const fetchCooldown = useCallback(async () => {
    try {
      const response = await axiosAuth().get('/points/cooldown');
      setCanClaim(response.data.can_claim);
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

  // Program Countdown Timer (6 Months from Registration)
  useEffect(() => {
    if (!user?.created_at) return;

    const calculateTimeLeft = () => {
      const registrationDate = new Date(user.created_at);
      // Add 6 months to registration date
      const endDate = new Date(registrationDate.getTime());
      endDate.setMonth(endDate.getMonth() + 6);

      const now = new Date();

      const difference = endDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const secs = Math.floor((difference / 1000) % 60);

        setProgramTimeLeft({ days, hours, minutes, secs });
      } else {
        setProgramTimeLeft({ days: 0, hours: 0, minutes: 0, secs: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [user?.created_at]);

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



  const nextClub = CLUB_TIERS.find((club) => (user?.referrals_count || 0) < club.referrals_required);
  const progressToNextClub = nextClub
    ? ((user?.referrals_count || 0) / nextClub.referrals_required) * 100
    : 100;
  const referralsToNextClub = nextClub ? nextClub.referrals_required - (user?.referrals_count || 0) : 0;

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
                    {referralsToNextClub} more referrals needed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offer Countdown */}
          <Card className="bg-[#141414] border-white/5 animate-fade-in stagger-1" data-testid="offer-card">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="font-cinzel text-sm text-gold mb-4 tracking-wider">PROGRAM ENDS IN</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Days', value: programTimeLeft.days.toString().padStart(2, '0') },
                    { label: 'Hours', value: programTimeLeft.hours.toString().padStart(2, '0') },
                    { label: 'Mins', value: programTimeLeft.minutes.toString().padStart(2, '0') },
                    { label: 'Secs', value: programTimeLeft.secs.toString().padStart(2, '0') },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <div className="bg-gold/10 rounded-lg py-3 px-2 mb-1">
                        <span className="font-cinzel text-xl sm:text-2xl font-bold text-gold">{item.value}</span>
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
              {/* Countdown or Status Message */}
              {!canClaim ? (
                <div className="text-center animate-fade-in">
                  <p className="font-cinzel text-xl text-white/40 tracking-wider">
                    COME BACK TOMORROW
                  </p>
                  <p className="font-manrope text-xs text-white/20 mt-2">
                    Rewards reset at 12:00 AM
                  </p>
                </div>
              ) : (
                <div className="text-center animate-pulse-gold">
                  <p className="font-manrope text-gold text-lg font-bold">Tap to claim your reward!</p>
                </div>
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
                <p className="font-manrope text-sm text-white/60 mb-2">Total Joined</p>
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
                🚀 Get {referralsToNextClub} more referrals to join the {nextClub.name}!
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {CLUB_TIERS.map((club, index) => {
                const isUnlocked = (user?.referrals_count || 0) >= club.referrals_required;
                const IconComponent = club.icon;

                return (
                  <div
                    key={club.name}
                    onClick={() => {
                      if (isUnlocked) {
                        setInteraction({ type: 'withdraw', club });
                      } else {
                        setInteraction({ type: 'referral', club });
                      }
                    }}
                    className={`relative rounded-3xl border transition-all duration-500 overflow-hidden group hover:-translate-y-1 hover:scale-[1.02] cursor-pointer
                      ${isUnlocked
                        ? 'shadow-2xl'
                        : 'bg-[#141414] opacity-90'}`}
                    style={{
                      borderColor: isUnlocked ? club.color : '#333333',
                      boxShadow: isUnlocked ? `0 0 20px ${club.color}30` : 'none',
                      backgroundImage: isUnlocked ? `url(${club.banner})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                    data-testid={`club-card-${index}`}
                  >
                    {/* Banner Overlay for text readability when unlocked */}
                    {isUnlocked && (
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-0" />
                    )}

                    {/* Lock Icon - Only show when LOCKED */}
                    {!isUnlocked && (
                      <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-sm p-2 rounded-full border border-white/10 shadow-lg">
                        <Lock className="h-5 w-5 text-white/70" />
                      </div>
                    )}

                    <div className={`text-center flex flex-col items-center h-full relative z-10 ${isUnlocked ? 'p-4' : 'p-8'}`}>
                      {/* Icon - Only show when LOCKED */}
                      {!isUnlocked && (
                        <div
                          className={`w-28 h-28 mb-6 flex items-center justify-center transition-all duration-500 grayscale-[0.3] scale-100`}
                        >
                          <IconComponent
                            className="h-16 w-16 transition-all duration-500"
                            style={{
                              color: club.color,
                              filter: 'none'
                            }}
                            strokeWidth={1.5}
                          />
                        </div>
                      )}

                      {/* Text Content - Only show when LOCKED */}
                      {!isUnlocked && (
                        <>
                          <h3 className="font-cinzel text-xl font-bold mb-2 leading-tight tracking-wide text-white">
                            {club.name}
                          </h3>

                          <p className="font-manrope text-base font-medium mb-8 text-[#a0a0a0]">
                            {club.points} Team
                          </p>
                        </>
                      )}

                      {/* Bottom Badge - Absolute positioning for unlocked */}
                      <div className={isUnlocked ? 'absolute bottom-2 left-0 right-0 px-4' : 'mt-auto w-full'}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInteraction({ type: 'withdraw', club });
                          }}
                          className={`mx-auto w-max px-8 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg transition-all duration-200 cursor-pointer z-30 relative
                            ${isUnlocked
                              ? 'bg-gold/95 backdrop-blur-md border-2 border-gold text-black hover:bg-gold hover:scale-105 shadow-gold/50'
                              : 'bg-[#2a2a2a] border border-[#404040] text-white/80 hover:bg-[#333]'}`}
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interaction Dialog */}
      <Dialog open={!!interaction} onOpenChange={() => setInteraction(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-xl text-gold">
              {interaction?.type === 'withdraw' ? 'Withdrawal Notification' : 'Unlock Requirement'}
            </DialogTitle>
            <DialogDescription className="text-white/70 font-manrope pt-4 text-base">
              {interaction?.type === 'withdraw' ? (
                "You can withdraw within 6 months. Our team will NOTIFY you."
              ) : (
                <>
                  To unlock the <span className="text-white font-bold">{interaction?.club?.name}</span>, you must join <span className="text-gold font-bold">{interaction?.club?.referrals_required} people</span> using your referral ID.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setInteraction(null)} className="bg-gold text-black hover:bg-gold-light">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

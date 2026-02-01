import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Phone, Lock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(phone, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 flex items-center" data-testid="login-page">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center">
              <span className="font-cinzel font-bold text-black">100</span>
            </div>
          </Link>
          <h1 className="font-cinzel text-3xl font-bold text-white mb-2">WELCOME BACK</h1>
          <p className="font-manrope text-white/60">Sign in to access your dashboard</p>
        </div>

        <Card className="bg-[#141414] border-white/5 animate-fade-in stagger-1">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white font-manrope">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/40 focus:border-gold h-12 pl-12"
                    data-testid="login-phone-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-manrope">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/40 focus:border-gold h-12 pl-12 pr-12"
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-black font-bold hover:bg-gold-light h-12 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="font-manrope text-white/60">
                Don't have an account?{' '}
                <Link to="/signup" className="text-gold hover:underline" data-testid="goto-signup">
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const Signup = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(phone, password, name, referralCode);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Signup failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 flex items-center py-12" data-testid="signup-page">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center">
              <span className="font-cinzel font-bold text-black">100</span>
            </div>
          </Link>
          <h1 className="font-cinzel text-3xl font-bold text-white mb-2">JOIN THE CLUB</h1>
          <p className="font-manrope text-white/60">Create your account and start earning</p>
        </div>

        <Card className="bg-[#141414] border-white/5 animate-fade-in stagger-1">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="signup-form">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-manrope">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/40 focus:border-gold h-12 pl-12"
                    data-testid="signup-name-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white font-manrope">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/40 focus:border-gold h-12 pl-12"
                    data-testid="signup-phone-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-manrope">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/40 focus:border-gold h-12 pl-12 pr-12"
                    data-testid="signup-password-input"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-white font-manrope">
                  Referral Code (Optional)
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="Enter referral code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/40 focus:border-gold h-12 pl-12"
                    data-testid="signup-referral-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-black font-bold hover:bg-gold-light h-12 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                data-testid="signup-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="font-manrope text-white/60">
                Already have an account?{' '}
                <Link to="/login" className="text-gold hover:underline" data-testid="goto-login">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

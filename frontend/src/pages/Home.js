import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, TrendingUp, Users, Shield, Award, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const Home = () => {
  const stats = [
    { value: '₹500Cr+', label: 'Assets Under Management' },
    { value: '10,000+', label: 'Active Investors' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '150+', label: 'Premium Properties' },
  ];

  const features = [
    {
      icon: Building2,
      title: 'Premium Properties',
      description: 'Access exclusive high-value real estate opportunities curated for maximum returns.',
    },
    {
      icon: Shield,
      title: 'Secure Investments',
      description: 'Your investments are protected with industry-leading security and transparency.',
    },
    {
      icon: TrendingUp,
      title: 'High Returns',
      description: 'Strategic property investments designed to deliver exceptional ROI.',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Backed by seasoned real estate professionals with decades of experience.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20" data-testid="hero-section">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1758612853656-def5033bccb5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBtYW5zaW9uJTIwbmlnaHQlMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzY5ODk4NzIxfDA&ixlib=rb-4.1.0&q=85')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/10">
              <Star className="h-4 w-4 text-gold" />
              <span className="text-gold font-manrope text-sm">Premium Real Estate Platform</span>
            </div>
            
            <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-wide">
              JOIN THE EXCLUSIVE{' '}
              <span className="text-gold-gradient">100 CRORE CLUB</span>
            </h1>
            
            <p className="font-manrope text-lg text-white/70 leading-relaxed max-w-2xl">
              Revolutionizing the way people invest in property. Experience premium real estate investments 
              with strategic partnerships and sustainable growth opportunities.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/signup" data-testid="hero-signup-btn">
                <Button className="bg-gold text-black font-semibold hover:bg-gold-light rounded-full px-8 py-6 text-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_40px_rgba(255,215,0,0.5)] transition-shadow">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about" data-testid="hero-learn-btn">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gold rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/10" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center space-y-2 opacity-0 animate-fade-in stagger-${index + 1}`}
              >
                <p className="font-cinzel text-3xl sm:text-4xl font-bold text-gold">{stat.value}</p>
                <p className="font-manrope text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white tracking-wide">
              WHY CHOOSE US
            </h2>
            <p className="font-manrope text-white/60 max-w-2xl mx-auto">
              Experience the difference of investing with India's premier real estate platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={`bg-[#141414] border-white/5 hover:border-gold/30 transition-all duration-500 group card-hover opacity-0 animate-fade-in stagger-${index + 1}`}
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <feature.icon className="h-7 w-7 text-gold" />
                  </div>
                  <h3 className="font-cinzel text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="font-manrope text-white/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden" data-testid="cta-section">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="h-16 w-16 text-gold mx-auto mb-8" />
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mb-6 tracking-wide">
            START YOUR INVESTMENT JOURNEY TODAY
          </h2>
          <p className="font-manrope text-white/60 mb-10 max-w-2xl mx-auto text-lg">
            Join thousands of successful investors who have already discovered the power of 
            strategic real estate investments with 100CRORECLUB.
          </p>
          <Link to="/signup" data-testid="cta-signup-btn">
            <Button className="bg-gold text-black font-bold hover:bg-gold-light rounded-full px-12 py-6 text-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_40px_rgba(255,215,0,0.5)] transition-shadow">
              Join 100CRORECLUB
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

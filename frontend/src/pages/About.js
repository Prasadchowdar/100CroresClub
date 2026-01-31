import React from 'react';
import { Target, Eye, Heart, Users, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Integrity',
      description: 'We operate with complete transparency and honesty in all our dealings.',
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for excellence in every investment opportunity we present.',
    },
    {
      icon: Users,
      title: 'Partnership',
      description: 'We believe in building long-term relationships with our investors.',
    },
    {
      icon: TrendingUp,
      title: 'Growth',
      description: 'We are committed to sustainable growth and wealth creation.',
    },
  ];

  const team = [
    {
      name: 'Rajesh Sharma',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    },
    {
      name: 'Priya Patel',
      role: 'Chief Investment Officer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    },
    {
      name: 'Amit Kumar',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    },
    {
      name: 'Sneha Reddy',
      role: 'Client Relations Director',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20" data-testid="about-page">
      {/* Hero Section */}
      <section className="py-24 relative" data-testid="about-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-wide">
              ABOUT <span className="text-gold">US</span>
            </h1>
            <p className="font-manrope text-lg text-white/70 leading-relaxed">
              Welcome to 100CRORECLUB MNC, your premier destination for premium real estate 
              investments and opportunities. We are dedicated to revolutionizing the way 
              people invest in property, making it accessible, transparent, and profitable 
              for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 border-y border-white/10" data-testid="mission-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="bg-[#141414] border-white/5 overflow-hidden group card-hover">
              <CardContent className="p-10 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <Target className="h-8 w-8 text-gold" />
                </div>
                <h2 className="font-cinzel text-2xl font-bold text-white">OUR MISSION</h2>
                <p className="font-manrope text-white/70 leading-relaxed">
                  Our mission is to empower individuals to build wealth through strategic 
                  real estate partnerships. With a focus on high-value assets and sustainable 
                  growth, we bring you the best opportunities in the market. We believe that 
                  premium real estate investment should be accessible to everyone who aspires 
                  to grow their wealth.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#141414] border-white/5 overflow-hidden group card-hover">
              <CardContent className="p-10 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <Eye className="h-8 w-8 text-gold" />
                </div>
                <h2 className="font-cinzel text-2xl font-bold text-white">OUR VISION</h2>
                <p className="font-manrope text-white/70 leading-relaxed">
                  To become India's most trusted and innovative real estate investment platform, 
                  creating a community of 100 crore+ investors who share our vision of wealth 
                  creation through strategic property investments. We envision a future where 
                  everyone has access to premium real estate opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24" data-testid="values-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white tracking-wide mb-4">
              OUR <span className="text-gold">VALUES</span>
            </h2>
            <p className="font-manrope text-white/60 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={value.title}
                className={`bg-[#141414] border-white/5 hover:border-gold/30 transition-all duration-500 group card-hover opacity-0 animate-fade-in stagger-${index + 1}`}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <value.icon className="h-7 w-7 text-gold" />
                  </div>
                  <h3 className="font-cinzel text-xl font-semibold text-white">{value.title}</h3>
                  <p className="font-manrope text-white/60 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-[#0d0d0d]" data-testid="team-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white tracking-wide mb-4">
              LEADERSHIP <span className="text-gold">TEAM</span>
            </h2>
            <p className="font-manrope text-white/60 max-w-2xl mx-auto">
              Meet the experts behind 100CRORECLUB's success
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={member.name}
                className={`text-center group opacity-0 animate-fade-in stagger-${index + 1}`}
              >
                <div className="relative mb-6 mx-auto w-40 h-40 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-gold/50 transition-colors">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="font-cinzel text-lg font-semibold text-white mb-1">{member.name}</h3>
                <p className="font-manrope text-gold text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievement */}
      <section className="py-24 relative overflow-hidden" data-testid="achievement-section">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="h-16 w-16 text-gold mx-auto mb-8" />
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mb-6 tracking-wide">
            TRUSTED BY THOUSANDS
          </h2>
          <p className="font-manrope text-white/60 text-lg leading-relaxed">
            Over the years, we have helped thousands of investors achieve their wealth goals 
            through strategic real estate investments. Our commitment to excellence and 
            transparency has made us the preferred choice for premium property investments in India.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;

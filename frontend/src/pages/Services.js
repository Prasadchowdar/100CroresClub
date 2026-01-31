import React from 'react';
import { Building2, BarChart3, Handshake, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      icon: Building2,
      title: 'Property Investment',
      description: 'Expert guidance on high-yield property investments tailored to your portfolio goals.',
      features: [
        'Curated premium property listings',
        'In-depth market analysis',
        'Risk assessment and mitigation',
        'Portfolio diversification strategies',
        'Regular performance reports',
      ],
      color: 'gold',
    },
    {
      icon: BarChart3,
      title: 'Asset Management',
      description: 'Comprehensive management solutions to maximize the value and returns of your real estate assets.',
      features: [
        'Property maintenance oversight',
        'Tenant management services',
        'Financial reporting and analysis',
        'Value optimization strategies',
        'Regulatory compliance support',
      ],
      color: 'gold',
    },
    {
      icon: Handshake,
      title: 'Consultancy',
      description: 'Professional real estate consultancy for buyers, sellers, and investors navigating the market.',
      features: [
        'Market trend analysis',
        'Investment strategy development',
        'Due diligence support',
        'Negotiation assistance',
        'Legal and tax guidance',
      ],
      color: 'gold',
    },
  ];

  const process = [
    { step: '01', title: 'Consultation', description: 'Understand your investment goals and risk appetite' },
    { step: '02', title: 'Analysis', description: 'Identify suitable opportunities based on your profile' },
    { step: '03', title: 'Selection', description: 'Present curated options with detailed insights' },
    { step: '04', title: 'Investment', description: 'Facilitate seamless investment execution' },
    { step: '05', title: 'Growth', description: 'Monitor and optimize your portfolio performance' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20" data-testid="services-page">
      {/* Hero Section */}
      <section className="py-24 relative" data-testid="services-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-wide">
              OUR <span className="text-gold">SERVICES</span>
            </h1>
            <p className="font-manrope text-lg text-white/70 leading-relaxed">
              Comprehensive real estate solutions designed to help you build and grow your 
              investment portfolio with confidence and expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 border-y border-white/10" data-testid="services-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={service.title}
                className={`bg-[#141414] border-white/5 hover:border-gold/30 transition-all duration-500 group card-hover overflow-hidden opacity-0 animate-fade-in stagger-${index + 1}`}
                data-testid={`service-card-${index}`}
              >
                <CardContent className="p-8 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <service.icon className="h-8 w-8 text-gold" />
                  </div>
                  
                  <div>
                    <h3 className="font-cinzel text-2xl font-bold text-gold mb-3">
                      {service.title}
                    </h3>
                    <p className="font-manrope text-white/70 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-white/10">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                        <span className="font-manrope text-white/60 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24" data-testid="process-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white tracking-wide mb-4">
              OUR <span className="text-gold">PROCESS</span>
            </h2>
            <p className="font-manrope text-white/60 max-w-2xl mx-auto">
              A streamlined approach to help you achieve your investment goals
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {process.map((item, index) => (
              <div
                key={item.step}
                className={`relative text-center group opacity-0 animate-fade-in stagger-${index + 1}`}
              >
                {/* Connector Line */}
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-white/10" />
                )}
                
                <div className="relative">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors border border-gold/30">
                    <span className="font-cinzel text-xl font-bold text-gold">{item.step}</span>
                  </div>
                  <h3 className="font-cinzel text-lg font-semibold text-white mt-4 mb-2">
                    {item.title}
                  </h3>
                  <p className="font-manrope text-white/60 text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0d0d0d]" data-testid="services-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mb-6 tracking-wide">
            READY TO START <span className="text-gold">INVESTING</span>?
          </h2>
          <p className="font-manrope text-white/60 mb-10 text-lg">
            Get in touch with our experts today and take the first step towards 
            building your premium real estate portfolio.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" data-testid="services-contact-btn">
              <Button className="bg-gold text-black font-bold hover:bg-gold-light rounded-full px-8 py-6 text-lg shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/signup" data-testid="services-signup-btn">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;

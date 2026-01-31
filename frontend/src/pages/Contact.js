import React, { useState } from 'react';
import { MapPin, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/contact`, formData);
      setSubmitted(true);
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      content: '123 Business District, Financial Hub, City – 500001',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@100croreclub.com',
      href: 'mailto:info@100croreclub.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      content: '+91 98765 43210',
      href: 'tel:+919876543210',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20" data-testid="contact-page">
      {/* Hero Section */}
      <section className="py-24 relative" data-testid="contact-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-wide">
              CONTACT <span className="text-gold">US</span>
            </h1>
            <p className="font-manrope text-lg text-white/70 leading-relaxed">
              Have questions about our services or want to discuss investment opportunities? 
              We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 border-t border-white/10" data-testid="contact-form-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="font-cinzel text-2xl font-bold text-white mb-4">
                  GET IN <span className="text-gold">TOUCH</span>
                </h2>
                <p className="font-manrope text-white/60 leading-relaxed">
                  Our team is here to assist you with any inquiries about real estate 
                  investments. Reach out to us through any of the channels below.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <Card key={info.title} className="bg-[#141414] border-white/5">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                        <info.icon className="h-6 w-6 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-cinzel text-lg text-white mb-1">{info.title}</h3>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="font-manrope text-white/60 hover:text-gold transition-colors"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="font-manrope text-white/60">{info.content}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Map Placeholder */}
              <Card className="bg-[#141414] border-white/5 overflow-hidden">
                <div className="h-48 bg-[#1a1a1a] flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-gold mx-auto mb-2" />
                    <p className="font-manrope text-white/40 text-sm">Interactive map coming soon</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="animate-fade-in stagger-2">
              <Card className="bg-[#141414] border-white/5">
                <CardContent className="p-8">
                  <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                    SEND US A <span className="text-gold">MESSAGE</span>
                  </h2>

                  {submitted ? (
                    <div className="text-center py-12 space-y-4" data-testid="contact-success">
                      <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="font-cinzel text-xl text-white">Message Sent!</h3>
                      <p className="font-manrope text-white/60">
                        Thank you for reaching out. We'll get back to you soon.
                      </p>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 mt-4"
                        onClick={() => setSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white font-manrope">
                          Your Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/40 focus:border-gold h-12"
                          data-testid="contact-name-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white font-manrope">
                          Your Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/40 focus:border-gold h-12"
                          data-testid="contact-email-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-white font-manrope">
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="How can we help you?"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/40 focus:border-gold resize-none"
                          data-testid="contact-message-input"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gold text-black font-bold hover:bg-gold-light h-12 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                        data-testid="contact-submit-btn"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Send Message
                          </span>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

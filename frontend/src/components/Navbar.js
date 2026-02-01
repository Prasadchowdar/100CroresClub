import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-heavy" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" data-testid="navbar-logo">
            <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
              <span className="font-cinzel font-bold text-black text-sm">100</span>
            </div>
            <span className="font-cinzel text-xl font-bold text-white group-hover:text-gold transition-colors duration-300">
              100CRORECLUB
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-manrope text-sm font-medium transition-colors duration-300 ${isActive(link.path)
                    ? 'text-gold'
                    : 'text-white/70 hover:text-white'
                  }`}
                data-testid={`nav-link-${link.name.toLowerCase().replace(' ', '-')}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side - Auth/User */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-full"
                    data-testid="user-menu-trigger"
                  >
                    <Avatar className="h-8 w-8 border border-gold/50">
                      <AvatarFallback className="bg-gold/20 text-gold font-cinzel text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white font-manrope text-sm">{user?.name}</span>
                    <ChevronDown className="h-4 w-4 text-white/50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-[#1a1a1a] border-white/10" align="end">
                  <DropdownMenuItem
                    className="text-white hover:bg-white/10 cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                    data-testid="menu-dashboard"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-white hover:bg-white/10 cursor-pointer"
                    onClick={() => navigate('/profile')}
                    data-testid="menu-profile"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    className="text-red-400 hover:bg-white/10 cursor-pointer"
                    onClick={handleLogout}
                    data-testid="menu-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" data-testid="login-btn">
                  <Button variant="ghost" className="text-white hover:text-gold hover:bg-transparent">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" data-testid="signup-btn">
                  <Button className="bg-gold text-black font-semibold hover:bg-gold-light rounded-full px-6">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-heavy border-t border-white/10" data-testid="mobile-menu">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-3 px-4 rounded-lg font-manrope ${isActive(link.path)
                    ? 'text-gold bg-gold/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10">
              {isAuthenticated ? (
                <>
                  <button
                    className="w-full text-left py-3 px-4 rounded-lg text-red-400 hover:bg-white/5"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="block py-3 px-4 rounded-lg text-center text-white border border-white/20 hover:bg-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block py-3 px-4 rounded-lg text-center bg-gold text-black font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

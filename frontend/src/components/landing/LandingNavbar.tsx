import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Compass, Briefcase, FileText, Menu, X, ArrowRight, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/40 backdrop-blur-2xl border-b border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-fuchsia-400 flex items-center justify-center shadow-[0_4px_16px_rgba(139,92,246,0.5)] group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-['Outfit']">
                EngiPath <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
              </span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-purple-300/80">
                Aariya Tech
              </p>
            </div>
          </Link>

          {/* Desktop Navigation (Glassmorphic Pill) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
            <Link
              to="/"
              className="px-4 py-2 rounded-full text-xs font-bold text-white bg-white/15 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/courses"
              className="px-4 py-2 rounded-full text-xs font-semibold text-stone-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Course Finder
            </Link>
            <Link
              to="/internships"
              className="px-4 py-2 rounded-full text-xs font-semibold text-stone-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              Internships
            </Link>
            <Link
              to="/resume"
              className="px-4 py-2 rounded-full text-xs font-semibold text-stone-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              Resume AI
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="mint"
                size="md"
                onClick={() => navigate('/dashboard')}
                leftIcon={<User className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Dashboard ({user?.name ? user.name.split(' ')[0] : 'Student'})
              </Button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all duration-200 shadow-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_4px_20px_rgba(147,51,234,0.45)] transition-all duration-200 flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#07030d]/95 backdrop-blur-2xl border-b border-white/15 px-4 py-5 space-y-3 mt-2 shadow-2xl text-white">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-white hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-stone-300 hover:bg-white/10"
          >
            Course Finder
          </Link>
          <Link
            to="/internships"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-stone-300 hover:bg-white/10"
          >
            Internships
          </Link>
          <Link
            to="/resume"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-stone-300 hover:bg-white/10"
          >
            Resume Intelligence
          </Link>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="mint"
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full justify-center"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 text-center"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

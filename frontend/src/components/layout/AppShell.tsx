import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  GitCompare,
  Briefcase,
  FileText,
  LogOut,
  User,
  Sparkles,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useClassesStore } from '../../store/classesStore';
import { healthApi } from '../../api/health';

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    accent: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
    badge: null,
  },
  {
    name: 'AI Courses',
    path: '/courses',
    icon: BookOpen,
    accent: 'bg-indigo-500/10 text-indigo-700 border-indigo-300',
    badge: 'Live Search',
  },
  {
    name: 'Compare Courses',
    path: '/courses/compare',
    icon: GitCompare,
    accent: 'bg-amber-500/10 text-amber-700 border-amber-300',
    badge: 'AI Compare',
  },
  {
    name: 'Internships',
    path: '/internships',
    icon: Briefcase,
    accent: 'bg-rose-500/10 text-rose-700 border-rose-300',
    badge: 'Dual Match',
  },
  {
    name: 'Resume Analyzer',
    path: '/resume',
    icon: FileText,
    accent: 'bg-teal-500/10 text-teal-700 border-teal-300',
    badge: 'Gemini AI',
  },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { selectedForComparison } = useClassesStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    healthApi.checkHealth()
      .then(res => setBackendHealthy(res.status === 'healthy' || res.status === 'ok'))
      .catch(() => setBackendHealthy(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-stone-800 flex flex-col font-sans selection:bg-[#9CE3C0]/40">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-[#F8F9F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#82E2B0] to-[#5EEAD4] p-0.5 shadow-sm shadow-[#82E2B0]/30 transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-[#1e293b] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#82E2B0]" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold font-display tracking-tight text-stone-900 block leading-none">
                  EngiPath <span className="text-emerald-600 font-extrabold">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-500">
                  Engineering Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.path === '/courses/compare' && selectedForComparison.length > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-400 text-stone-900">
                        {selectedForComparison.length}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Area: System Status & User Profile */}
          <div className="flex items-center gap-3">
            {/* Backend Health Chip */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-white shadow-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealthy === true
                    ? 'bg-emerald-500 animate-pulse'
                    : backendHealthy === false
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-stone-500">API:</span>
              <span
                className={`font-semibold ${
                  backendHealthy === true
                    ? 'text-emerald-700'
                    : backendHealthy === false
                    ? 'text-rose-700'
                    : 'text-amber-700'
                }`}
              >
                {backendHealthy === true ? 'Online' : backendHealthy === false ? 'Offline' : 'Connecting'}
              </span>
            </div>

            {/* User Profile Tile */}
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9E9E] via-[#C4B5FD] to-[#9CE3C0] p-0.5 shadow-xs">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <User className="w-4 h-4 text-stone-700" />
                </div>
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-stone-800">
                  {user?.full_name || 'Engineering Student'}
                </div>
                <div className="text-[10px] text-stone-500 font-medium truncate max-w-[120px]">
                  {user?.branch ? `${user.branch}` : user?.email || 'B.Tech Student'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-200/70"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-stone-200/80 mt-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* Modern Authenticated Footer */}
      <footer className="border-t border-stone-200/80 bg-[#F8F9F5]/70 py-6 px-4 sm:px-6 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700">EngiPath AI</span>
            <span>—</span>
            <span>Production Engineering Career Intelligence</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-stone-900 flex items-center gap-1 transition-colors">
              <span>Public Landing</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-stone-400">|</span>
            <span className="text-stone-500">Dual-Recommendation Engine Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

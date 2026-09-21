import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, clearError, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Return to destination if redirected from a protected route
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email and password.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Invalid credentials. Please verify and try again.';
      setFormError(msg);
    }
  };

  const handleQuickFill = () => {
    setEmail('kshitij.patil@engineering.edu');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#9CE3C0]/40">
      {/* Background Decorative Pastels */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-200/30 via-emerald-100/40 to-amber-100/30 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Badge */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#82E2B0] to-[#5EEAD4] p-0.5 shadow-md shadow-[#82E2B0]/30 transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#1e293b] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#82E2B0]" />
            </div>
          </div>
          <span className="text-2xl font-bold font-display tracking-tight text-stone-900">
            EngiPath <span className="text-emerald-600 font-extrabold">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Access your AI engineering career command center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card variant="default" className="py-8 px-6 sm:px-10 border-stone-200/90 shadow-xl bg-white/95">
          {formError && (
            <div className="mb-6">
              <Alert
                variant="danger"
                title="Authentication Failed"
                message={formError}
                onClose={() => setFormError(null)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Academic / Personal Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              icon={Mail}
              required
              autoFocus
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Password
                </label>
                <span className="text-[11px] text-stone-400 hover:text-stone-600 cursor-pointer">
                  Forgot?
                </span>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                icon={Lock}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="mt-2 font-bold"
            >
              <span>Sign In to EngiPath</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Hint */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col items-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs text-stone-500 hover:text-emerald-700 font-medium transition-colors flex items-center gap-1.5 bg-stone-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full border border-stone-200 hover:border-emerald-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fill sample demo credentials</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-stone-600">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
            >
              Sign up as a student
            </Link>
          </div>
        </Card>

        {/* Feature Pill Footer */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Tokens</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Real-time Flask Backend</span>
          </div>
        </div>
      </div>
    </div>
  );
};

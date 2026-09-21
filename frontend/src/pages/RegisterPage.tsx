import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, GraduationCap, Building2, Target, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, clearError, isAuthenticated } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('Computer Science Engineering');
  const [gradYear, setGradYear] = useState('2026');
  const [targetRole, setTargetRole] = useState('AI / ML Engineer');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setFormError('Name, Email, and Password are required.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await register({
        email: email.trim(),
        password,
        name: fullName.trim(),
        full_name: fullName.trim(),
        college: college.trim() || undefined,
        branch: branch.trim() || undefined,
        year: gradYear ? `${gradYear} Grad` : '3rd Year',
        graduation_year: gradYear ? parseInt(gradYear, 10) : undefined,
        target_role: targetRole.trim() || undefined,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Registration failed. Please check your inputs.';
      setFormError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#9CE3C0]/40">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#9CE3C0]/25 via-[#C4B5FD]/20 to-[#FF9E9E]/25 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center px-4">
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
          Create Student Profile
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Supercharge your career discovery with dual-engine AI recommendations
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Card variant="default" className="py-8 px-6 sm:px-10 border-stone-200/90 shadow-xl bg-white/95">
          {formError && (
            <div className="mb-6">
              <Alert
                variant="danger"
                title="Registration Error"
                message={formError}
                onClose={() => setFormError(null)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kshitij Patil"
              icon={User}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                icon={Mail}
                required
              />
              <Input
                label="Password (min 6 chars) *"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                icon={Lock}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="College / University"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Pune Institute of Tech"
                icon={Building2}
              />
              <Input
                label="Degree / Major"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                icon={GraduationCap}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Graduation Year
                </label>
                <select
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/80 border border-stone-200 text-stone-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#9CE3C0] focus:border-transparent transition-all shadow-clay-card"
                >
                  <option value="2025">2025 (Final Year)</option>
                  <option value="2026">2026 (3rd Year)</option>
                  <option value="2027">2027 (2nd Year)</option>
                  <option value="2028">2028 (1st Year)</option>
                </select>
              </div>

              <Input
                label="Target Engineering Role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. AI / ML Engineer"
                icon={Target}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="mt-4 font-bold"
            >
              <span>Create Account & Continue</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-stone-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
            >
              Sign in here
            </Link>
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Candidate Session</span>
          </div>
          <span>•</span>
          <span>Zero Mock Data</span>
        </div>
      </div>
    </div>
  );
};

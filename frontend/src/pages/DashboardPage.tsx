import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  GitCompare,
  Briefcase,
  FileText,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Award,
  Layers,
  Zap,
  Activity,
  Compass,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useClassesStore } from '../store/classesStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedForComparison } = useClassesStore();

  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const studentSkills = [
    { name: 'Python 3', category: 'Backend', color: 'accent-mint' as const },
    { name: 'FastAPI / Flask', category: 'API', color: 'accent-teal' as const },
    { name: 'PyTorch & ML', category: 'AI', color: 'accent-purple' as const },
    { name: 'React 18 & TypeScript', category: 'Frontend', color: 'accent-blue' as const },
    { name: 'PostgreSQL', category: 'Database', color: 'accent-amber' as const },
    { name: 'Docker & Microservices', category: 'DevOps', color: 'accent-coral' as const },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Welcome Banner (Reference 2 Clay-Tiled Tactile Box) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-stone-700/50">
        {/* Glow Spheres in Background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#82E2B0]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#C4B5FD]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#82E2B0]">
              <Sparkles className="w-3.5 h-3.5 text-[#82E2B0]" />
              <span>Career Intelligence Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-display tracking-tight text-white">
              {greeting}, <span className="text-[#82E2B0]">{user?.full_name || 'Kshitij'}</span>!
            </h1>
            <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
              Target Track: <strong className="text-white font-semibold">{user?.target_role || 'AI / Full Stack Engineer'}</strong>. Your dual-engine recommendation feed and course matchers are synchronized with real-time backend data.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-stone-400">Enrolled:</span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-white/10 text-stone-200 border border-white/10">
                {user?.college || 'Pune Institute of Technology'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-white/10 text-stone-200 border border-white/10">
                {user?.branch || 'B.Tech CS'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#82E2B0]/20 text-[#82E2B0] border border-[#82E2B0]/30 font-semibold">
                Class of {user?.graduation_year || '2026'}
              </span>
            </div>
          </div>

          {/* Quick Metrics Clay Tile */}
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 flex md:flex-col gap-4 items-center justify-center min-w-[200px]">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#82E2B0]">94%</div>
              <div className="text-[11px] font-medium text-stone-300 uppercase tracking-wider mt-0.5">
                Profile Readiness
              </div>
            </div>
            <div className="w-px md:w-full h-8 md:h-px bg-white/15" />
            <div className="text-center">
              <div className="text-xs font-semibold text-white">AI Engine</div>
              <div className="text-[10px] text-emerald-300 flex items-center justify-center gap-1 mt-0.5">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>Gemini 2.5 Flash</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars: Tactile Clay Tiled Grid (Reference Image 2 Design) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-stone-900">
              Career Command Center
            </h2>
            <p className="text-xs text-stone-500">
              Select a module to discover courses, evaluate career fits, and find internships
            </p>
          </div>
          {selectedForComparison.length > 0 && (
            <Link
              to="/courses/compare"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs hover:bg-amber-200 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5 text-amber-700" />
              <span>{selectedForComparison.length} Courses in Comparison Tray</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: AI Course Discovery (Mint Accent) */}
          <Card
            variant="clay-mint"
            isInteractive
            className="flex flex-col justify-between p-6 transition-transform hover:-translate-y-1"
            onClick={() => navigate('/courses')}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center border border-emerald-400/40 shadow-xs">
                  <BookOpen className="w-6 h-6 text-emerald-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                  Semantic
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1.5">
                Course Discovery
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Find online, offline, and hybrid courses with interactive Leaflet maps and fee breakdowns.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-emerald-200/60 text-xs font-bold text-emerald-800">
              <span>Search Courses</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>

          {/* Card 2: AI Course Comparison (Amber Accent) */}
          <Card
            variant="clay-amber"
            isInteractive
            className="flex flex-col justify-between p-6 transition-transform hover:-translate-y-1"
            onClick={() => navigate('/courses/compare')}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center border border-amber-400/40 shadow-xs">
                  <GitCompare className="w-6 h-6 text-amber-800" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-600 text-white">
                  Gemini Evaluator
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1.5">
                Course Comparison
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed mb-4">
                Side-by-side comparison of 2–3 shortlisted classes with Gemini AI syllabus trade-off analysis.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-amber-200/60 text-xs font-bold text-amber-900">
              <span>Compare Classes</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>

          {/* Card 3: Smart Internships (Coral Accent) */}
          <Card
            variant="clay-coral"
            isInteractive
            className="flex flex-col justify-between p-6 transition-transform hover:-translate-y-1"
            onClick={() => navigate('/internships')}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-900 flex items-center justify-center border border-rose-400/40 shadow-xs">
                  <Briefcase className="w-6 h-6 text-rose-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-600 text-white">
                  Dual-Engine
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1.5">
                Smart Internships
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed mb-4">
                TWO separate recommendation feeds (Skill-Based vs Resume-Based) plus live web discovery.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-rose-200/60 text-xs font-bold text-rose-900">
              <span>Match Internships</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>

          {/* Card 4: AI Resume Analyzer (Teal/Lavender Accent) */}
          <Card
            variant="clay-purple"
            isInteractive
            className="flex flex-col justify-between p-6 transition-transform hover:-translate-y-1"
            onClick={() => navigate('/resume')}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-900 flex items-center justify-center border border-purple-400/40 shadow-xs">
                  <FileText className="w-6 h-6 text-purple-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-600 text-white">
                  Deep Parser
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1.5">
                Resume Analyzer
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed mb-4">
                Extract structured candidate profiles, skill matrices, and AI improvement recommendations.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-purple-200/60 text-xs font-bold text-purple-900">
              <span>Analyze Resume</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>
        </div>
      </div>

      {/* Student Skill Breakdown & Target Career Pathway */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Matrix Clay Tile */}
        <Card variant="default" className="lg:col-span-2 p-6 bg-white/90">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-stone-900">
                Verified Technical Skill Profile
              </h3>
            </div>
            <Link
              to="/resume"
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              Update from Resume
            </Link>
          </div>

          <p className="text-xs text-stone-500 mb-4">
            These skills feed into your Skill-Based Internship Recommendation algorithm:
          </p>

          <div className="flex flex-wrap gap-2.5">
            {studentSkills.map((skill) => (
              <Chip
                key={skill.name}
                variant={skill.color}
                size="md"
                className="font-medium shadow-xs"
              >
                <span>{skill.name}</span>
                <span className="ml-1.5 text-[10px] opacity-70">({skill.category})</span>
              </Chip>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Target Career Role: <strong>{user?.target_role || 'AI & Machine Learning Engineer'}</strong></span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/internships')}
            >
              Run Internship Match
            </Button>
          </div>
        </Card>

        {/* Quick Launchpad Clay Tile */}
        <Card variant="clay-blue" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-5 h-5 text-blue-700" />
              <h3 className="text-base font-bold text-stone-900">
                Action Launchpad
              </h3>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed mb-4">
              Direct access to live searches and backend intelligence jobs:
            </p>

            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/courses"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 hover:bg-white text-xs font-semibold text-stone-800 transition-colors shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Search Institutes in Pune / Bangalore</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </Link>
              </li>
              <li>
                <Link
                  to="/internships"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 hover:bg-white text-xs font-semibold text-stone-800 transition-colors shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Discover Web Internships</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </Link>
              </li>
              <li>
                <Link
                  to="/resume"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 hover:bg-white text-xs font-semibold text-stone-800 transition-colors shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    <span>Upload Resume for Profile Sync</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-200/50 text-[11px] text-blue-800 font-medium">
            Connected to Flask Backend API at localhost:5000
          </div>
        </Card>
      </div>
    </div>
  );
};

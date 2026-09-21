import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Leaf,
  Palette,
  Briefcase,
} from 'lucide-react';

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Copy & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            {/* Glass Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Powered Career Platform</span>
            </div>

            {/* Display Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6 font-['Outfit'] drop-shadow-md">
              Your Career.{' '}
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
                AI Guided.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-stone-300 font-normal leading-relaxed max-w-xl mb-8">
              Find the right courses. Discover the best internships.
              Make career decisions with the real-time power of AI.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
              <button
                onClick={() => navigate('/courses')}
                className="px-8 py-3.5 rounded-full text-base font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_8px_25px_rgba(147,51,234,0.5)] transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Find Courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/internships')}
                className="px-8 py-3.5 rounded-full text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Find Internships</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Student Avatar Social Proof (Glassmorphic) */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-2xl px-5 py-3 rounded-full border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="flex -space-x-2.5 overflow-hidden">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-purple-900 bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center text-white text-[11px] font-bold">
                  KS
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-purple-900 bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[11px] font-bold">
                  AR
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-purple-900 bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white text-[11px] font-bold">
                  PR
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-purple-900 bg-gradient-to-tr from-pink-400 to-rose-500 flex items-center justify-center text-white text-[11px] font-bold">
                  NV
                </div>
              </div>
              <div className="text-xs text-stone-200 font-medium">
                <span className="font-bold text-white">Engineering students</span> growing with live AI guidance
              </div>
            </div>
          </div>

          {/* Right Column: Conceptual Circuit-Brain Graphic (Reference 1 Glassmorphic) */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Ambient Background Aura */}
            <div className="absolute w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-purple-600/30 via-indigo-500/25 to-fuchsia-500/25 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
              {/* Central Glass Node */}
              <div className="w-36 h-36 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/25 shadow-[0_16px_40px_rgba(139,92,246,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] flex flex-col items-center justify-center p-4 z-20 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-fuchsia-400 flex items-center justify-center text-white shadow-lg mb-2">
                  <Sparkles className="w-7 h-7" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-white font-['Outfit']">
                  EngiPath AI
                </span>
                <span className="text-[9px] text-purple-200 font-medium mt-0.5">
                  Career Engine
                </span>
              </div>

              {/* Connecting Branch: Top Left (Engineering & Tech) */}
              <div className="absolute top-4 left-6 sm:left-12 flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:scale-105 z-20">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/25 shadow-lg flex items-center justify-center text-amber-400 group-hover:border-amber-400/80 transition-colors">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-white mt-1.5 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 shadow-sm">
                  Engineering & Tech
                </span>
              </div>

              {/* Connecting Branch: Top Right (Sustainability & Science) */}
              <div className="absolute top-4 right-6 sm:right-12 flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:scale-105 z-20">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/25 shadow-lg flex items-center justify-center text-emerald-400 group-hover:border-emerald-400/80 transition-colors">
                  <Leaf className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-white mt-1.5 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 shadow-sm">
                  Sustainability & Science
                </span>
              </div>

              {/* Connecting Branch: Bottom Left (Creative & Media) */}
              <div className="absolute bottom-4 left-6 sm:left-12 flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:scale-105 z-20">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/25 shadow-lg flex items-center justify-center text-purple-400 group-hover:border-purple-400/80 transition-colors">
                  <Palette className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-white mt-1.5 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 shadow-sm">
                  Creative & Media
                </span>
              </div>

              {/* Connecting Branch: Bottom Right (Business & Mgmt) */}
              <div className="absolute bottom-4 right-6 sm:right-12 flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:scale-105 z-20">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/25 shadow-lg flex items-center justify-center text-blue-400 group-hover:border-blue-400/80 transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-white mt-1.5 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 shadow-sm">
                  Business & Analytics
                </span>
              </div>

              {/* SVG Connecting Circuit Traces */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none -z-0 opacity-40">
                <line x1="25%" y1="20%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="75%" y1="20%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="25%" y1="80%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="75%" y1="80%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

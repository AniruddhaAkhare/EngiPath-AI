import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, Briefcase, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

export const ExploreSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative z-20 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit'] mb-3">
            Explore. Decide.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
              Succeed.
            </span>
          </h2>
          <p className="text-base text-stone-300 font-normal">
            Everything engineering students need to build their future, in one intelligent live platform.
          </p>
        </div>

        {/* Dual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Courses */}
          <div className="bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-2xl rounded-[36px] border border-white/20 hover:border-white/35 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-bl-full pointer-events-none -z-10" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>Location-Aware Live Discovery</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] mb-3">
                Find the Right Courses
              </h3>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6">
                Search, compare and discover verified coaching institutes and specialized technical training near you. Real fees, duration, topics, and route directions.
              </p>

              <div className="space-y-2.5 mb-8">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free-text search for AI/ML, Full Stack, DSA & more</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI side-by-side comparison of 2 or 3 institutes</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive map with OpenStreetMap & Google Maps links</span>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => navigate('/courses')}
                className="px-6 py-3 rounded-full text-sm font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.4)] transition-all duration-200 flex items-center gap-2 group-hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Internships */}
          <div className="bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-2xl rounded-[36px] border border-white/20 hover:border-white/35 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-bl-full pointer-events-none -z-10" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                <Briefcase className="w-7 h-7" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Resume & Skill Intelligence</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] mb-3">
                Discover Internships
              </h3>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6">
                Get AI-recommended roles tailored to your exact skills, or upload your resume for automated profile extraction and live web job discovery.
              </p>

              <div className="space-y-2.5 mb-8">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated & separate skill-based recommendations</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Resume analysis with deep skill & project extraction</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Live web opportunities with direct application links</span>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => navigate('/internships')}
                className="px-6 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_4px_20px_rgba(147,51,234,0.45)] transition-all duration-200 flex items-center gap-2 group-hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Internships</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

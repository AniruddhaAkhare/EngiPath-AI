import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#07030d]/85 backdrop-blur-2xl border-t border-white/15 py-14 relative z-20 text-stone-300 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-fuchsia-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-white font-['Outfit']">
                EngiPath <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
              </span>
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              AI-Powered Course & Internship Discovery Platform for Engineering Students.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Web Intelligence</span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-['Outfit']">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400 font-medium">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  Smart Course Finder
                </Link>
              </li>
              <li>
                <Link to="/internships" className="hover:text-white transition-colors">
                  Skill Recommendations
                </Link>
              </li>
              <li>
                <Link to="/resume" className="hover:text-white transition-colors">
                  Resume Intelligence
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  Side-by-Side Comparison
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-['Outfit']">
              Engineering Hub
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400 font-medium">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Student Account
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:5000/swagger/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Interactive Swagger UI
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Prepared By / Credits */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-['Outfit']">
              Crafted By
            </h4>
            <div className="bg-white/[0.06] backdrop-blur-xl p-4 rounded-2xl border border-white/15">
              <p className="text-xs font-bold text-white">AARIYA TECH</p>
              <p className="text-[11px] text-stone-300 italic mt-0.5">
                Building Intelligent Solutions for the Next Generation
              </p>
              <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-stone-400">
                <strong className="text-stone-300">Project:</strong> EngiPath AI
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <div>
            &copy; {new Date().getFullYear()} EngiPath AI. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with precision &</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
            <span>for engineering students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

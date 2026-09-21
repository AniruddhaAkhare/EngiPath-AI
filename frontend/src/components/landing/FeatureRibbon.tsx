import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Briefcase, FileText, Scale, Cpu, ArrowUpRight } from 'lucide-react';

export const FeatureRibbon: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'AI Career Mapping',
      subtitle: 'Personalized path tailored for engineers',
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      bg: 'bg-purple-500/20 border border-purple-500/30 text-purple-300',
      route: '/dashboard',
    },
    {
      title: 'Smart Course Finder',
      subtitle: 'Live institutes & courses near you',
      icon: <Compass className="w-5 h-5 text-blue-400" />,
      bg: 'bg-blue-500/20 border border-blue-500/30 text-blue-300',
      route: '/courses',
    },
    {
      title: 'Internship Match',
      subtitle: 'Skill & resume recommendation lists',
      icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300',
      route: '/internships',
    },
    {
      title: 'Resume Intelligence',
      subtitle: 'AI profile extraction from PDF/DOCX',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/20 border border-amber-500/30 text-amber-300',
      route: '/resume',
    },
    {
      title: 'Compare & Decide',
      subtitle: '2-3 class side-by-side AI evaluation',
      icon: <Scale className="w-5 h-5 text-rose-400" />,
      bg: 'bg-rose-500/20 border border-rose-500/30 text-rose-300',
      route: '/courses',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20 w-full">
      <div className="bg-white/[0.08] backdrop-blur-2xl rounded-[32px] border border-white/20 p-3 sm:p-4 shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {features.map((feature, idx) => (
            <div
              key={idx}
              onClick={() => navigate(feature.route)}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/25 transition-all duration-300 cursor-pointer group shadow-sm hover:scale-[1.02]"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${feature.bg} shadow-md group-hover:scale-105 transition-transform`}
              >
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate font-['Outfit']">
                    {feature.title}
                  </h4>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-stone-300 truncate mt-0.5 font-normal">
                  {feature.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

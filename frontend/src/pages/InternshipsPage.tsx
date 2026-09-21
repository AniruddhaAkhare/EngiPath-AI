import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Code2,
  FileText,
  Globe,
  ExternalLink,
  Target,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { internshipsApi } from '../api/internships';
import { InternshipRecommendation, LiveInternshipResult } from '../types/internships';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';

export const InternshipsPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  // Passed state from resume analyzer (if any)
  const resumeState = location.state as {
    analysisId?: string;
    skills?: string[];
    role?: string;
  } | undefined;

  const [branch, setBranch] = useState(user?.branch || 'Computer Science Engineering');
  const [year, setYear] = useState('3rd Year');
  const [skills, setSkills] = useState<string[]>(
    resumeState?.skills && resumeState.skills.length > 0
      ? resumeState.skills
      : ['Python', 'FastAPI', 'PyTorch', 'React', 'Docker', 'PostgreSQL']
  );
  const [newSkillInput, setNewSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>([
    user?.target_role || 'AI / Machine Learning Engineer',
    'Full Stack Web Development',
  ]);
  const [newInterestInput, setNewInterestInput] = useState('');

  const [skillRecommendations, setSkillRecommendations] = useState<InternshipRecommendation[]>([]);
  const [resumeRecommendations, setResumeRecommendations] = useState<InternshipRecommendation[]>([]);
  const [liveInternships, setLiveInternships] = useState<LiveInternshipResult[]>([]);

  const [activeTab, setActiveTab] = useState<'all' | 'skill' | 'resume' | 'live'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch on mount
  useEffect(() => {
    handleFetchRecommendations();
  }, []);

  const handleFetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await internshipsApi.getRecommendations({
        branch: branch.trim(),
        year: year.trim(),
        skills: skills,
        interests: interests,
        resume_analysis_id: resumeState?.analysisId,
      });

      setSkillRecommendations(response.skill_based_recommendations || []);
      setResumeRecommendations(response.resume_based_recommendations || []);
      setLiveInternships(response.live_internships || []);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to fetch internship recommendations. Please ensure backend is active on port 5000.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newInterestInput.trim() && !interests.includes(newInterestInput.trim())) {
      setInterests([...interests, newInterestInput.trim()]);
      setNewInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter((i) => i !== interestToRemove));
  };

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-stone-700/50 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#82E2B0] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dual-Engine AI Internship Matcher</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mb-2">
            Smart Engineering Internships
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Strict PRD enforcement: Two separate, unmerged recommendation feeds powered by your verified technical skill stack and candidate profile.
          </p>
        </div>
      </div>

      {error && (
        <Alert
          variant="danger"
          title="Recommendation Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Profile & Skill Filter Drawer (Tactile Clay Box) */}
      <Card variant="default" className="p-6 bg-white/95 shadow-clay-card border-stone-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-stone-900">
              Candidate Profile & Skill Controls
            </h2>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleFetchRecommendations}
            isLoading={isLoading}
            className="font-bold text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>Recalculate Matches</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <Input
            label="Degree & Branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g. Computer Science"
            icon={GraduationCap}
          />
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Academic Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#9CE3C0] shadow-xs"
            >
              <option value="1st Year">1st Year (Freshman)</option>
              <option value="2nd Year">2nd Year (Sophomore)</option>
              <option value="3rd Year">3rd Year (Junior)</option>
              <option value="Final Year">4th Year (Senior)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Target Domains / Roles
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-stone-50 border border-stone-200 min-h-[42px]">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800"
                >
                  <span>{interest}</span>
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:text-indigo-950 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                onKeyDown={handleAddInterest}
                placeholder="+ Add domain and press Enter"
                className="text-xs bg-transparent outline-none flex-1 min-w-[140px] text-stone-700 px-1"
              />
            </div>
          </div>
        </div>

        {/* Technical Skills Tags */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Active Skill Stack (Feeds into Skill-Based Engine)
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-2xl bg-stone-50 border border-stone-200 min-h-[48px]">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#82E2B0]/25 text-emerald-900 border border-emerald-300/40"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600 font-bold ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="+ Add skill (e.g. Kubernetes) and press Enter"
              className="text-xs bg-transparent outline-none flex-1 min-w-[160px] text-stone-700 px-2 py-1"
            />
          </div>
        </div>
      </Card>

      {/* Feed Tabs Controller */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            All Feeds (Side-by-Side)
          </button>
          <button
            onClick={() => setActiveTab('skill')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'skill'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Skill-Based</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {skillRecommendations.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'resume'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume-Based</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {resumeRecommendations.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'live'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Web Discovery</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {liveInternships.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Total opportunities matched: <strong className="text-stone-800">{skillRecommendations.length + resumeRecommendations.length + liveInternships.length}</strong>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-clay-card border border-stone-200/80 space-y-4">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {/* SECTION 1: SKILL-BASED RECOMMENDATIONS (SEPARATE & UNMERGED) */}
          {(activeTab === 'all' || activeTab === 'skill') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center border border-emerald-300">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display text-stone-900">
                      Feed 1: Skill-Based Recommendations
                    </h2>
                    <p className="text-xs text-stone-500">
                      Matches computed directly from your technical programming skills and coursework
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {skillRecommendations.length} Roles Matched
                </span>
              </div>

              {skillRecommendations.length === 0 ? (
                <Card variant="default" className="py-10 text-center bg-white/70">
                  <p className="text-xs text-stone-500">No skill-based matches found for the current filter stack.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {skillRecommendations.map((item, idx) => (
                    <Card
                      key={idx}
                      variant="clay-mint"
                      className="p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                            Skill Match
                          </span>
                          {item.match_score && (
                            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                              {item.match_score}% Fit
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-stone-900 mb-1">
                          {item.role}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-3 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          <span>{item.company || 'Top Tech Partner'}</span>
                          {item.location && <span>• {item.location}</span>}
                        </div>

                        {/* Why Recommended AI Pill */}
                        {item.why_recommended && (
                          <div className="p-3 rounded-2xl bg-white/80 border border-emerald-200/80 text-xs text-stone-700 mb-4 leading-relaxed">
                            <strong className="text-emerald-800 font-bold block mb-0.5">
                              Why Recommended:
                            </strong>
                            {item.why_recommended}
                          </div>
                        )}

                        {/* Skills Needed */}
                        <div className="mb-4">
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                            Required Skills:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {item.skills_needed?.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-stone-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* What you can achieve */}
                        {item.what_you_can_achieve && item.what_you_can_achieve.length > 0 && (
                          <div className="mb-4">
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                              Learning Outcomes:
                            </span>
                            <ul className="space-y-1 text-xs text-stone-600">
                              {item.what_you_can_achieve.slice(0, 2).map((ach, aIdx) => (
                                <li key={aIdx} className="flex items-start gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{ach}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-700">
                          {item.stipend || item.mode || 'Competitive Stipend'}
                        </span>
                        {item.application_url || item.source_url ? (
                          <a
                            href={item.application_url || item.source_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                          >
                            <span>Apply</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <button className="text-xs font-bold text-emerald-800 hover:underline">
                            View Details
                          </button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: RESUME-BASED RECOMMENDATIONS (SEPARATE & UNMERGED) */}
          {(activeTab === 'all' || activeTab === 'resume') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-purple-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center border border-purple-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display text-stone-900">
                      Feed 2: Resume-Based Recommendations
                    </h2>
                    <p className="text-xs text-stone-500">
                      Matches computed from candidate projects, extracurriculars, and comprehensive resume profile
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  {resumeRecommendations.length} Roles Matched
                </span>
              </div>

              {resumeRecommendations.length === 0 ? (
                <Card variant="default" className="py-10 text-center bg-white/70">
                  <p className="text-xs text-stone-500">
                    No resume-based matches generated yet. Upload your resume in the Analyzer tab to personalize this feed.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {resumeRecommendations.map((item, idx) => (
                    <Card
                      key={idx}
                      variant="clay-purple"
                      className="p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white uppercase tracking-wider">
                            Profile Match
                          </span>
                          {item.match_score && (
                            <span className="text-xs font-extrabold text-purple-800 bg-purple-200/60 px-2 py-0.5 rounded-md">
                              {item.match_score}% Fit
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-stone-900 mb-1">
                          {item.role}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-3 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          <span>{item.company || 'Enterprise Partner'}</span>
                          {item.location && <span>• {item.location}</span>}
                        </div>

                        {item.why_recommended && (
                          <div className="p-3 rounded-2xl bg-white/80 border border-purple-200/80 text-xs text-stone-700 mb-4 leading-relaxed">
                            <strong className="text-purple-800 font-bold block mb-0.5">
                              Candidate Fit Rationale:
                            </strong>
                            {item.why_recommended}
                          </div>
                        )}

                        <div className="mb-4">
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                            Key Core Competencies:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {item.skills_needed?.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-purple-200 text-stone-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {item.what_you_can_achieve && item.what_you_can_achieve.length > 0 && (
                          <div className="mb-4">
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                              Project Responsibilities:
                            </span>
                            <ul className="space-y-1 text-xs text-stone-600">
                              {item.what_you_can_achieve.slice(0, 2).map((ach, aIdx) => (
                                <li key={aIdx} className="flex items-start gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{ach}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-purple-200/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-700">
                          {item.duration || item.mode || '3–6 Months'}
                        </span>
                        {item.application_url || item.source_url ? (
                          <a
                            href={item.application_url || item.source_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-xs"
                          >
                            <span>Apply</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <button className="text-xs font-bold text-purple-800 hover:underline">
                            View Details
                          </button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: LIVE WEB DISCOVERY OPPORTUNITIES */}
          {(activeTab === 'all' || activeTab === 'live') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-300">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display text-stone-900">
                      Live Web Discovery & Scraping Stream
                    </h2>
                    <p className="text-xs text-stone-500">
                      Real-time internship postings fetched and validated from career portals
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {liveInternships.length} Active Listings
                </span>
              </div>

              {liveInternships.length === 0 ? (
                <Card variant="default" className="py-10 text-center bg-white/70">
                  <p className="text-xs text-stone-500">No live web listings detected at the moment.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {liveInternships.map((live, idx) => (
                    <Card
                      key={idx}
                      variant="clay-amber"
                      className="p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white uppercase tracking-wider">
                            Live Opportunity
                          </span>
                          <span className="text-[10px] font-semibold text-stone-500">
                            {live.source_name || 'Web Portal'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-stone-900 mb-1">
                          {live.role}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-stone-700 mb-3 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-stone-500" />
                          <span>{live.company}</span>
                          {live.location && <span>• {live.location}</span>}
                        </div>

                        {live.description && (
                          <p className="text-xs text-stone-600 line-clamp-3 mb-4 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-amber-200/50">
                            {live.description}
                          </p>
                        )}

                        {live.skills && live.skills.length > 0 && (
                          <div className="mb-4">
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                              Stack:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {live.skills.slice(0, 4).map((s, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-amber-200 text-stone-800"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800">
                          {live.stipend || live.duration || 'Full-time / Part-time'}
                        </span>
                        {live.application_url || live.source_url ? (
                          <a
                            href={live.application_url || live.source_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
                          >
                            <span>Apply Live</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : null}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

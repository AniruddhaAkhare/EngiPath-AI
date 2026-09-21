import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Sparkles,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Code,
  ArrowRight,
  FileCheck,
  Cpu,
  Layers,
  Award,
} from 'lucide-react';
import { resumeApi } from '../api/resume';
import { ResumeAnalysisData } from '../types/resume';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Chip } from '../components/ui/Chip';
import { Alert } from '../components/ui/Alert';

export const ResumePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [branch, setBranch] = useState(user?.branch || 'Computer Science Engineering');
  const [year, setYear] = useState('3rd Year');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisData | null>(null);

  const handleFileChange = (file: File) => {
    if (!file) return;
    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setError('Please upload a valid document file (.pdf, .docx, or .txt)');
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload a resume file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await resumeApi.analyzeResume(
        selectedFile,
        branch,
        year,
        ['Python', 'FastAPI', 'React', 'Docker'],
        [user?.target_role || 'AI Engineer']
      );
      setAnalysisResult(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to analyze resume. Please ensure the backend is running and valid API key is set.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchInternships = () => {
    if (!analysisResult) return;
    const extractedSkills = [
      ...(analysisResult.profile.resume_skills || []),
      ...(analysisResult.profile.technologies || []),
      ...(analysisResult.profile.skills || []),
    ];
    // Remove duplicates
    const uniqueSkills = Array.from(new Set(extractedSkills));

    navigate('/internships', {
      state: {
        analysisId: analysisResult.analysis_id,
        skills: uniqueSkills,
        role: analysisResult.profile.domains?.[0] || user?.target_role,
      },
    });
  };

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-stone-700/50 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#82E2B0] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Deep Document Parsing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mb-2">
            AI Resume & Candidate Profile Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Upload your PDF or Word resume to extract technical proficiencies, project architectures, and automatically synchronize with our Dual-Engine Internship Matcher.
          </p>
        </div>
      </div>

      {error && (
        <Alert
          variant="danger"
          title="Analysis Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Upload and Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Dropzone */}
        <Card
          variant="default"
          className="lg:col-span-8 p-6 sm:p-8 bg-white/95 shadow-clay-card border-stone-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-stone-900">
                Upload Resume Document
              </h2>
            </div>
            <span className="text-xs text-stone-400">PDF, DOCX, or TXT (Max 10MB)</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/20'
                : 'border-stone-300 hover:border-emerald-400 bg-stone-50/60 hover:bg-emerald-50/10'
            }`}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                  <FileCheck className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-stone-900">{selectedFile.name}</div>
                <div className="text-xs text-stone-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB — Ready for Gemini analysis
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold pt-2 underline"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center border border-stone-200">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-800">
                    Click to browse or drag & drop your resume here
                  </div>
                  <div className="text-xs text-stone-400 mt-1">
                    Supports ATS-friendly PDF and Word formats
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Parsed securely without third-party data tracking</span>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleAnalyze}
              isLoading={isLoading}
              disabled={!selectedFile}
              className="w-full sm:w-auto font-bold shadow-xs"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Analyze with Gemini</span>
            </Button>
          </div>
        </Card>

        {/* Candidate Context Pill Box */}
        <Card
          variant="clay-teal"
          className="lg:col-span-4 p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-5 h-5 text-teal-800" />
              <h3 className="text-base font-bold text-stone-900">
                Academic Context
              </h3>
            </div>
            <p className="text-xs text-stone-700 mb-4 leading-relaxed">
              These fields give context to the Gemini parser to score eligibility for competitive junior internships:
            </p>

            <div className="space-y-4">
              <Input
                label="Engineering Major"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Computer Science"
              />

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Academic Standing
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#9CE3C0] shadow-xs"
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="Final Year">Final Year (Senior)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-teal-200/60 text-[11px] text-teal-900 font-medium">
            Extracted results can be exported straight to your dual recommendation internship feed.
          </div>
        </Card>
      </div>

      {/* Extracted Profile Display (Rendered when analysisResult exists) */}
      {analysisResult && (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
          {/* Action Callout Bar */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Candidate Profile Successfully Parsed!</h3>
                <p className="text-xs text-emerald-100">
                  Analysis ID: <code className="bg-black/20 px-2 py-0.5 rounded font-mono">{analysisResult.analysis_id.slice(0, 12)}...</code> • Extracted {analysisResult.extracted_text_length} characters
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleMatchInternships}
              className="font-bold text-stone-900 bg-white hover:bg-stone-50 shadow-md whitespace-nowrap"
            >
              <span>Match Internships with this Resume</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          {/* Skills Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Technologies & Frameworks */}
            <Card variant="clay-mint" className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Code className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base font-bold text-stone-900">
                  Technologies & Frameworks
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.profile.technologies || []).length > 0 ? (
                  analysisResult.profile.technologies.map((tech, idx) => (
                    <Chip key={idx} variant="accent-mint" size="sm">
                      {tech}
                    </Chip>
                  ))
                ) : (
                  <span className="text-xs text-stone-500 italic">None detected</span>
                )}
              </div>
            </Card>

            {/* Extracted Core Skills */}
            <Card variant="clay-purple" className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-5 h-5 text-purple-800" />
                <h3 className="text-base font-bold text-stone-900">
                  Extracted Resume Skills
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.profile.resume_skills || analysisResult.profile.skills || []).length > 0 ? (
                  (analysisResult.profile.resume_skills || analysisResult.profile.skills || []).map((skill, idx) => (
                    <Chip key={idx} variant="accent-purple" size="sm">
                      {skill}
                    </Chip>
                  ))
                ) : (
                  <span className="text-xs text-stone-500 italic">None detected</span>
                )}
              </div>
            </Card>

            {/* Career Domains & Interests */}
            <Card variant="clay-coral" className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-rose-800" />
                <h3 className="text-base font-bold text-stone-900">
                  Target Domains
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.profile.domains || analysisResult.profile.interests || []).length > 0 ? (
                  (analysisResult.profile.domains || analysisResult.profile.interests || []).map((dom, idx) => (
                    <Chip key={idx} variant="accent-coral" size="sm">
                      {dom}
                    </Chip>
                  ))
                ) : (
                  <span className="text-xs text-stone-500 italic">Full Stack Engineering</span>
                )}
              </div>
            </Card>
          </div>

          {/* Projects Section */}
          {analysisResult.profile.projects && analysisResult.profile.projects.length > 0 && (
            <Card variant="default" className="p-6 bg-white">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
                <FolderGit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-stone-900">
                  Identified Engineering Projects
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.profile.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 mb-1">
                        {proj.title || `Project ${idx + 1}`}
                      </h4>
                      {proj.description && (
                        <p className="text-xs text-stone-600 line-clamp-3 mb-3 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                    </div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-stone-200/60">
                        {proj.technologies.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white text-stone-700 font-medium border border-stone-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Experience & Education Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experience */}
            <Card variant="default" className="p-6 bg-white">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-stone-900">
                  Work & Leadership Experience
                </h3>
              </div>

              {analysisResult.profile.experience && analysisResult.profile.experience.length > 0 ? (
                <div className="space-y-3">
                  {analysisResult.profile.experience.map((exp, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-stone-900">{exp.role || 'Contributor'}</div>
                        <span className="text-[10px] text-stone-500 font-medium">{exp.duration}</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mb-1">{exp.company}</div>
                      {exp.description && (
                        <p className="text-xs text-stone-600 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic py-4">No formal work experience listed (Fresh candidate profile).</p>
              )}
            </Card>

            {/* Education */}
            <Card variant="default" className="p-6 bg-white">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-stone-900">
                  Education Background
                </h3>
              </div>

              {analysisResult.profile.education && analysisResult.profile.education.length > 0 ? (
                <div className="space-y-3">
                  {analysisResult.profile.education.map((edu, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-stone-900">{edu.degree || 'B.Tech Engineering'}</div>
                        <span className="text-[10px] text-stone-500 font-medium">{edu.year}</span>
                      </div>
                      <div className="text-[11px] text-purple-700 font-semibold mb-1">{edu.institution}</div>
                      {edu.grade && (
                        <div className="text-xs text-stone-600">Grade / CGPA: {edu.grade}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                  <div className="text-xs font-bold text-stone-900">{branch}</div>
                  <div className="text-[11px] text-stone-500">{year}</div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

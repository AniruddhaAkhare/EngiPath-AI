import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GitCompare,
  Sparkles,
  ArrowLeft,
  DollarSign,
  BookOpen,
  MapPin,
  Layers,
} from 'lucide-react';
import { useClassesStore } from '../store/classesStore';
import { classesApi } from '../api/classes';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';

export const CourseComparePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedForComparison,
    comparisonAnalysis,
    setComparisonAnalysis,
    removeFromComparison,
    searchResults,
    toggleComparisonClass,
  } = useClassesStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If at least 2 classes are selected and no analysis yet (or selection changed), run comparison
    if (selectedForComparison.length >= 2) {
      handleRunComparison();
    }
  }, [selectedForComparison.map((c) => c.id).join(',')]);

  const handleRunComparison = async () => {
    if (selectedForComparison.length < 2) {
      setError('Please select at least 2 courses to run comparative analysis.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const classIds = selectedForComparison.map((c) => c.id);
      const data = await classesApi.compareClasses(classIds);
      setComparisonAnalysis(data);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Failed to generate comparison. Please ensure backend is running.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/courses')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course Search</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center border border-amber-300">
              <GitCompare className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-stone-900">
                AI Course Comparison & Trade-off Engine
              </h1>
              <p className="text-xs text-stone-500">
                Side-by-side evaluation synthesized via Gemini 2.5 Flash
              </p>
            </div>
          </div>
        </div>

        {selectedForComparison.length >= 2 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunComparison}
            isLoading={isLoading}
            className="font-bold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            <span>Re-evaluate with Gemini</span>
          </Button>
        )}
      </div>

      {error && (
        <Alert
          variant="danger"
          title="Comparison Failed"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* When fewer than 2 courses in comparison tray */}
      {selectedForComparison.length < 2 && (
        <Card variant="default" className="py-12 px-6 text-center bg-white/90">
          <GitCompare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-stone-800 mb-1">
            Select at least 2 courses to compare (currently {selectedForComparison.length})
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
            Pick from your recently searched courses below or return to the courses search page.
          </p>

          {searchResults.length > 0 ? (
            <div className="max-w-xl mx-auto text-left space-y-2.5">
              <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Recently Searched Courses:
              </div>
              {searchResults.slice(0, 4).map((cls) => {
                const isSelected = selectedForComparison.some((c) => c.id === cls.id);
                return (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200"
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-900">{cls.course_name}</div>
                      <div className="text-[11px] text-stone-500">{cls.institute_name} — {cls.city || 'Pune'}</div>
                    </div>
                    <button
                      onClick={() => toggleComparisonClass(cls)}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {isSelected ? 'Selected' : '+ Add to Tray'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <Link to="/courses">
              <Button variant="primary" size="md">
                <span>Browse Courses</span>
              </Button>
            </Link>
          )}
        </Card>
      )}

      {/* Comparison Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      )}

      {/* AI Comparative Insights Cards */}
      {!isLoading && comparisonAnalysis && (
        <div className="space-y-8">
          {/* Top Recommendation Highlight Tile */}
          {comparisonAnalysis.overall_recommendation && (
            <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/40 relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#82E2B0]/20 border border-[#82E2B0]/30 text-xs font-semibold text-[#82E2B0] mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini AI Consensus</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-2">
                  Overall Recommendation
                </h2>
                <p className="text-sm text-stone-200 leading-relaxed max-w-3xl">
                  {comparisonAnalysis.overall_recommendation}
                </p>
                {comparisonAnalysis.reasoning && (
                  <p className="mt-3 text-xs text-stone-400 border-t border-white/10 pt-3 leading-relaxed">
                    <strong>Architectural Rationale:</strong> {comparisonAnalysis.reasoning}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 3 Decision Pillar Clay Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Best Value Winner */}
            <Card variant="clay-amber" className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center border border-amber-300">
                  <DollarSign className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                    Highest ROI
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Best Value Winner
                  </h3>
                </div>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                {comparisonAnalysis.best_value || 'Balanced tuition fee and comprehensive curriculum hours.'}
              </p>
            </Card>

            {/* Best Curriculum Winner */}
            <Card variant="clay-purple" className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-900 flex items-center justify-center border border-purple-300">
                  <BookOpen className="w-5 h-5 text-purple-800" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-purple-800 tracking-wider">
                    Most Comprehensive
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Best Curriculum
                  </h3>
                </div>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                {comparisonAnalysis.best_curriculum || 'Broadest coverage of modern industry frameworks.'}
              </p>
            </Card>

            {/* Best Location Winner */}
            <Card variant="clay-teal" className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-2xl bg-teal-500/20 text-teal-900 flex items-center justify-center border border-teal-300">
                  <MapPin className="w-5 h-5 text-teal-800" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                    Accessibility & Network
                  </div>
                  <h3 className="text-base font-bold text-stone-900">
                    Best Location
                  </h3>
                </div>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                {comparisonAnalysis.best_location || 'Prime technical hub location with strong student network.'}
              </p>
            </Card>
          </div>

          {/* Side-by-Side Comparison Matrix Table */}
          <Card variant="default" className="p-6 bg-white overflow-hidden shadow-clay-card">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-stone-900">
                  Side-by-Side Parameter Matrix
                </h3>
              </div>
              <span className="text-xs text-stone-500">
                Comparing {selectedForComparison.length} Institutes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-3 px-4 font-bold text-stone-500 uppercase tracking-wider w-1/4">
                      Specification
                    </th>
                    {selectedForComparison.map((cls) => (
                      <th key={cls.id} className="py-3 px-4 font-bold text-stone-900 w-1/3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-extrabold text-stone-900">{cls.course_name}</div>
                            <div className="text-xs font-medium text-emerald-700">{cls.institute_name}</div>
                          </div>
                          <button
                            onClick={() => removeFromComparison(cls.id)}
                            className="text-stone-400 hover:text-rose-500 text-sm font-bold p-1"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {/* Fee */}
                  <tr className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-4 font-semibold text-stone-600">Course Fee</td>
                    {selectedForComparison.map((cls) => (
                      <td key={cls.id} className="py-3.5 px-4 font-bold text-stone-900 text-sm">
                        {cls.fees ? `${cls.currency || '₹'}${cls.fees.toLocaleString()}` : 'Contact Institute'}
                      </td>
                    ))}
                  </tr>

                  {/* Mode */}
                  <tr className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-4 font-semibold text-stone-600">Format / Mode</td>
                    {selectedForComparison.map((cls) => (
                      <td key={cls.id} className="py-3.5 px-4 font-medium text-stone-800">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800">
                          {cls.mode || 'Offline / Classroom'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Duration */}
                  <tr className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-4 font-semibold text-stone-600">Duration</td>
                    {selectedForComparison.map((cls) => (
                      <td key={cls.id} className="py-3.5 px-4 font-medium text-stone-800">
                        {cls.duration ? `${cls.duration} ${cls.duration_unit || 'weeks'}` : 'Flexible schedule'}
                      </td>
                    ))}
                  </tr>

                  {/* Location & Address */}
                  <tr className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-4 font-semibold text-stone-600">Location</td>
                    {selectedForComparison.map((cls) => (
                      <td key={cls.id} className="py-3.5 px-4 text-stone-700">
                        {cls.address || cls.city || 'Pune, India'}
                      </td>
                    ))}
                  </tr>

                  {/* Skills Covered */}
                  <tr className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-4 font-semibold text-stone-600">Core Skills</td>
                    {selectedForComparison.map((cls) => (
                      <td key={cls.id} className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {cls.skills && cls.skills.length > 0 ? (
                            cls.skills.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-100"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-stone-400 italic">Syllabus-based</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic comparison table rows from AI if provided */}
                  {comparisonAnalysis.comparison_table?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/70">
                      <td className="py-3.5 px-4 font-semibold text-stone-600">{row.attribute}</td>
                      {row.values.map((val, vIdx) => (
                        <td key={vIdx} className="py-3.5 px-4 text-stone-800 font-medium">
                          {String(val ?? 'N/A')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

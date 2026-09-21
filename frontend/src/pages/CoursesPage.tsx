import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  BookOpen,
  Filter,
  Layers,
  Check,
  Plus,
  GitCompare,
  ArrowRight,
  ExternalLink,
  Building2,
  Map,
  Grid,
  Sparkles,
} from 'lucide-react';
import { classesApi } from '../api/classes';
import { useClassesStore } from '../store/classesStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';
import { CourseMap } from '../components/courses/CourseMap';

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    searchResults,
    lastCourseQuery,
    lastLocationQuery,
    selectedForComparison,
    setSearchResults,
    toggleComparisonClass,
    removeFromComparison,
    clearComparison,
  } = useClassesStore();

  const [courseInput, setCourseInput] = useState(lastCourseQuery || '');
  const [locationInput, setLocationInput] = useState(lastLocationQuery || '');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'OFFLINE' | 'ONLINE' | 'HYBRID'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'both' | 'grid' | 'map'>('both');
  const [selectedClassForHighlight, setSelectedClassForHighlight] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(searchResults.length > 0 || Boolean(lastCourseQuery));

  const executeSearch = async (cInput: string, lInput: string) => {
    if (!cInput.trim() || !lInput.trim()) {
      setError('Please provide both course topic and location.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await classesApi.searchClasses(cInput, lInput);
      setSearchResults(response.data, cInput, lInput);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Failed to search classes. Ensure Flask backend is running on port 5000.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executeSearch(courseInput, locationInput);
  };

  const handleQuickSearch = (topic: string, city: string) => {
    setCourseInput(topic);
    setLocationInput(city);
    executeSearch(topic, city);
  };

  // Filter results by mode if selected
  const filteredClasses = searchResults.filter((cls) => {
    if (modeFilter === 'ALL') return true;
    const mode = (cls.mode || '').toUpperCase();
    if (modeFilter === 'OFFLINE') return mode.includes('OFFLINE') || mode.includes('CLASSROOM');
    if (modeFilter === 'ONLINE') return mode.includes('ONLINE');
    if (modeFilter === 'HYBRID') return mode.includes('HYBRID');
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Search Header Hero Bar */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-stone-700/50">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#82E2B0] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Course & Institute Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mb-2">
            Explore Engineering Classes & Bootcamps
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Search verified offline training centers, university programs, and bootcamps with real-time syllabus and fee intelligence.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <div className="sm:col-span-6">
              <Input
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
                placeholder="Topic or Skill (e.g. Python, Full Stack, AI)"
                icon={BookOpen}
                className="bg-white text-stone-900 border-none shadow-xs"
              />
            </div>
            <div className="sm:col-span-4">
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="City or Area (e.g. Pune, Bangalore)"
                icon={MapPin}
                className="bg-white text-stone-900 border-none shadow-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="h-full min-h-[44px] font-bold"
              >
                <Search className="w-4 h-4 mr-1.5" />
                <span>Search</span>
              </Button>
            </div>
          </div>
        </form>

        {/* Mode Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 relative z-10">
          <span className="text-xs text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Mode:
          </span>
          {(['ALL', 'OFFLINE', 'ONLINE', 'HYBRID'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setModeFilter(mode)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                modeFilter === mode
                  ? 'bg-[#82E2B0] text-stone-900 shadow-sm'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              {mode === 'ALL' ? 'All Formats' : mode.charAt(0) + mode.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert
          variant="danger"
          title="Search Failed"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Results Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-stone-900 font-display">
            {isLoading
              ? 'Searching Courses...'
              : hasSearched
              ? `${filteredClasses.length} Courses Found`
              : 'Discover Courses & Institutes'}
          </h2>
          {hasSearched && lastCourseQuery && (
            <span className="text-xs text-stone-500">
              for "{lastCourseQuery}" in "{lastLocationQuery}"
            </span>
          )}
        </div>

        {/* View Switcher on Desktop */}
        <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'both' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>List Only</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'map' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map Only</span>
          </button>
        </div>
      </div>

      {/* Main Content: Split, Grid, or Map */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-clay-card border border-stone-200/80 space-y-4">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        !hasSearched ? (
          <Card variant="default" className="py-16 text-center bg-white/90 border border-stone-200/80 rounded-3xl shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#82E2B0]/20 flex items-center justify-center text-stone-800">
              <BookOpen className="w-7 h-7 text-[#285A43]" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2 font-display">
              Ready to Discover Top Courses & Bootcamps?
            </h3>
            <p className="text-sm text-stone-500 max-w-lg mx-auto mb-6">
              Enter any engineering topic, programming language, or institute name along with your target city to search live verified listings.
            </p>

            <div className="max-w-xl mx-auto">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-3">
                Or try a popular search
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { topic: 'Data Science', city: 'Pune' },
                  { topic: 'Full Stack Web Development', city: 'Pune' },
                  { topic: 'AI & Machine Learning', city: 'Bangalore' },
                  { topic: 'Python Programming', city: 'Mumbai' },
                  { topic: 'Cloud & DevOps', city: 'Hyderabad' },
                ].map((item) => (
                  <button
                    key={`${item.topic}-${item.city}`}
                    type="button"
                    onClick={() => handleQuickSearch(item.topic, item.city)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200/60"
                  >
                    {item.topic} in {item.city}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="default" className="py-16 text-center bg-white/80">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800 mb-1">
              No courses found for this query
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
              Try searching for broader engineering terms like "Data Science", "Python", "Web Development", or adjust the location.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setCourseInput('Data Science');
                setLocationInput('Pune');
              }}
            >
              Reset to Sample Search (Data Science in Pune)
            </Button>
          </Card>
        )
      ) : (
        <div className={`grid gap-6 ${activeTab === 'both' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
          {/* Courses List Grid */}
          {(activeTab === 'both' || activeTab === 'grid') && (
            <div className={`space-y-4 ${activeTab === 'both' ? 'lg:col-span-7' : 'w-full'}`}>
              <div className={`grid gap-4 ${activeTab === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {filteredClasses.map((cls) => {
                  const isSelected = selectedForComparison.some((c) => c.id === cls.id);
                  const isHovered = selectedClassForHighlight === cls.id;

                  return (
                    <Card
                      key={cls.id}
                      variant="default"
                      className={`flex flex-col justify-between p-5 transition-all bg-white hover:border-emerald-300 ${
                        isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
                      } ${isHovered ? 'shadow-clay-float border-emerald-400' : ''}`}
                      onMouseEnter={() => setSelectedClassForHighlight(cls.id)}
                      onMouseLeave={() => setSelectedClassForHighlight(null)}
                    >
                      <div>
                        {/* Provider & Format Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="truncate max-w-[170px]">{cls.institute_name}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            (cls.mode || '').toUpperCase().includes('ONLINE')
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {cls.mode || 'Classroom'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-2 line-clamp-2 leading-snug">
                          {cls.course_name}
                        </h3>

                        {/* Address */}
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span className="truncate">{cls.address || cls.city || 'Pune, MH'}</span>
                        </div>

                        {/* Fee & Duration Highlights */}
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100 mb-3 text-xs">
                          <div>
                            <span className="text-[10px] text-stone-400 uppercase font-semibold block">Fee</span>
                            <span className="font-extrabold text-stone-900">
                              {cls.fees ? `${cls.currency || '₹'}${cls.fees.toLocaleString()}` : 'Contact Institute'}
                            </span>
                          </div>
                          <div className="w-px h-6 bg-stone-200" />
                          <div>
                            <span className="text-[10px] text-stone-400 uppercase font-semibold block">Duration</span>
                            <span className="font-semibold text-stone-700">
                              {cls.duration ? `${cls.duration} ${cls.duration_unit || 'weeks'}` : 'Flexible'}
                            </span>
                          </div>
                        </div>

                        {/* Skills Chips */}
                        {cls.skills && cls.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {cls.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700"
                              >
                                {skill}
                              </span>
                            ))}
                            {cls.skills.length > 3 && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500">
                                +{cls.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleComparisonClass(cls)}
                          disabled={!isSelected && selectedForComparison.length >= 3}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : selectedForComparison.length >= 3
                              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                              : 'bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Compare</span>
                            </>
                          )}
                        </button>

                        {cls.google_maps_url ? (
                          <a
                            href={cls.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 font-medium"
                          >
                            <span>Map</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : cls.website_url ? (
                          <a
                            href={cls.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 font-medium"
                          >
                            <span>Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : null}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Map Sidepanel */}
          {(activeTab === 'both' || activeTab === 'map') && (
            <div className={`sticky top-20 h-fit ${activeTab === 'both' ? 'lg:col-span-5' : 'w-full'}`}>
              <CourseMap
                classes={filteredClasses}
                selectedClassId={selectedClassForHighlight}
                onSelectClass={(cls) => setSelectedClassForHighlight(cls.id)}
              />
            </div>
          )}
        </div>
      )}

      {/* Sticky Bottom Comparison Tray */}
      {selectedForComparison.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 animate-in slide-in-from-bottom duration-300">
          <div className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl border border-stone-700/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#82E2B0] pl-1">
                <GitCompare className="w-4 h-4" />
                <span>Tray ({selectedForComparison.length}/3):</span>
              </div>

              <div className="flex items-center gap-2">
                {selectedForComparison.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-xl text-xs text-stone-200 border border-white/10 whitespace-nowrap"
                  >
                    <span className="truncate max-w-[120px] font-medium">{cls.course_name}</span>
                    <button
                      onClick={() => removeFromComparison(cls.id)}
                      className="text-stone-400 hover:text-rose-400 ml-1 font-bold text-sm"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={clearComparison}
                className="text-xs text-stone-400 hover:text-white px-2 py-1"
              >
                Clear
              </button>
              <Button
                variant="primary"
                size="sm"
                disabled={selectedForComparison.length < 2}
                onClick={() => navigate('/courses/compare')}
                className="font-bold text-xs"
              >
                <span>Compare AI</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

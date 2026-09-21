import { create } from 'zustand';
import { ClassResult, ComparisonAnalysis } from '../types/classes';

interface ClassesState {
  searchResults: ClassResult[];
  lastCourseQuery: string;
  lastLocationQuery: string;
  selectedForComparison: ClassResult[];
  comparisonAnalysis: ComparisonAnalysis | null;

  setSearchResults: (results: ClassResult[], course: string, location: string) => void;
  toggleComparisonClass: (classItem: ClassResult) => boolean; // returns true if added, false if removed
  removeFromComparison: (classId: string) => void;
  clearComparison: () => void;
  setComparisonAnalysis: (analysis: ComparisonAnalysis | null) => void;
}

export const useClassesStore = create<ClassesState>((set, get) => ({
  searchResults: [],
  lastCourseQuery: '',
  lastLocationQuery: '',
  selectedForComparison: [],
  comparisonAnalysis: null,

  setSearchResults(results, course, location) {
    set({
      searchResults: results,
      lastCourseQuery: course,
      lastLocationQuery: location,
    });
  },

  toggleComparisonClass(classItem) {
    const { selectedForComparison } = get();
    const exists = selectedForComparison.some((c) => c.id === classItem.id);
    if (exists) {
      set({
        selectedForComparison: selectedForComparison.filter((c) => c.id !== classItem.id),
      });
      return false;
    }
    if (selectedForComparison.length >= 3) {
      return false; // Max 3 reached
    }
    set({
      selectedForComparison: [...selectedForComparison, classItem],
    });
    return true;
  },

  removeFromComparison(classId) {
    set((state) => ({
      selectedForComparison: state.selectedForComparison.filter((c) => c.id !== classId),
    }));
  },

  clearComparison() {
    set({ selectedForComparison: [], comparisonAnalysis: null });
  },

  setComparisonAnalysis(analysis) {
    set({ comparisonAnalysis: analysis });
  },
}));

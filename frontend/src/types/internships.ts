export interface InternshipRecommendation {
  role: string;
  company?: string | null;
  skills_needed: string[];
  what_you_can_achieve: string[];
  why_recommended?: string | null;
  match_score?: number | null;
  location?: string | null;
  mode?: string | null;
  eligibility?: string | null;
  duration?: string | null;
  stipend?: string | null;
  source_url?: string | null;
  application_url?: string | null;
}

export interface LiveInternshipResult {
  company: string;
  role: string;
  location?: string | null;
  mode?: string | null;
  skills: string[];
  eligibility?: string | null;
  duration?: string | null;
  stipend?: string | null;
  deadline?: string | null;
  description?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  application_url?: string | null;
  last_checked_at?: string | null;
}

export interface InternshipRecommendMeta {
  branch: string;
  year: string;
  skill_based_count: number;
  resume_based_count: number;
  live_count: number;
}

export interface InternshipRecommendData {
  skill_based_recommendations: InternshipRecommendation[];
  resume_based_recommendations: InternshipRecommendation[];
  live_internships: LiveInternshipResult[];
}

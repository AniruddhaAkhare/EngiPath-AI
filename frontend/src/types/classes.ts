export interface ClassResult {
  id: string;
  institute_name: string;
  course_name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  fees?: number | null;
  currency?: string | null;
  duration?: number | null;
  duration_unit?: string | null;
  mode?: string | null;
  description?: string | null;
  topics: string[];
  skills: string[];
  website_url?: string | null;
  contact?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  last_checked_at?: string | null;
  confidence?: number | null;
  google_maps_url?: string | null;
}

export interface ClassSearchMeta {
  course: string;
  location: string;
  total_results: number;
  search_duration_ms?: number | null;
}

export interface ClassSearchResponseData {
  data: ClassResult[];
  meta: ClassSearchMeta;
}

export interface ComparisonRow {
  attribute: string;
  values: (string | number | boolean | null)[];
}

export interface ComparisonAnalysis {
  comparison_table?: ComparisonRow[];
  best_value?: string;
  best_curriculum?: string;
  best_location?: string;
  overall_recommendation?: string;
  reasoning?: string;
  classes?: ClassResult[];
  [key: string]: unknown;
}

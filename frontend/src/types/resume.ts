export interface ProjectItem {
  title?: string;
  description?: string;
  technologies?: string[];
  [key: string]: unknown;
}

export interface ExperienceItem {
  role?: string;
  company?: string;
  duration?: string;
  description?: string;
  [key: string]: unknown;
}

export interface EducationItem {
  degree?: string;
  institution?: string;
  year?: string;
  grade?: string;
  [key: string]: unknown;
}

export interface CandidateProfile {
  branch?: string | null;
  year?: string | null;
  skills: string[];
  resume_skills: string[];
  technologies: string[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  domains: string[];
  interests: string[];
  education: EducationItem[];
}

export interface ResumeAnalysisData {
  analysis_id: string;
  profile: CandidateProfile;
  extracted_text_length: number;
}

export interface ResumeUploadData {
  file_id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  message: string;
  save_path?: string;
}

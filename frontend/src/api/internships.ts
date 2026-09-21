import { apiClient, formatApiError } from './client';
import { InternshipRecommendData, LiveInternshipResult } from '../types/internships';

export interface RecommendParams {
  branch: string;
  year: string;
  skills: string[];
  interests?: string[];
  resume_analysis_id?: string;
}

export interface LiveSearchParams {
  branch: string;
  skills?: string[];
  interests?: string[];
  location?: string;
}

export const internshipsApi = {
  async getRecommendations(params: RecommendParams): Promise<InternshipRecommendData> {
    try {
      const response = await apiClient.post('/api/v1/internships/recommend', {
        branch: params.branch.trim(),
        year: params.year.trim(),
        skills: params.skills,
        interests: params.interests || [],
        resume_analysis_id: params.resume_analysis_id || null,
      });
      return {
        skill_based_recommendations: response.data.data?.skill_based_recommendations || [],
        resume_based_recommendations: response.data.data?.resume_based_recommendations || [],
        live_internships: response.data.data?.live_internships || [],
      };
    } catch (err) {
      throw formatApiError(err);
    }
  },

  async searchLiveInternships(params: LiveSearchParams): Promise<LiveInternshipResult[]> {
    try {
      const response = await apiClient.post('/api/v1/internships/search', {
        branch: params.branch.trim(),
        skills: params.skills || [],
        interests: params.interests || [],
        location: params.location || null,
      });
      return response.data.data || [];
    } catch (err) {
      throw formatApiError(err);
    }
  },

  async getInternshipById(internshipId: string): Promise<LiveInternshipResult> {
    try {
      const response = await apiClient.get(`/api/v1/internships/${encodeURIComponent(internshipId)}`);
      return response.data.data;
    } catch (err) {
      throw formatApiError(err);
    }
  },
};

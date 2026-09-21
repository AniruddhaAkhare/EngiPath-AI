import { apiClient, formatApiError } from './client';
import { ResumeUploadData, ResumeAnalysisData } from '../types/resume';

export const resumeApi = {
  async uploadResume(file: File): Promise<ResumeUploadData> {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await apiClient.post('/api/v1/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (err) {
      throw formatApiError(err);
    }
  },

  async analyzeResume(
    file: File,
    branch: string,
    year: string,
    skills: string[] = [],
    interests: string[] = []
  ): Promise<ResumeAnalysisData> {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('branch', branch);
      formData.append('year', year);
      if (skills.length > 0) {
        formData.append('skills', skills.join(','));
      }
      if (interests.length > 0) {
        formData.append('interests', interests.join(','));
      }

      const response = await apiClient.post('/api/v1/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (err) {
      throw formatApiError(err);
    }
  },
};

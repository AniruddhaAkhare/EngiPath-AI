import { apiClient, formatApiError } from './client';
import { ClassResult, ClassSearchResponseData, ComparisonAnalysis } from '../types/classes';

export const classesApi = {
  async searchClasses(course: string, location: string): Promise<ClassSearchResponseData> {
    try {
      const response = await apiClient.post('/api/v1/classes/search', {
        course: course.trim(),
        location: location.trim(),
      });
      return {
        data: response.data.data || [],
        meta: response.data.meta,
      };
    } catch (err) {
      throw formatApiError(err);
    }
  },

  async getClassById(classId: string): Promise<ClassResult> {
    try {
      const response = await apiClient.get(`/api/v1/classes/${encodeURIComponent(classId)}`);
      return response.data.data;
    } catch (err) {
      throw formatApiError(err);
    }
  },

  async compareClasses(classIds: string[]): Promise<ComparisonAnalysis> {
    try {
      const response = await apiClient.post('/api/v1/classes/compare', {
        class_ids: classIds,
      });
      return response.data.data;
    } catch (err) {
      throw formatApiError(err);
    }
  },
};

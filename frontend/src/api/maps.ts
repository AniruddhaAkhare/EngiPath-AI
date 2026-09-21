import { apiClient, formatApiError } from './client';
import { GeocodeData, DirectionsData } from '../types/maps';

export const mapsApi = {
  async geocode(address: string): Promise<GeocodeData> {
    try {
      const response = await apiClient.post('/api/v1/maps/geocode', {
        address: address.trim(),
      });
      return response.data.data;
    } catch (err) {
      throw formatApiError(err);
    }
  },

  async getDirections(
    originLat: number,
    originLon: number,
    destLat: number,
    destLon: number,
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<DirectionsData> {
    try {
      const response = await apiClient.post('/api/v1/maps/directions', {
        origin_lat: originLat,
        origin_lon: originLon,
        dest_lat: destLat,
        dest_lon: destLon,
        profile,
      });
      return response.data.data;
    } catch (err) {
      throw formatApiError(err);
    }
  },
};

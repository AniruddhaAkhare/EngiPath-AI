export interface GeocodeData {
  latitude: number;
  longitude: number;
  display_name: string;
  google_maps_url: string;
  address_components?: Record<string, string>;
}

export interface RouteGeometry {
  type: string;
  coordinates: [number, number][];
}

export interface DirectionsData {
  distance_meters: number;
  duration_seconds: number;
  geometry: RouteGeometry;
  summary?: string;
}

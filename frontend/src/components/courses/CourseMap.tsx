import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ClassResult } from '../../types/classes';

interface CourseMapProps {
  classes: ClassResult[];
  selectedClassId?: string | null;
  onSelectClass?: (classItem: ClassResult) => void;
}

// Custom icon using Leaflet DivIcon for modern styled pins
const createCustomMarker = (isSelected: boolean, index: number) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${isSelected ? '#10b981' : '#1e293b'};
        color: white;
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 11px;
          font-weight: 700;
          font-family: sans-serif;
        ">${index + 1}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const CourseMap: React.FC<CourseMapProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Filter classes that have valid coordinates
  const classesWithCoords = classes.filter(
    (c) =>
      typeof c.latitude === 'number' &&
      typeof c.longitude === 'number' &&
      !isNaN(c.latitude) &&
      !isNaN(c.longitude)
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center: Pune / Western India (18.5204, 73.8567)
    const initialLat = classesWithCoords[0]?.latitude || 18.5204;
    const initialLng = classesWithCoords[0]?.longitude || 73.8567;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // CartoDB Positron / OSM tiles for a clean, modern aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (classesWithCoords.length === 0) return;

    const bounds = L.latLngBounds([]);

    classesWithCoords.forEach((cls, idx) => {
      const isSelected = cls.id === selectedClassId;
      const marker = L.marker([cls.latitude!, cls.longitude!], {
        icon: createCustomMarker(isSelected, idx),
      }).addTo(map);

      // Popup content
      const feeText = cls.fees
        ? `${cls.currency || '₹'}${cls.fees.toLocaleString()}`
        : 'Inquire for fees';
      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
          <div style="font-size: 10px; font-weight: 700; color: #10b981; text-transform: uppercase;">
            ${cls.institute_name}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin: 2px 0 4px;">
            ${cls.course_name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            ${cls.address || cls.city || 'Local Institute'}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 11px; font-weight: 600;">
            <span style="color: #047857;">${feeText}</span>
            <span style="color: #64748b;">${cls.mode || 'Offline'}</span>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectClass) onSelectClass(cls);
      });

      markersRef.current.set(cls.id, marker);
      bounds.extend([cls.latitude!, cls.longitude!]);
    });

    if (classesWithCoords.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      // Map instance preserved across renders, markers updated
    };
  }, [classesWithCoords.length, selectedClassId]);

  // Clean up map completely when component unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[420px] rounded-3xl overflow-hidden border border-stone-200/90 shadow-clay-card bg-stone-100">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {classesWithCoords.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-50/80 backdrop-blur-xs text-stone-500 text-xs font-medium">
          No geospatial coordinates available for current query results.
        </div>
      )}

      <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-stone-700 border border-stone-200 shadow-xs flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>{classesWithCoords.length} Geolocated Centers</span>
      </div>
    </div>
  );
};

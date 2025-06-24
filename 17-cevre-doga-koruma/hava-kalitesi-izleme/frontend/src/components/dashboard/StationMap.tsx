import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapData } from '../../types';
import { getAQIColor, getAQICategory } from '../../utils/aqi';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface StationMapProps {
  stations: MapData[];
  selectedStationId?: string;
  onStationSelect?: (stationId: string) => void;
  height?: string | number;
}

const StationMap: React.FC<StationMapProps> = ({
  stations,
  selectedStationId,
  onStationSelect,
  height = 500,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map centered on Turkey
      mapRef.current = L.map('station-map').setView([39.0, 35.0], 6);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add station markers
    stations.forEach((station) => {
      if (!mapRef.current || !station.coordinates) return;

      const aqi = station.latestMeasurement?.aqi || 0;
      const color = getAQIColor(aqi);
      const category = getAQICategory(aqi);

      const marker = L.circleMarker([station.coordinates.lat, station.coordinates.lng], {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      marker.bindPopup(`
        <div>
          <strong>${station.name}</strong><br/>
          AQI: ${aqi}<br/>
          Durum: ${category}<br/>
          ${station.latestMeasurement ? 
            `Son güncelleme: ${new Date(station.latestMeasurement.createdAt).toLocaleString('tr-TR')}` : 
            'Veri yok'}
        </div>
      `);

      if (onStationSelect) {
        marker.on('click', () => onStationSelect(station.id));
      }

      marker.addTo(mapRef.current);
      markersRef.current[station.id] = marker;
    });

    // Highlight selected station
    if (selectedStationId && markersRef.current[selectedStationId]) {
      markersRef.current[selectedStationId].setStyle({
        weight: 4,
        radius: 15,
      });
    }
  }, [stations, selectedStationId, onStationSelect]);

  return <Box id="station-map" sx={{ height, width: '100%' }} />;
};

export default StationMap;
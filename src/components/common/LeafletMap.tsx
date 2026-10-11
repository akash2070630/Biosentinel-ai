import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { WildlifeObservation, ThreatRecord } from '../../types';

interface LeafletMapProps {
  observations: WildlifeObservation[];
  threats?: ThreatRecord[];
  selectedObservation?: WildlifeObservation | null;
  onSelectObservation?: (obs: WildlifeObservation) => void;
  unmasked: boolean;
  className?: string;
}

export function LeafletMap({
  observations,
  threats = [],
  selectedObservation,
  onSelectObservation,
  unmasked,
  className = 'h-[500px]'
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around Central India / South Asia conservation corridor
      const map = L.map(mapContainerRef.current, {
        center: [23.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
      });

      // CartoDB Voyager / OSM Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    // Add observation markers
    observations.forEach((obs) => {
      // Apply coordinate privacy fuzzing if unmasked is false
      const lat = unmasked ? obs.latitude : obs.latitude + (Math.sin(obs.latitude * 10) * 0.05);
      const lng = unmasked ? obs.longitude : obs.longitude + (Math.cos(obs.longitude * 10) * 0.05);
      bounds.push([lat, lng]);

      const isSelected = selectedObservation?.id === obs.id;
      const isAnomaly = obs.anomalyDetected;
      const markerColor = isAnomaly ? '#EF4444' : isSelected ? '#10B981' : '#059669';

      const customIcon = L.divIcon({
        className: 'custom-wildlife-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: ${isSelected ? '24px' : '18px'};
            height: ${isSelected ? '24px' : '18px'};
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 0 10px ${markerColor};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="background-color: #FFFFFF; width: 6px; height: 6px; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [isSelected ? 24 : 18, isSelected ? 24 : 18],
        iconAnchor: [isSelected ? 12 : 9, isSelected ? 12 : 9],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 180px; max-width: 240px;">
          <img src="${obs.imageUrl}" alt="${obs.speciesName}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 6px;" />
          <div style="font-weight: bold; font-size: 13px; color: #FFFFFF;">${obs.speciesName}</div>
          <div style="font-style: italic; font-size: 11px; color: #A8B9A0; margin-bottom: 4px;">${obs.scientificName}</div>
          <div style="font-size: 11px; color: #CBD5E1; margin-bottom: 4px;">
            <strong>Location:</strong> ${obs.locationName}<br/>
            <strong>Coordinates:</strong> ${unmasked ? `${obs.latitude.toFixed(4)}, ${obs.longitude.toFixed(4)}` : 'Protected (Fuzzed)'}<br/>
            <strong>Confidence:</strong> ${(obs.confidence * 100).toFixed(1)}%
          </div>
          ${obs.individualName ? `<div style="font-size: 11px; color: #F59E0B; font-weight: bold;">ID: ${obs.individualName}</div>` : ''}
          ${isAnomaly ? `<div style="font-size: 10px; color: #EF4444; font-weight: bold; margin-top: 4px;">⚠️ Silent Distress Anomaly Flagged</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectObservation) onSelectObservation(obs);
      });

      markersLayer.addLayer(marker);
    });

    // Add threat markers
    threats.forEach((threat) => {
      const lat = unmasked ? threat.latitude : threat.latitude + 0.03;
      const lng = unmasked ? threat.longitude : threat.longitude - 0.03;
      bounds.push([lat, lng]);

      const threatColor = threat.severity === 'Critical' ? '#DC2626' : threat.severity === 'High' ? '#EA580C' : '#D97706';
      const customThreatIcon = L.divIcon({
        className: 'custom-threat-marker',
        html: `
          <div style="
            background-color: ${threatColor};
            width: 22px;
            height: 22px;
            border-radius: 4px;
            border: 2px solid #FFFFFF;
            transform: rotate(45deg);
            box-shadow: 0 0 12px ${threatColor};
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(-45deg); color: #FFF; font-size: 10px; font-weight: bold;">!</span>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const threatMarker = L.marker([lat, lng], { icon: customThreatIcon });
      const threatPopup = `
        <div style="font-family: sans-serif; min-width: 180px;">
          <div style="font-weight: bold; font-size: 12px; color: ${threatColor};">⚠️ ${threat.category}</div>
          <div style="font-size: 12px; color: #FFF; font-weight: 600; margin: 2px 0;">${threat.title}</div>
          <div style="font-size: 11px; color: #94A3B8;">${threat.locationName}</div>
          <div style="font-size: 10px; margin-top: 4px; color: #FBBF24;">Status: ${threat.status}</div>
        </div>
      `;
      threatMarker.bindPopup(threatPopup);
      markersLayer.addLayer(threatMarker);
    });

    // Fit bounds if markers exist
    if (bounds.length > 0) {
      map.fitBounds(bounds as any, { padding: [50, 50], maxZoom: 8 });
    }
  }, [observations, threats, selectedObservation, unmasked]);

  return (
    <div className={`relative w-full rounded-lg overflow-hidden border border-[#1E4E42] shadow-xl ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      {/* Floating map legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#102C27]/90 backdrop-blur-md border border-[#2D6A4F] px-3 py-2 rounded text-xs text-[#F7F6F0] shadow-lg flex flex-col gap-1.5 pointer-events-auto">
        <div className="font-semibold text-[#8AE3A6] border-b border-[#1E4E42] pb-1">Geospatial Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
          <span className="text-[#A8B9A0]">Verified Wildlife Sighting</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-white" />
          <span className="text-[#A8B9A0]">Behavioral Anomaly (Silent Distress)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rotate-45 bg-amber-500 border border-white" />
          <span className="text-[#A8B9A0]">Active Threat Warning</span>
        </div>
        {!unmasked && (
          <div className="text-[10px] text-amber-300/90 pt-1 border-t border-[#1E4E42]">
            🔒 Anti-Poaching Coordinate Masking Active
          </div>
        )}
      </div>
    </div>
  );
}

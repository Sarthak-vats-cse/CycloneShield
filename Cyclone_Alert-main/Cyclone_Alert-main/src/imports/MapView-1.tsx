'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import WindLayer from './WindLayer';

export default function MapView() {
  const [mapMode, setMapMode] = useState<'standard' | 'satellite' | 'wind'>('wind');
  
  const [riskData, setRiskData] = useState<any>(null);
  const [infraData, setInfraData] = useState<any>(null);
  const [windData, setWindData] = useState<any>(null);

  useEffect(() => {
    // Fetch Standard Project Layers
    fetch('/data/risk_map.geojson')
      .then(res => res.json())
      .then(setRiskData)
      .catch(err => console.error("Error fetching risk_map.geojson", err));

    fetch('/data/infrastructure.geojson')
      .then(res => res.json())
      .then(setInfraData)
      .catch(err => console.error("Error fetching infrastructure.geojson", err));
    
    // Fetch Wind Vector Data
    fetch('/data/wind_data.json')
      .then(res => res.json())
      .then(setWindData)
      .catch(err => console.error("Error fetching wind_data.json", err));
  }, []);

  return (
    <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
      
      {/* Floating UI Toggle Buttons */}
      <div className="absolute top-4 right-4 z-[1000] flex bg-slate-900/80 backdrop-blur-md rounded-lg p-1 border border-slate-700/50 shadow-lg">
        <button 
          onClick={() => setMapMode('standard')}
          className={`px-4 py-2 text-sm rounded-md transition-all ${
            mapMode === 'standard' 
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50 font-semibold' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Base Map
        </button>
        <button 
          onClick={() => setMapMode('satellite')}
          className={`px-4 py-2 text-sm rounded-md transition-all ${
            mapMode === 'satellite' 
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50 font-semibold' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Satellite
        </button>
        <button 
          onClick={() => setMapMode('wind')}
          className={`px-4 py-2 text-sm rounded-md transition-all ${
            mapMode === 'wind' 
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50 font-semibold' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Wind Velocity
        </button>
      </div>

      <MapContainer center={[19.405, 85.005]} zoom={6} className="w-full h-full z-0">
        
        {/* Base Tiles based on Active Toggle */}
        {mapMode === 'standard' && (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        )}
        
        {mapMode === 'satellite' && (
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        )}

        {mapMode === 'wind' && (
          <>
            {/* Free OpenStreetMap Dark Tiles (No API key needed) */}
            <TileLayer 
              url="https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
            />
            {windData && <WindLayer windData={windData} />}
          </>
        )}

        {/* Risk Map Layer (Shown on Standard & Satellite modes) */}
        {riskData && mapMode !== 'wind' && (
          <GeoJSON 
            data={riskData} 
            style={(feature) => {
              const level = feature?.properties?.risk_level;
              let color = '#22c55e';
              if (level === 'CRITICAL') color = '#ef4444';
              else if (level === 'HIGH') color = '#f97316';
              else if (level === 'MEDIUM') color = '#eab308';
              return { fillColor: color, weight: 1, opacity: 0.6, color: '#ffffff', fillOpacity: 0.5 };
            }} 
          />
        )}

        {/* Infrastructure Points (Shown on Standard & Satellite modes) */}
        {infraData && mapMode !== 'wind' && (
          <GeoJSON 
            data={infraData} 
            pointToLayer={(feature, latlng) => {
              const isHospital = feature.properties?.type === 'Hospital';
              return L.circleMarker(latlng, {
                radius: 6,
                fillColor: isHospital ? '#38bdf8' : '#a855f7',
                color: '#ffffff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.9
              });
            }} 
          />
        )}
      </MapContainer>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface CycloneMapProps {
  center: { lat: number; lng: number };
  path: Array<{ lat: number; lng: number }>;
}

export const CycloneMap: React.FC<CycloneMapProps> = ({ center, path }) => {
  const [geeTileUrl, setGeeTileUrl] = useState<string | null>(null);
  const polylineCoordinates = path.map((point) => [point.lat, point.lng] as [number, number]);

  useEffect(() => {
    fetch('/api/earth-engine')
      .then((res) => res.json())
      .then((data) => {
        if (data.urlFormat) {
          setGeeTileUrl(data.urlFormat);
        }
      })
      .catch((err) => console.error('Error fetching GEE tiles:', err));
  }, []);

  return (
    <div style={{ height: '500px', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={7}
        minZoom={5}
        maxZoom={14} // Prevents deep zooming past Sentinel-2's 10m native resolution limit
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <MapResizer />

        {/* Base OpenStreetMap Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Sentinel-2 Satellite Layer with Bilinear Anti-Aliasing */}
        {geeTileUrl && (
          <TileLayer
            url={geeTileUrl}
            opacity={0.75}
            tileSize={256}
            maxNativeZoom={13} // Holds tile stretch quality up to zoom level 13
            className="satellite-layer"
          />
        )}

        <Marker position={[center.lat, center.lng]} icon={defaultIcon}>
          <Popup>
            <strong>Cyclone Eye Center</strong>
            <br />
            Lat: {center.lat}, Lng: {center.lng}
          </Popup>
        </Marker>

        <Polyline positions={polylineCoordinates} pathOptions={{ color: '#00f2ff', weight: 4 }} />
      </MapContainer>
    </div>
  );
};

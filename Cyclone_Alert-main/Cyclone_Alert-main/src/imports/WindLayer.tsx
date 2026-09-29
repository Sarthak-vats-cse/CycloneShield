'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-velocity';
import 'leaflet-velocity/dist/leaflet-velocity.css';

export default function WindLayer({ windData }: { windData: any }) {
  const map = useMap();

  useEffect(() => {
    // 1. Ensure map instance and wind data exist
    if (!windData || !map) return;

    let velocityLayer: any = null;

    // 2. Wait until Leaflet finishes initializing container dimensions
    const timer = setTimeout(() => {
      try {
        // Invalidate size to guarantee layer points can be calculated
        map.invalidateSize();

        velocityLayer = (L as any).velocityLayer({
          displayValues: false,
          data: windData,
          maxVelocity: 40,
          velocityScale: 0.01,
          colorScale: ['#22c55e', '#a3e635', '#eab308', '#f97316', '#ef4444', '#b91c1c'],
          particleAge: 90,
          particleMultiplier: 1 / 500,
          lineWidth: 2,
        });

        velocityLayer.addTo(map);
      } catch (err) {
        console.error('Error initializing wind velocity layer:', err);
      }
    }, 100); // Small 100ms delay gives Next.js DOM time to attach container

    return () => {
      clearTimeout(timer);
      if (velocityLayer && map) {
        try {
          map.removeLayer(velocityLayer);
        } catch (e) {
          // Ignore cleanup errors during unmount
        }
      }
    };
  }, [map, windData]);

  return null;
}

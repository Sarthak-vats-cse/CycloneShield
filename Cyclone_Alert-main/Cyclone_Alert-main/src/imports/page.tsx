'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import mockData from '@/data/mock-cyclone.json';

// Dynamically import CycloneMap with SSR disabled for Leaflet compatibility
const CycloneMap = dynamic(
  () => import('@/components/map/CycloneMap').then((mod) => mod.CycloneMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] flex items-center justify-center bg-[hsl(var(--bg-card))] rounded-lg">
        Loading Interactive Map...
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Live Tracking Map</h1>
      <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden">
        <CycloneMap center={mockData.location} path={mockData.projected_path} />
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronRight, Layers, Eye, ShieldAlert, Radio } from 'lucide-react';
import mockData from '@/data/mock-cyclone.json';
import { RiskBadge } from '@/components/RiskBadge';

const CycloneMap = dynamic(
  () => import('@/components/map/CycloneMap').then((m) => m.CycloneMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#07111F] text-zinc-500 font-mono text-xs">
        Loading Earth Engine Satellite Layer...
      </div>
    ),
  }
);

export default function MapPage() {
  const [layers, setLayers] = useState({
    track: true,
    power: true,
    medical: true,
    surge: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#07111F]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#1E293B] shrink-0 bg-[#07111F]/70 backdrop-blur-md">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={12} />
          <span className="text-white font-medium">Map View</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-sky-400">GEE Sentinel-2 Active</span>
          <RiskBadge level="CRITICAL" />
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Map Layer Controls */}
        <div className="w-72 border-r border-[#1E293B] bg-[#0D1D31] p-4 space-y-6 flex flex-col">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              <Layers size={14} className="text-sky-400" /> Layer Controls
            </div>
            <div className="space-y-2">
              {[
                { key: 'track', label: 'Cyclone Track & Eye', color: '#00f2ff' },
                { key: 'power', label: 'Power Infrastructure', color: '#EF4444' },
                { key: 'medical', label: 'Medical Facilities', color: '#F97316' },
                { key: 'surge', label: 'Surge Risk Zones', color: '#FACC15' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggleLayer(item.key as keyof typeof layers)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                    layers[item.key as keyof typeof layers]
                      ? 'bg-[#07111F] border-sky-500/30 text-white'
                      : 'bg-transparent border-transparent text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    {item.label}
                  </div>
                  <Eye size={12} className={layers[item.key as keyof typeof layers] ? 'text-sky-400' : 'text-zinc-600'} />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-[#1E293B] bg-[#07111F] text-xs space-y-2">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <ShieldAlert size={13} className="text-red-400" /> Active Threat Zone
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Coastal regions in Kendrapara and Bhadrak face surge inundation up to 4.1m.
            </p>
          </div>
        </div>

        {/* Right Main Panel: Full Screen Map */}
        <div className="flex-1 relative">
          <CycloneMap center={mockData.location} path={mockData.projected_path} />
        </div>
      </div>
    </div>
  );
}

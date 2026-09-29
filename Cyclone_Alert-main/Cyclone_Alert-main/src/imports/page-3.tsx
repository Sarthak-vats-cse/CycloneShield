'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ShieldAlert, Zap, Route, Cross as Hospital, Users } from 'lucide-react';
import { RiskBadge } from '@/components/RiskBadge';

export default function RiskPage() {
  const sectors = [
    { name:[200~mkdir -p src/app/risk
cat << 'EOF' > src/app/risk/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ShieldAlert, Zap, Route, Cross as Hospital, Users } from 'lucide-react';
import { RiskBadge } from '@/components/RiskBadge';

export default function RiskPage() {
  const sectors = [
    { name: 'Power Grid', icon: Zap, risk: 'CRITICAL', affected: '7 Substations', action: 'De-energize coastal feeders' },
    { name: 'Road Network', icon: Route, risk: 'HIGH', affected: '43 km arterial', action: 'Divert traffic from NH-16' },
    { name: 'Medical Facilities', icon: Hospital, risk: 'CRITICAL', affected: '8 Hospitals', action: 'Pre-position emergency oxygen' },
    { name: 'Population Shelters', icon: Users, risk: 'HIGH', affected: '1.2M People', action: 'Initiate mandatory evacuation' },
  ];

  return (
    <div className="p-6 h-full space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4 border-b border-[#1E293B] pb-4">
        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <ChevronRight size={12} />
        <span className="text-white">Risk Analysis</span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-6">Infrastructure Risk Breakdown</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectors.map((sec, i) => (
          <div key={i} className="stat-card p-5 rounded-xl border border-[#1E293B] bg-[#0D1D31] flex flex-col gap-3 cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#07111F] text-sky-400"><sec.icon size={20} /></div>
                <div>
                  <h3 className="font-semibold text-white">{sec.name}</h3>
                  <p className="text-xs text-zinc-400">{sec.affected}</p>
                </div>
              </div>
              <RiskBadge level={sec.risk} />
            </div>
            <div className="mt-2 pt-3 border-t border-[#1E293B] text-sm text-zinc-300">
              <span className="text-xs font-mono text-zinc-500 block mb-1">ACTION REQUIRED</span>
              {sec.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';

interface RiskBadgeProps {
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | string;
}

const badgeStyles: Record<string, string> = {
  CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/30',
  HIGH:     'bg-orange-500/15 text-orange-400 border-orange-500/30',
  MODERATE: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  LOW:      'bg-green-500/15 text-green-400 border-green-500/30',
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const style = badgeStyles[level] || 'bg-zinc-800 text-zinc-400 border-zinc-700';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${style}`}>
      {level}
    </span>
  );
};

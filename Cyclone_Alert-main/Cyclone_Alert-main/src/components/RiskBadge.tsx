type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

const config: Record<
  RiskLevel,
  {
    color: string;
    bg: string;
    dot: string;
  }
> = {
  CRITICAL: {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    dot: '#EF4444',
  },

  HIGH: {
    color: '#F97316',
    bg: 'rgba(249,115,22,0.12)',
    dot: '#F97316',
  },

  MODERATE: {
    color: '#FACC15',
    bg: 'rgba(250,204,21,0.12)',
    dot: '#FACC15',
  },

  LOW: {
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.12)',
    dot: '#22C55E',
  },
};

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const badge = config[level];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono-data font-bold tracking-wider"
      style={{
        color: badge.color,
        background: badge.bg,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: badge.dot,
        }}
      />

      {level}
    </span>
  );
}

export type { RiskLevel };
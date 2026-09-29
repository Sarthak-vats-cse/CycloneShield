import { ChevronRight, ExternalLink } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const infraRows = [
  { asset: 'Paradeep Port',          location: 'Jagatsinghpur', risk: 'CRITICAL' as const, status: 'Suspend ops',  action: 'Move vessels' },
  { asset: 'Substation B-12',        location: 'Odisha Coast',  risk: 'HIGH'     as const, status: 'Monitoring',   action: 'Rolling shutdown' },
  { asset: 'Coastal Highway NH-316', location: 'Odisha Coast',  risk: 'HIGH'     as const, status: 'Monitoring',   action: 'Close road' },
  { asset: 'District Hospital',      location: 'Odisha',        risk: 'MODERATE' as const, status: 'Alert sent',   action: 'Surge prep' },
  { asset: 'Inland Telecom Tower',   location: 'Interior',      risk: 'LOW'      as const, status: 'Standby',      action: '—' },
];

const donutData = [
  { name: 'Critical', value: 1, color: '#EF4444' },
  { name: 'High',     value: 2, color: '#F97316' },
  { name: 'Moderate', value: 1, color: '#FACC15' },
  { name: 'Low',      value: 1, color: '#22C55E' },
];

/* Real distance_km from mock-cyclone infrastructure_risk */
const barData = [
  { district: 'Paradeep Port',     exposed: 18  },
  { district: 'Substation B-12',   exposed: 34  },
  { district: 'NH-316 Highway',    exposed: 12  },
  { district: 'District Hospital', exposed: 45  },
  { district: 'Telecom Tower',     exposed: 82  },
];

const riskColor: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH: '#F97316',
  MODERATE: '#FACC15',
  LOW: '#22C55E',
};

const timeline = [
  { time: '12:00', label: '12:00 UTC', event: 'CAT 4 · 215 km/h · 19.8°N 85.8°E · Current', risk: 'HIGH' as const },
  { time: '18:00', label: '18:00 UTC', event: 'Track 20.15°N 86.10°E · Expected intensification', risk: 'HIGH' as const },
  { time: '00:00', label: '00:00 UTC', event: 'Outer bands reach Odisha coast · 20.5°N 86.4°E', risk: 'CRITICAL' as const },
  { time: 'T−2h',  label: 'Est. +6h',  event: 'Mandatory evacuation deadline · 20 km radius', risk: 'CRITICAL' as const },
  { time: 'T−0h',  label: 'Landfall',  event: 'Projected landfall · Paradeep, Odisha', risk: 'CRITICAL' as const },
];

export function RiskAnalysis() {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-4 px-5 py-2.5 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text)' }}>Risk Analysis</span>
        </div>
        <div className="ml-auto font-display font-bold text-sm" style={{ color: 'var(--text)' }}>
          Cyclone Alpha · Infrastructure Risk Breakdown
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Table */}
        <div className="flex flex-col overflow-hidden" style={{ width: '55%', borderRight: '1px solid var(--border)' }}>
          <div
            className="px-4 py-2.5 border-b shrink-0 flex items-center justify-between"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
          >
            <span className="text-xs font-mono-data font-medium tracking-widest" style={{ color: 'var(--muted)' }}>
              INFRASTRUCTURE ASSETS · {infraRows.length} TRACKED · CYCLONE ALPHA
            </span>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--bg-surface)' }}>
                  {['Asset', 'Location', 'Risk Level', 'Status', 'Action'].map(col => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-left font-medium tracking-wide border-b"
                      style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {infraRows.map((row, i) => (
                  <tr
                    key={i}
                    className="group transition-colors cursor-pointer"
                    style={{
                      background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-base)',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hi)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-base)')}
                  >
                    <td className="px-4 py-2.5" style={{ borderLeft: `2px solid ${riskColor[row.risk]}` }}>
                      <div className="font-medium" style={{ color: 'var(--text)' }}>{row.asset}</div>
                    </td>
                    <td className="px-4 py-2.5 font-mono-data" style={{ color: 'var(--muted)' }}>{row.location}</td>
                    <td className="px-4 py-2.5"><RiskBadge level={row.risk} /></td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--muted)' }}>{row.status}</td>
                    <td className="px-4 py-2.5">
                      <button
                        className="px-2 py-0.5 rounded text-xs font-medium transition-colors"
                        style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--accent)', border: '1px solid rgba(56,189,248,0.2)' }}
                      >
                        {row.action}
                        {row.action !== '—' && <ExternalLink size={10} className="inline ml-1" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Charts + timeline */}
        <div className="flex flex-col overflow-y-auto p-4 gap-4" style={{ width: '45%' }}>
          {/* Donut chart */}
          <div className="rounded-lg border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="text-xs font-mono-data font-medium mb-3 tracking-widest" style={{ color: 'var(--muted)' }}>
              RISK DISTRIBUTION
            </div>
            <div className="flex items-center gap-6">
              <div style={{ width: 120, height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                      {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {donutData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{d.name}</span>
                    <span className="text-xs font-mono-data font-medium ml-auto" style={{ color: 'var(--text)' }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="rounded-lg border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="text-xs font-mono-data font-medium mb-3 tracking-widest" style={{ color: 'var(--muted)' }}>
              INFRASTRUCTURE DISTANCE FROM TRACK (km)
            </div>
            <div style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="district" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0D1B2A', border: '1px solid #1E3A55', borderRadius: 6, fontSize: 11, color: '#F8FAFC' }}
                    cursor={{ fill: 'rgba(56,189,248,0.05)' }}
                  />
                  <Bar dataKey="exposed" fill="#F97316" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="text-xs font-mono-data font-medium mb-3 tracking-widest" style={{ color: 'var(--muted)' }}>
              LANDFALL COUNTDOWN · RISK ESCALATION
            </div>
            <div className="relative">
              <div className="absolute left-12 top-2 bottom-2 w-px" style={{ background: 'var(--border)' }} />
              <div className="space-y-3">
                {timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 shrink-0 text-right">
                      <span className="text-xs font-mono-data font-medium" style={{ color: riskColor[t.risk] }}>{t.time}</span>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-0.5 z-10"
                      style={{ background: riskColor[t.risk], boxShadow: `0 0 6px ${riskColor[t.risk]}` }}
                    />
                    <div className="flex-1">
                      <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>{t.event}</div>
                      <div className="text-xs font-mono-data" style={{ color: 'var(--muted)' }}>{t.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

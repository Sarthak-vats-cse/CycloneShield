import { useState } from 'react';
import { LogIn, LayoutDashboard, Map, BarChart3, Bot, Send, CheckCircle, ChevronRight, Info } from 'lucide-react';

type NodeId = 'login' | 'dashboard' | 'cyclone' | 'map' | 'risk' | 'advisory' | 'dispatch' | 'success';

const nodes: { id: NodeId; label: string; sub: string; icon: React.ElementType; x: number; y: number; accent?: string }[] = [
  { id: 'login',     label: 'Authentication',    sub: 'SSO / NDMA credentials',    icon: LogIn,          x: 60,  y: 240 },
  { id: 'dashboard', label: 'Dashboard',          sub: 'Operational overview',       icon: LayoutDashboard, x: 240, y: 240 },
  { id: 'cyclone',   label: 'Active Cyclone',     sub: 'Select BOB-2024-05',         icon: () => <span className="text-base leading-none">🌀</span>, x: 420, y: 140 },
  { id: 'map',       label: 'Map View',           sub: 'GIS layers + track',         icon: Map,            x: 600, y: 140 },
  { id: 'risk',      label: 'Risk Analysis',      sub: 'Infrastructure breakdown',   icon: BarChart3,      x: 600, y: 340 },
  { id: 'advisory',  label: 'AI Advisory',        sub: 'Gemini impact analysis',     icon: Bot,            x: 780, y: 240, accent: '#38BDF8' },
  { id: 'dispatch',  label: 'Dispatch Modal',     sub: 'Confirm NDRF teams',         icon: Send,           x: 960, y: 240, accent: '#EF4444' },
  { id: 'success',   label: 'Success State',      sub: 'Alert broadcasted',          icon: CheckCircle,    x: 1140, y: 240, accent: '#22C55E' },
];

const edges: { from: NodeId; to: NodeId; label?: string; animated?: boolean }[] = [
  { from: 'login',     to: 'dashboard', label: 'fade 300ms' },
  { from: 'dashboard', to: 'cyclone',   label: 'select event' },
  { from: 'dashboard', to: 'risk',      label: 'StatCard click' },
  { from: 'cyclone',   to: 'map',       label: 'view track' },
  { from: 'map',       to: 'risk',      label: 'infra layer' },
  { from: 'risk',      to: 'advisory',  label: 'push right' },
  { from: 'advisory',  to: 'dispatch',  label: 'Dispatch CTA', animated: true },
  { from: 'dispatch',  to: 'success',   label: 'confirm' },
  { from: 'success',   to: 'dashboard', label: 'return' },
];

const nodeInfo: Record<NodeId, { desc: string; interactions: string[]; transitions: string }> = {
  login: {
    desc: 'NDMA-SSO authenticated login page with cyclone status banner.',
    interactions: ['Enter credentials', 'Select organisation unit'],
    transitions: 'Fade → Dashboard (300ms)',
  },
  dashboard: {
    desc: 'Main operational overview with live StatCards, map panel, and alert feed.',
    interactions: ['Click StatCard → Risk Analysis', 'Click map panel → Map View', 'Dismiss alerts', 'Select cyclone from sidebar'],
    transitions: 'Push right → any sub-screen',
  },
  cyclone: {
    desc: 'Cyclone selector shows active storm list sorted by threat level.',
    interactions: ['Select BOB-2024-05 Mocha', 'View intensity history'],
    transitions: 'Inline panel expansion',
  },
  map: {
    desc: 'Full-bleed GIS with 6 layer toggles, zoom, and legend.',
    interactions: ['Toggle layers', 'Zoom in/out', 'Click infrastructure markers'],
    transitions: 'Layer fade 200ms each',
  },
  risk: {
    desc: 'Infrastructure table, donut chart, exposure bars, and landfall timeline.',
    interactions: ['Sort table by risk level', 'Click row → action dispatch', 'Hover chart segments'],
    transitions: 'Push right → AI Advisory',
  },
  advisory: {
    desc: 'Gemini analysis panel with concerns list and advisory generation.',
    interactions: ['Generate advisory (1.4s loading)', 'Switch language', 'Edit / Approve advisory'],
    transitions: 'Panel reveal on generation',
  },
  dispatch: {
    desc: 'Destructive action confirmation modal listing recipients and reach.',
    interactions: ['Review recipients', 'Confirm dispatch', 'Cancel'],
    transitions: 'Modal dismiss → success state',
  },
  success: {
    desc: 'Broadcast confirmation with timestamp, recipient count, and coverage metrics.',
    interactions: ['View dispatch log', 'Return to dashboard'],
    transitions: 'Fade → Dashboard (300ms)',
  },
};

function getNodePos(id: NodeId) {
  const n = nodes.find(n => n.id === id)!;
  return { x: n.x + 72, y: n.y + 36 };
}

export function UserFlow() {
  const [selected, setSelected] = useState<NodeId | null>('dashboard');
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  const info = selected ? nodeInfo[selected] : null;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-2.5 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <div>
          <h1 className="font-display font-bold text-base tracking-wide" style={{ color: 'var(--text)' }}>
            01 · User Flow
          </h1>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Auth → Dashboard → Cyclone → Map → Risk → AI Advisory → Dispatch · Click any node to inspect
          </p>
        </div>
        <div className="flex items-center gap-4">
          {[
            { color: 'var(--accent)', label: 'Navigation' },
            { color: '#EF4444', label: 'Destructive action' },
            { color: '#22C55E', label: 'Success state' },
            { color: '#94A3B8', label: 'Standard transition' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 block rounded-full" style={{ background: l.color }} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-auto relative">
          <div style={{ width: 1280, height: 480, position: 'relative', margin: '40px auto' }}>
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: 1280, height: 480 }}
              viewBox="0 0 1280 480"
            >
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#1E3A55" />
                </marker>
                <marker id="arrow-accent" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#38BDF8" />
                </marker>
                <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#EF4444" />
                </marker>
                <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#22C55E" />
                </marker>
              </defs>

              {edges.map((edge, i) => {
                const from = getNodePos(edge.from);
                const to = getNodePos(edge.to);
                const key = `${edge.from}-${edge.to}`;
                const isHovered = hoveredEdge === key;

                const isRed = edge.label === 'Dispatch CTA';
                const isGreen = edge.from === 'success';
                const isAccent = edge.from === 'advisory';

                const stroke = isRed ? '#EF4444' : isGreen ? '#22C55E' : isAccent ? '#38BDF8' : '#1E3A55';
                const marker = isRed ? 'url(#arrow-red)' : isGreen ? 'url(#arrow-green)' : '#1E3A55';

                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;

                const dx = to.x - from.x;
                const dy = to.y - from.y;

                let d: string;
                if (Math.abs(dy) > 60) {
                  d = `M${from.x},${from.y} C${from.x + dx * 0.3},${from.y} ${to.x - dx * 0.3},${to.y} ${to.x},${to.y}`;
                } else {
                  d = `M${from.x},${from.y} L${to.x},${to.y}`;
                }

                return (
                  <g key={i}>
                    <path
                      d={d}
                      stroke={isHovered ? (isRed ? '#EF4444' : isGreen ? '#22C55E' : '#38BDF8') : stroke}
                      strokeWidth={isHovered ? 2 : 1.5}
                      fill="none"
                      strokeDasharray={edge.animated ? '6 3' : undefined}
                      markerEnd={marker}
                      style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                    />
                    {edge.label && (
                      <text x={mx} y={my - 6} textAnchor="middle" fontSize="9" fill={isHovered ? '#F8FAFC' : '#94A3B8'} fontFamily="JetBrains Mono, monospace">
                        {edge.label}
                      </text>
                    )}
                    {/* invisible hit area */}
                    <path
                      d={d}
                      stroke="transparent"
                      strokeWidth="12"
                      fill="none"
                      style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                      onMouseEnter={() => setHoveredEdge(key)}
                      onMouseLeave={() => setHoveredEdge(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map(node => {
              const isSelected = selected === node.id;
              const Icon = node.icon;
              const accent = node.accent || 'var(--accent)';

              return (
                <button
                  key={node.id}
                  onClick={() => setSelected(node.id === selected ? null : node.id)}
                  className="absolute flex flex-col items-start p-3 rounded-xl border transition-all text-left"
                  style={{
                    left: node.x,
                    top: node.y,
                    width: 144,
                    background: isSelected ? 'var(--bg-card-hi)' : 'var(--bg-card)',
                    borderColor: isSelected ? accent : 'var(--border)',
                    boxShadow: isSelected ? `0 0 0 1px ${accent}, 0 0 20px ${accent}22` : 'none',
                    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: `${accent}18`, color: accent }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="text-xs font-bold font-display" style={{ color: 'var(--text)' }}>{node.label}</div>
                  <div className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--muted)' }}>{node.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info panel */}
        <div
          className="w-72 shrink-0 border-l overflow-y-auto p-5 space-y-4"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          {selected && info ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Info size={14} style={{ color: 'var(--accent)' }} />
                  <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>
                    {nodes.find(n => n.id === selected)?.label}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{info.desc}</p>
              </div>

              <div>
                <div className="text-xs font-mono-data font-medium mb-2 tracking-widest" style={{ color: 'var(--muted)' }}>INTERACTIONS</div>
                <ul className="space-y-1.5">
                  {info.interactions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight size={10} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
                      <span className="text-xs" style={{ color: 'var(--text)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="p-3 rounded-lg text-xs"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="font-mono-data font-medium mb-1" style={{ color: 'var(--muted)' }}>TRANSITION</div>
                <div style={{ color: 'var(--accent)' }}>{info.transitions}</div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center" style={{ color: 'var(--muted)' }}>
              <Info size={24} className="mb-2 opacity-30" />
              <p className="text-xs">Click a node to inspect its interactions and transitions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

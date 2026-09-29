import { useState, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Layers,
  Map, Globe, Zap, Cross as HospitalIcon,
  ZoomIn, ZoomOut, Locate,
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { LeafletMap, type MapMode, type LeafletMapHandle } from '../components/LeafletMap';

/* ─── layer toggles ─────────────────────────────────────────────── */
const layers = [
  { id: 'track',   icon: '🌀', label: 'Cyclone Track & Eye',  defaultOn: true  },
  { id: 'power',   icon: '⚡', label: 'Power Infrastructure',  defaultOn: true  },
  { id: 'medical', icon: '🏥', label: 'Medical Facilities',   defaultOn: true  },
  { id: 'surge',   icon: '💧', label: 'Surge Risk Zones',     defaultOn: true  },
  { id: 'roads',   icon: '🛣',  label: 'Road Network',        defaultOn: false },
];

/* ─── legend data ───────────────────────────────────────────────── */
const riskLevels = [
  { label: 'CRITICAL', color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   ring: 'rgba(239,68,68,0.4)' },
  { label: 'HIGH',     color: '#f97316', bg: 'rgba(249,115,22,0.15)', ring: 'rgba(249,115,22,0.4)' },
  { label: 'MEDIUM',   color: '#eab308', bg: 'rgba(234,179,8,0.15)',  ring: 'rgba(234,179,8,0.4)' },
  { label: 'LOW',      color: '#22c55e', bg: 'rgba(34,197,94,0.15)',  ring: 'rgba(34,197,94,0.4)' },
];

const infraMarkers = [
  { label: 'Hospital',          color: '#00bfff', icon: HospitalIcon },
  { label: 'Power Substation',  color: '#a855f7', icon: Zap          },
];

/* ─── glass panel base style ────────────────────────────────────── */
const glass: React.CSSProperties = {
  background: 'rgba(15,23,42,0.80)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(71,85,105,0.5)',   /* border-slate-700/50 */
  borderRadius: 12,
};

/* ─── MapLayerSwitcher ──────────────────────────────────────────── */
function MapLayerSwitcher({
  mapType, onChange,
}: { mapType: 'standard' | 'satellite'; onChange: (t: 'standard' | 'satellite') => void }) {
  const options: { id: 'standard' | 'satellite'; label: string; Icon: React.ElementType }[] = [
    { id: 'standard',  label: 'Standard Map',  Icon: Map   },
    { id: 'satellite', label: 'Satellite View', Icon: Globe },
  ];

  return (
    <div
      style={{ ...glass, padding: '5px', display: 'flex', gap: 4, userSelect: 'none' }}
    >
      {options.map(opt => {
        const active = mapType === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              border: active ? '1px solid rgba(56,189,248,0.6)' : '1px solid transparent',
              background: active ? 'rgba(56,189,248,0.12)' : 'transparent',
              boxShadow: active ? '0 0 14px rgba(56,189,248,0.25), inset 0 0 8px rgba(56,189,248,0.06)' : 'none',
              color: active ? '#38bdf8' : '#64748b',
              fontSize: 12,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (!active) (e.currentTarget as HTMLElement).style.color = '#94a3b8';
            }}
            onMouseLeave={e => {
              if (!active) (e.currentTarget as HTMLElement).style.color = '#64748b';
            }}
          >
            <opt.Icon size={13} strokeWidth={active ? 2 : 1.5} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── LegendPanel ───────────────────────────────────────────────── */
function LegendPanel() {
  return (
    <div style={{ ...glass, padding: '14px 16px', minWidth: 210 }}>
      {/* Risk levels */}
      <div
        style={{
          fontSize: 9,
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.12em',
          color: '#475569',
          marginBottom: 10,
          textTransform: 'uppercase',
        }}
      >
        Risk Levels
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
        {riskLevels.map(r => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* swatch */}
            <div style={{ position: 'relative', width: 16, height: 16, flexShrink: 0 }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: r.color, opacity: 0.25,
                transform: 'scale(1.7)',
              }} />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: r.color,
              }} />
            </div>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: r.bg, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: r.label === 'CRITICAL' ? '95%' : r.label === 'HIGH' ? '72%' : r.label === 'MEDIUM' ? '48%' : '28%', background: r.color, borderRadius: 2 }} />
            </div>
            <span style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              color: r.color,
              fontWeight: 500,
              minWidth: 58,
            }}>
              {r.label}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(71,85,105,0.4)', marginBottom: 12 }} />

      {/* Infrastructure markers */}
      <div
        style={{
          fontSize: 9,
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.12em',
          color: '#475569',
          marginBottom: 10,
          textTransform: 'uppercase',
        }}
      >
        Infrastructure
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {infraMarkers.map(m => (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: `${m.color}18`,
                border: `1px solid ${m.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <m.icon size={13} color={m.color} strokeWidth={1.8} />
            </div>
            <span style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#94a3b8' }}>
              {m.label}
            </span>
            <div
              style={{
                marginLeft: 'auto',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: m.color,
                boxShadow: `0 0 6px ${m.color}`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MapView (main export) ─────────────────────────────────────── */
export function MapView() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [mapMode, setMapMode]     = useState<MapMode>('satellite');
  const [active, setActive]       = useState<Record<string, boolean>>(
    Object.fromEntries(layers.map(l => [l.id, l.defaultOn]))
  );
  const mapRef = useRef<LeafletMapHandle>(null);

  const toggle = (id: string) => setActive(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Top breadcrumb bar */}
      <div
        className="flex items-center gap-4 px-5 py-2.5 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text)' }}>Map View</span>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>
            Cyclone Alpha · 19.8°N 85.8°E
          </span>
          <RiskBadge level="CRITICAL" />
          <div className="text-xs font-mono-data" style={{ color: 'var(--muted)' }}>
            CAT 4 · 215 km/h · 940 hPa · Landfall: Paradeep, Odisha
          </div>
        </div>
      </div>

      {/* Map canvas */}
      <div className="flex-1 relative overflow-hidden">
        {/* Full-bleed real Leaflet map */}
        <div className="absolute inset-0">
          <LeafletMap
            ref={mapRef}
            mode={mapMode}
            showTrack={active['track']}
            showSurge={active['surge']}
          />
        </div>

        {/* ── LEFT: Layer panel ──────────────────────────────────── */}
        <div
          className="absolute top-0 bottom-0 left-0 flex transition-all duration-300"
          style={{ width: panelOpen ? 220 : 0 }}
        >
          <div
            className="w-full overflow-hidden flex flex-col"
            style={{
              background: 'rgba(13,27,42,0.92)',
              backdropFilter: 'blur(12px)',
              borderRight: '1px solid rgba(71,85,105,0.5)',
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(71,85,105,0.4)' }}>
              <div className="flex items-center gap-2">
                <Layers size={14} style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-mono-data font-medium tracking-widest" style={{ color: 'var(--muted)' }}>
                  MAP LAYERS
                </span>
              </div>
            </div>
            {/* Threat zone alert */}
            <div className="px-3 py-2.5 mx-2 mt-2 rounded-lg border shrink-0"
              style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.25)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-mono-data font-bold" style={{ color: '#EF4444' }}>ACTIVE THREAT ZONE</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                Kendrapara & Bhadrak coastal regions face surge inundation up to 4.1 m. 20 km evacuation radius active.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {layers.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => toggle(layer.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <span className="text-base w-5">{layer.icon}</span>
                  <span className="flex-1 text-xs font-medium" style={{ color: active[layer.id] ? 'var(--text)' : 'var(--muted)' }}>
                    {layer.label}
                  </span>
                  {/* pill toggle */}
                  <div
                    className="w-8 h-4 rounded-full relative transition-all duration-200"
                    style={{ background: active[layer.id] ? 'var(--accent)' : 'var(--border)' }}
                  >
                    <div
                      className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
                      style={{ background: '#fff', left: active[layer.id] ? '17px' : '2px' }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel collapse tab */}
        <button
          onClick={() => setPanelOpen(p => !p)}
          className="absolute top-1/2 -translate-y-1/2 w-5 h-10 flex items-center justify-center rounded-r transition-colors"
          style={{
            left: panelOpen ? 220 : 0,
            background: 'rgba(13,27,42,0.92)',
            border: '1px solid rgba(71,85,105,0.5)',
            borderLeft: 'none',
            color: 'var(--muted)',
            transition: 'left 0.3s',
          }}
        >
          {panelOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* ── TOP-RIGHT: Map Mode Switcher ───────────────────────── */}
        <div className="absolute top-4 right-4 z-[1000] flex"
          style={{
            background: 'rgba(15,23,42,0.85)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(71,85,105,0.5)',
            borderRadius: 10,
            padding: 4,
            gap: 3,
          }}>
          {([
            { id: 'standard',  label: 'Base Map',      Icon: Map   },
            { id: 'satellite', label: 'Satellite',     Icon: Globe },
            { id: 'wind',      label: 'Wind Velocity', Icon: Zap   },
          ] as const).map(opt => {
            const active = mapMode === opt.id;
            return (
              <button key={opt.id} onClick={() => setMapMode(opt.id as MapMode)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 7,
                  border: active ? '1px solid rgba(56,189,248,0.55)' : '1px solid transparent',
                  background: active ? 'rgba(56,189,248,0.13)' : 'transparent',
                  color: active ? '#38bdf8' : '#64748b',
                  fontSize: 11, fontFamily: 'Inter,sans-serif', fontWeight: 500,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}>
                <opt.Icon size={12} />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* ── BOTTOM-LEFT: Legend panel ──────────────────────────── */}
        <div className="absolute bottom-4 left-4 z-10" style={{ left: panelOpen ? 232 : 16, transition: 'left 0.3s' }}>
          <LegendPanel />
        </div>

        {/* ── BOTTOM-RIGHT: Zoom controls ───────────────────────── */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
          {([
            { Icon: ZoomIn,  action: () => mapRef.current?.zoomIn()  },
            { Icon: ZoomOut, action: () => mapRef.current?.zoomOut() },
            { Icon: Locate,  action: () => mapRef.current?.locate()  },
          ]).map(({ Icon, action }, i) => (
            <button
              key={i}
              onClick={action}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(15,23,42,0.80)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(71,85,105,0.5)',
                color: 'var(--muted)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--muted)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(71,85,105,0.5)';
              }}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Map, AlertTriangle, Bot, BarChart3, Menu, X, Bell, Zap, Route, Cross as Hospital, Users, ChevronUp, Shield, Wind } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

type MobileTab = 'map' | 'risks' | 'alerts' | 'advisory';
type PreviewScreen = 'dashboard' | 'map' | 'advisory';

const riskColor: Record<string, string> = {
  CRITICAL: '#EF4444', HIGH: '#F97316', MODERATE: '#FACC15', LOW: '#22C55E',
};

const infraCards = [
  { icon: Zap, title: 'Paradip Substation A', loc: 'Kendrapara', risk: 'CRITICAL' as const, status: 'Unprotected' },
  { icon: Route, title: 'NH-16 Km 42', loc: 'Bhadrak', risk: 'HIGH' as const, status: 'Monitoring' },
  { icon: Hospital, title: 'KIMS Hospital', loc: 'Bhubaneswar', risk: 'HIGH' as const, status: 'Alert sent' },
  { icon: Shield, title: 'Bhadrak Shelter 3', loc: 'Bhadrak', risk: 'MODERATE' as const, status: 'Standby' },
  { icon: Zap, title: 'Ersama Substation B', loc: 'Kendrapara', risk: 'CRITICAL' as const, status: 'Unprotected' },
];

const alerts = [
  { severity: 'CRITICAL' as const, title: 'Paradip Substation A — Surge breach imminent', time: '09:42' },
  { severity: 'HIGH' as const, title: 'NH-16 Km 42 — Overtopping reported', time: '09:31' },
  { severity: 'HIGH' as const, title: 'KIMS Hospital — Evacuation advisory', time: '09:18' },
];

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-mono-data mb-3 tracking-widest" style={{ color: 'var(--muted)' }}>{label}</div>
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{
          width: 390,
          height: 844,
          background: 'var(--bg-base)',
          border: '2px solid var(--border)',
          boxShadow: '0 0 40px rgba(0,0,0,0.6)',
          transform: 'scale(0.7)',
          transformOrigin: 'top center',
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-6 py-2 text-xs font-mono-data"
          style={{ background: 'var(--bg-surface)', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}
        >
          <span>9:45</span>
          <div
            className="w-24 h-5 rounded-full"
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
          />
          <div className="flex gap-1 items-center">
            <Wind size={10} />
            <span>100%</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function MobileDashboard({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top nav */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <button onClick={onMenuOpen}><Menu size={18} style={{ color: 'var(--muted)' }} /></button>
        <div className="text-center">
          <div className="text-xs font-display font-bold" style={{ color: 'var(--text)' }}>CycloneShield</div>
          <div className="text-xs font-mono-data" style={{ color: 'var(--risk-critical)' }}>● ACTIVE WARNING</div>
        </div>
        <button>
          <Bell size={18} style={{ color: 'var(--muted)' }} />
          <span className="absolute -mt-1 ml-3 w-3 h-3 rounded-full text-xs flex items-center justify-center"
            style={{ background: '#EF4444', color: '#fff', fontSize: 8 }}>3</span>
        </button>
      </div>

      {/* Cyclone banner */}
      <div
        className="mx-3 mt-3 px-3 py-2.5 rounded-xl flex items-center gap-3"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
      >
        <span className="text-xl">🌀</span>
        <div>
          <div className="text-xs font-bold" style={{ color: 'var(--text)' }}>Cyclone Mocha · CAT 4</div>
          <div className="text-xs font-mono-data" style={{ color: '#EF4444' }}>Landfall T−14h · Paradip</div>
        </div>
        <div className="ml-auto text-xs font-mono-data" style={{ color: 'var(--muted)' }}>165 km/h</div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 px-3 mt-3">
        {[
          { label: 'Substations', val: '27', risk: 'HIGH' as const, icon: Zap },
          { label: 'Roads', val: '43 km', risk: 'HIGH' as const, icon: Route },
          { label: 'Hospitals', val: '8', risk: 'CRITICAL' as const, icon: Hospital },
          { label: 'Population', val: '1.2M', risk: 'HIGH' as const, icon: Users },
        ].map((s, i) => (
          <div
            key={i}
            className="p-3 rounded-xl"
            style={{
              background: 'var(--bg-card)',
              border: `1px solid var(--border)`,
              borderLeft: `3px solid ${riskColor[s.risk]}`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <s.icon size={12} style={{ color: 'var(--muted)' }} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{s.label}</span>
            </div>
            <div className="font-mono-data font-bold text-xl" style={{ color: 'var(--text)' }}>{s.val}</div>
            <RiskBadge level={s.risk} />
          </div>
        ))}
      </div>

      {/* Alert preview */}
      <div className="px-3 mt-3 flex-1 overflow-hidden">
        <div className="text-xs font-mono-data mb-2 tracking-widest" style={{ color: 'var(--muted)' }}>ACTIVE ALERTS</div>
        <div className="space-y-2">
          {alerts.slice(0, 2).map((a, i) => (
            <div
              key={i}
              className="flex gap-2 p-2.5 rounded-lg"
              style={{ background: 'var(--bg-card)', borderLeft: `2px solid ${riskColor[a.severity]}` }}
            >
              <AlertTriangle size={12} style={{ color: riskColor[a.severity], marginTop: 1, flexShrink: 0 }} />
              <div>
                <div className="text-xs leading-snug" style={{ color: 'var(--text)' }}>{a.title}</div>
                <div className="text-xs font-mono-data mt-0.5" style={{ color: 'var(--muted)' }}>{a.time} IST</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom risk bar — floating sheet handle */}
      <div
        className="mx-3 mb-20 mt-2 p-3 rounded-xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono-data" style={{ color: 'var(--muted)' }}>RISK SUMMARY</span>
          <ChevronUp size={12} style={{ color: 'var(--muted)' }} />
        </div>
        <div className="flex gap-2">
          {[{ l: 'Power', pct: 71, r: 'CRITICAL' }, { l: 'Roads', pct: 58, r: 'HIGH' }, { l: 'Medical', pct: 50, r: 'HIGH' }].map(c => (
            <div key={c.l} className="flex-1">
              <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{c.l}</div>
              <div className="h-1 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: riskColor[c.r] }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <MobileBottomNav active="map" />
    </div>
  );
}

function MobileMapScreen() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <span className="text-sm font-display font-bold" style={{ color: 'var(--text)' }}>Map View</span>
        <RiskBadge level="CRITICAL" />
      </div>

      {/* Map placeholder */}
      <div className="flex-1 relative" style={{ background: '#071826' }}>
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {[1,2,3,4,5,6,7,8,9].map(i => (
            <line key={`h${i}`} x1="0" y1={`${i*11}%`} x2="100%" y2={`${i*11}%`} stroke="#38BDF8" strokeWidth="0.5" />
          ))}
          {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(i => (
            <line key={`v${i}`} x1={`${i*7}%`} y1="0" x2={`${i*7}%`} y2="100%" stroke="#38BDF8" strokeWidth="0.5" />
          ))}
        </svg>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 500" preserveAspectRatio="xMidYMid meet">
          <path d="M0,80 Q80,90 160,110 Q220,130 270,170 Q300,200 290,260 L0,260 Z"
            fill="rgba(14,38,66,0.85)" stroke="#1E3A55" strokeWidth="1.5" />
          <ellipse cx="290" cy="220" rx="60" ry="45" fill="rgba(239,68,68,0.12)" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="5 3" />
          <ellipse cx="290" cy="220" rx="95" ry="75" fill="rgba(249,115,22,0.06)" stroke="#F97316" strokeWidth="1" strokeDasharray="4 3" />
          <path d="M290,460 Q295,380 290,300 Q285,250 290,220" stroke="#38BDF8" strokeWidth="2" strokeDasharray="8 4" fill="none" />
          <text x="283" y="255" fontSize="22" textAnchor="middle">🌀</text>
          <circle cx="265" cy="175" r="5" fill="#EF4444" />
          <text x="100" y="350" fontSize="9" fill="#38BDF8" opacity="0.3" fontFamily="monospace" letterSpacing="2">BAY OF BENGAL</text>
        </svg>
        {/* floating legend */}
        <div
          className="absolute bottom-4 left-3 p-2 rounded-lg text-xs space-y-1"
          style={{ background: 'rgba(13,27,42,0.95)', border: '1px solid var(--border)' }}
        >
          {[['#EF4444','Critical zone'],['#F97316','High risk'],['#38BDF8','Cyclone track']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 block" style={{ background: c }} />
              <span style={{ color: 'var(--muted)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <MobileBottomNav active="map" />
    </div>
  );
}

function MobileAdvisoryScreen() {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleGen = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 1200);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <span className="text-sm font-display font-bold" style={{ color: 'var(--text)' }}>AI Advisory</span>
        <RiskBadge level="HIGH" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 pb-20">
        {/* Analysis card */}
        <div className="rounded-xl border p-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Bot size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-bold font-display" style={{ color: 'var(--text)' }}>AI IMPACT ANALYSIS</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            BOB-2024-05 Mocha tracking northwest at 14 km/h. Projected landfall near Paradip in <span style={{ color: '#F97316' }}>14 hours</span>.
            Storm surge modeling shows <span style={{ color: '#EF4444' }}>2.8–4.1 m surge</span> along Kendrapara–Bhadrak coastline.
          </p>
        </div>

        {/* Concerns */}
        {[
          { risk: '#EF4444', text: '7 substations at critical surge risk' },
          { risk: '#F97316', text: '21 km NH-16 roads compromised' },
          { risk: '#EF4444', text: '4 medical facilities in surge zone' },
          { risk: '#F97316', text: '380,000 persons exposed' },
        ].map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--bg-card)', borderLeft: `2px solid ${c.risk}` }}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.risk }} />
            <span className="text-xs" style={{ color: 'var(--text)' }}>{c.text}</span>
          </div>
        ))}

        {/* Generate button */}
        <button
          onClick={handleGen}
          disabled={loading || generated}
          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
          style={{
            background: generated ? 'rgba(34,197,94,0.1)' : 'var(--accent)',
            color: generated ? '#22C55E' : '#07111F',
            border: generated ? '1px solid rgba(34,197,94,0.3)' : 'none',
          }}
        >
          {loading ? '⏳ Generating...' : generated ? '✓ Advisory Generated' : '✦ Generate Emergency Advisory'}
        </button>

        {/* Advisory */}
        {generated && (
          <div className="rounded-xl border p-3 space-y-2" style={{ background: 'var(--bg-card)', borderColor: '#EF4444' }}>
            <div className="text-xs font-bold font-display" style={{ color: '#EF4444' }}>📢 EMERGENCY ADVISORY</div>
            {[
              'Inspect & de-energize 7 substations in Kendrapara by T−8h.',
              'Pre-position 3 NDRF teams at Bhadrak staging area by 15:00.',
              'Evacuate habitations within 10 km of landfall by 18:00.',
              'Activate KIMS + Balasore DH for mass-casualty preparedness.',
              'Close NH-16 Km 38–55 pending surge zone inspection.',
            ].map((item, i) => (
              <div key={i} className="flex gap-2">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-mono-data shrink-0"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontSize: 9 }}>
                  {i + 1}
                </span>
                <span className="text-xs leading-snug" style={{ color: 'var(--text)' }}>{item}</span>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                ✓ Approve
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 py-2 rounded-lg text-xs font-bold"
                style={{ background: '#EF4444', color: '#fff' }}>
                📡 Dispatch
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dispatch modal */}
      {showModal && (
        <div className="absolute inset-0 flex items-end z-50" style={{ background: 'rgba(7,17,31,0.85)' }}>
          <div
            className="w-full rounded-t-2xl p-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
            <h3 className="font-display font-bold text-base mb-1" style={{ color: '#EF4444' }}>Confirm Dispatch</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              Broadcast to NDRF HQ, 3 District Collectors, ODRAF, Coast Guard. Reach: <span style={{ color: '#F97316' }}>1.2M persons</span> via IVR + SMS.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl text-sm"
                style={{ background: 'var(--bg-card)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: '#EF4444', color: '#fff' }}>
                Dispatch Now
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav active="advisory" />
    </div>
  );
}

function MobileBottomNav({ active }: { active: MobileTab }) {
  const tabs: { id: MobileTab; icon: React.ElementType; label: string }[] = [
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'risks', icon: BarChart3, label: 'Risks' },
    { id: 'alerts', icon: AlertTriangle, label: 'Alerts' },
    { id: 'advisory', icon: Bot, label: 'Advisory' },
  ];
  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex border-t"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {tabs.map(tab => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            className="flex-1 flex flex-col items-center py-2.5 gap-1"
            style={{ color: isActive ? 'var(--accent)' : 'var(--muted)' }}
          >
            <tab.icon size={16} />
            <span className="text-xs">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function MobilePreview() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-2.5 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <div>
          <h1 className="font-display font-bold text-base tracking-wide" style={{ color: 'var(--text)' }}>
            09 · Mobile View
          </h1>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            390×844 · iPhone 14 Pro · Dashboard / Map / AI Advisory screens
          </p>
        </div>
        <div className="text-xs font-mono-data" style={{ color: 'var(--muted)' }}>
          @2× · Light-off · Odisha coastline data
        </div>
      </div>

      {/* Phone frames */}
      <div className="flex-1 overflow-auto">
        <div className="flex gap-16 px-16 py-8 items-start min-w-max">
          <PhoneFrame label="05 · DASHBOARD">
            <MobileDashboard onMenuOpen={() => setDrawerOpen(true)} />
          </PhoneFrame>

          <PhoneFrame label="06 · MAP VIEW">
            <MobileMapScreen />
          </PhoneFrame>

          <PhoneFrame label="08 · AI ADVISORY">
            <MobileAdvisoryScreen />
          </PhoneFrame>
        </div>
      </div>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="absolute inset-0 z-50 flex justify-end" style={{ background: 'rgba(7,17,31,0.7)' }}
          onClick={() => setDrawerOpen(false)}>
          <div
            className="w-64 h-full flex flex-col p-5"
            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>CycloneShield</span>
              <button onClick={() => setDrawerOpen(false)}>
                <X size={16} style={{ color: 'var(--muted)' }} />
              </button>
            </div>
            <nav className="space-y-1">
              {[
                { icon: BarChart3, label: 'Dashboard' },
                { icon: Map, label: 'Map View' },
                { icon: Zap, label: 'Risk Analysis' },
                { icon: Bot, label: 'AI Advisory' },
                { icon: AlertTriangle, label: 'Alerts', badge: 3 },
              ].map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                  style={{ color: i === 0 ? 'var(--accent)' : 'var(--muted)', background: i === 0 ? 'rgba(56,189,248,0.1)' : 'transparent' }}
                >
                  <item.icon size={16} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#EF4444', color: '#fff' }}>{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
            <div className="mt-auto">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div className="text-xs font-display font-bold" style={{ color: '#EF4444' }}>🌀 BOB-2024-05 Mocha</div>
                <div className="text-xs font-mono-data mt-1" style={{ color: 'var(--muted)' }}>CAT 4 · Landfall T−14h</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

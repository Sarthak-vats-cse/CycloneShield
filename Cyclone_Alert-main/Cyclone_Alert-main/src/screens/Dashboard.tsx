import { useState } from 'react';
import {
  Zap,
  Route,
  Cross as Hospital,
  Users,
  AlertTriangle,
  Clock,
  X,
  TrendingUp,
  Bell,
  RefreshCw,
  Shield,
  Map,
  Bot,
  Wind,
  Thermometer,
  Droplets,
  Check,
} from 'lucide-react';
import { CycloneShieldLogo } from '../components/CycloneShieldLogo';
import { WindMapPanel } from '../components/WindMapPanel';
import { RiskBadge } from '../components/RiskBadge';
import type { Screen } from '../components/Sidebar';

/* ── risk → glow class mapping ────────────────────────────────── */
const glowClass: Record<string, string> = {
  CRITICAL: 'glow-critical',
  HIGH: 'glow-high',
  MODERATE: 'glow-moderate',
  LOW: 'glow-low',
  ACCENT: 'glow-accent',
};

const riskColor: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH: '#F97316',
  MODERATE: '#FACC15',
  LOW: '#22C55E',
};

/* ── data ──────────────────────────────────────────────────────── */
const stats = [
  {
    label: 'Port Facility',
    value: '1',
    unit: 'CRITICAL risk',
    risk: 'CRITICAL' as const,
    icon: Zap,
    delta: 'Paradeep Port · 18 km',
    screen: 'risk' as Screen,
  },
  {
    label: 'Power Grid',
    value: '1',
    unit: 'HIGH risk',
    risk: 'HIGH' as const,
    icon: Route,
    delta: 'Substation B-12 · 34 km',
    screen: 'risk' as Screen,
  },
  {
    label: 'Healthcare',
    value: '1',
    unit: 'MODERATE risk',
    risk: 'MODERATE' as const,
    icon: Hospital,
    delta: 'District Hospital · 45 km',
    screen: 'risk' as Screen,
  },
  {
    label: 'Infrastructure',
    value: '5',
    unit: 'assets tracked',
    risk: 'HIGH' as const,
    icon: Users,
    delta: 'Coastal Highway · 12 km',
    screen: 'risk' as Screen,
  },
];

const weatherCards = [
  {
    label: 'Wind Speed',
    value: '215',
    unit: 'km/h',
    risk: 'CRITICAL' as const,
    icon: Wind,
    live: true,
  },
  {
    label: 'Pressure',
    value: '940',
    unit: 'hPa',
    risk: 'CRITICAL' as const,
    icon: Thermometer,
    live: true,
  },
  {
    label: 'Storm Surge',
    value: '4.8',
    unit: 'm est.',
    risk: 'CRITICAL' as const,
    icon: Droplets,
    live: false,
  },
  {
    label: 'Rainfall',
    value: '410',
    unit: 'mm/day',
    risk: 'HIGH' as const,
    icon: Droplets,
    live: false,
  },
];

const initialAlerts = [
  {
    id: 1,
    severity: 'CRITICAL' as const,
    title:
      'Paradeep Port — Suspend all operations, move vessels to outer anchorage',
    time: '12:00 UTC',
    district: 'Jagatsinghpur',
  },
  {
    id: 2,
    severity: 'CRITICAL' as const,
    title:
      'Coastal zones within 20 km radius — Mandatory evacuation order issued',
    time: '11:48 UTC',
    district: 'Kendrapara',
  },
  {
    id: 3,
    severity: 'HIGH' as const,
    title:
      'Coastal Highway NH-316 — Closures expected, 12 km from cyclone track',
    time: '11:30 UTC',
    district: 'Odisha Coast',
  },
  {
    id: 4,
    severity: 'HIGH' as const,
    title:
      'Substation B-12 — Initiate rolling shutdown on 33kV coastal feeders',
    time: '11:15 UTC',
    district: 'Power Grid',
  },
  {
    id: 5,
    severity: 'MODERATE' as const,
    title:
      'District Hospital — Surge preparedness activated, 45 km from track',
    time: '11:00 UTC',
    district: 'Healthcare',
  },
];

const riskCategories = [
  {
    label: 'Port Facility',
    pct: 95,
    risk: 'CRITICAL' as const,
  },
  {
    label: 'Civil Defense',
    pct: 90,
    risk: 'CRITICAL' as const,
  },
  {
    label: 'Power Grid',
    pct: 68,
    risk: 'HIGH' as const,
  },
  {
    label: 'Transport',
    pct: 55,
    risk: 'HIGH' as const,
  },
  {
    label: 'Healthcare',
    pct: 40,
    risk: 'MODERATE' as const,
  },
  {
    label: 'Telecoms',
    pct: 18,
    risk: 'LOW' as const,
  },
];

/* ── component ─────────────────────────────────────────────────── */
export function Dashboard({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void;
}) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [lastUpdated, setLastUpdated] = useState('09:45 IST');
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const dismiss = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const refresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setLastUpdated(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }) + ' IST',
      );

      setRefreshing(false);
    }, 800);
  };

  const activeAlertCount = alerts.filter((a) =>
    ['CRITICAL', 'HIGH'].includes(a.severity),
  ).length;

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        position: 'relative',
      }}
    >
      {/* Atmospheric background */}
      <div className="cyclone-bg" />
      <div className="cyclone-overlay" />

      {/* Main stacking context */}
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* ====================================================== */}
        {/* TOP NAV - HIGH Z-INDEX                                  */}
        {/* ====================================================== */}
        <div
          className="relative flex items-center gap-4 px-5 py-2.5 border-b shrink-0"
          style={{
            zIndex: 1000,
            overflow: 'visible',
            borderColor: 'var(--border)',
            background: 'rgba(7,17,31,0.72)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            <CycloneShieldLogo size={38} glow />

            <div>
              <h1
                className="font-display font-bold text-base"
                style={{
                  color: 'var(--text)',
                }}
              >
                Operational Dashboard
              </h1>

              <div
                className="flex items-center gap-3 text-xs font-mono-data"
                style={{
                  color: 'var(--muted)',
                }}
              >
                <Clock size={10} className="inline" />
                <span>Updated {lastUpdated}</span>
                <span>·</span>
                <span>Cyclone Alpha</span>
                <span>·</span>
                <span>
                  Category 4 Very Severe Storm · Paradeep,
                  Odisha
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            {/* CAT badge */}
            <div
              className="px-2.5 py-1.5 rounded text-xs font-mono-data font-bold flex items-center gap-1.5"
              style={{
                background: 'rgba(239,68,68,0.12)',
                color: '#EF4444',
                border:
                  '1px solid rgba(239,68,68,0.3)',
                boxShadow:
                  '0 0 12px rgba(239,68,68,0.25)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse metric-live" />
              CAT 4 · 215 km/h
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={refresh}
              title="Refresh dashboard"
              className="relative w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{
                background:
                  'rgba(18,38,58,0.7)',
                border:
                  '1px solid var(--border)',
                color: 'var(--muted)',
                zIndex: 1001,
              }}
            >
              <RefreshCw
                size={13}
                className={
                  refreshing ? 'animate-spin' : ''
                }
              />
            </button>

            {/* Notifications */}
            <div
              className="relative"
              style={{
                zIndex: 1100,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen(
                    (prev) => !prev,
                  )
                }
                title="Notifications"
                className="relative w-7 h-7 rounded flex items-center justify-center transition-colors"
                style={{
                  background: notificationsOpen
                    ? 'rgba(56,189,248,0.12)'
                    : 'rgba(18,38,58,0.7)',
                  border: notificationsOpen
                    ? '1px solid rgba(56,189,248,0.35)'
                    : '1px solid var(--border)',
                  color: notificationsOpen
                    ? 'var(--accent)'
                    : 'var(--muted)',
                  zIndex: 1101,
                }}
              >
                <Bell size={13} />
              </button>

              {alerts.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                  style={{
                    background: '#EF4444',
                    fontSize: 9,
                    zIndex: 1102,
                  }}
                >
                  {alerts.length}
                </span>
              )}

              {/* ================================================= */}
              {/* NOTIFICATION DROPDOWN - ABOVE EVERYTHING          */}
              {/* ================================================= */}
              {notificationsOpen && (
                <div
                  className="absolute right-0 top-9 w-80 rounded-xl border overflow-hidden shadow-2xl"
                  style={{
                    zIndex: 9999,
                    background:
                      'var(--bg-surface)',
                    borderColor:
                      'var(--border)',
                    boxShadow:
                      '0 20px 50px rgba(0,0,0,0.55)',
                  }}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b"
                    style={{
                      borderColor:
                        'var(--border)',
                    }}
                  >
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{
                          color:
                            'var(--text)',
                        }}
                      >
                        Notifications
                      </div>

                      <div
                        className="text-[10px] font-mono-data mt-0.5"
                        style={{
                          color:
                            'var(--muted)',
                        }}
                      >
                        {alerts.length} alerts ·{' '}
                        {activeAlertCount} active
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setNotificationsOpen(
                          false,
                        )
                      }
                    >
                      <X
                        size={14}
                        style={{
                          color:
                            'var(--muted)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Notification list */}
                  {alerts.length === 0 ? (
                    <div className="px-4 py-8 flex flex-col items-center gap-2">
                      <Check
                        size={20}
                        style={{
                          color: '#22C55E',
                        }}
                      />

                      <span
                        className="text-xs"
                        style={{
                          color:
                            'var(--muted)',
                        }}
                      >
                        No active notifications
                      </span>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="px-3 py-3 border-b"
                          style={{
                            borderColor:
                              'var(--border)',
                          }}
                        >
                          <div className="flex gap-2">
                            <div
                              className="w-1 rounded-full shrink-0"
                              style={{
                                background:
                                  riskColor[
                                    alert.severity
                                  ],
                              }}
                            />

                            <div className="min-w-0 flex-1">
                              <div
                                className="text-xs font-medium leading-snug"
                                style={{
                                  color:
                                    'var(--text)',
                                }}
                              >
                                {alert.title}
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                <RiskBadge
                                  level={
                                    alert.severity
                                  }
                                />

                                <span
                                  className="text-[10px] font-mono-data"
                                  style={{
                                    color:
                                      'var(--muted)',
                                  }}
                                >
                                  {alert.time}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                dismiss(
                                  alert.id,
                                )
                              }
                              title="Dismiss notification"
                              className="shrink-0"
                            >
                              <X
                                size={12}
                                style={{
                                  color:
                                    'var(--muted)',
                                }}
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(
                        false,
                      );
                      onNavigate('risk');
                    }}
                    className="w-full px-4 py-2.5 text-xs font-medium text-left transition-colors"
                    style={{
                      color: 'var(--accent)',
                      background:
                        'rgba(56,189,248,0.04)',
                    }}
                  >
                    Open Risk Analysis →
                  </button>
                </div>
              )}
            </div>

            {/* Map View */}
            <button
              type="button"
              onClick={() => onNavigate('map')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
              style={{
                background:
                  'rgba(56,189,248,0.08)',
                color: 'var(--accent)',
                border:
                  '1px solid rgba(56,189,248,0.18)',
              }}
            >
              <Map size={12} />
              Map View
            </button>

            {/* AI Advisory */}
            <button
              type="button"
              onClick={() =>
                onNavigate('advisory')
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
              style={{
                background:
                  'rgba(56,189,248,0.08)',
                color: '#38BDF8',
                border:
                  '1px solid rgba(56,189,248,0.18)',
              }}
            >
              <Bot size={12} />
              AI Advisory
            </button>
          </div>
        </div>

        {/* ====================================================== */}
        {/* BODY - LOWER STACKING LAYER                              */}
        {/* ====================================================== */}
        <div
          className="relative flex-1 overflow-y-auto p-4 space-y-4"
          style={{
            zIndex: 1,
          }}
        >
          {/* Weather metrics */}
          <div className="grid grid-cols-4 gap-3">
            {weatherCards.map((w, i) => (
              <div
                key={i}
                className={`stat-card ${glowClass[w.risk]} p-3 rounded-xl border`}
                style={{
                  background:
                    'rgba(18,38,58,0.65)',
                  backdropFilter: 'blur(10px)',
                  borderColor:
                    'var(--border)',
                  borderLeft: `2px solid ${
                    riskColor[w.risk]
                  }`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <w.icon
                    size={13}
                    style={{
                      color:
                        riskColor[w.risk],
                    }}
                  />

                  <span
                    className="text-xs"
                    style={{
                      color:
                        'var(--muted)',
                    }}
                  >
                    {w.label}
                  </span>

                  {w.live && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full metric-live"
                      style={{
                        background:
                          riskColor[w.risk],
                      }}
                    />
                  )}
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-mono-data font-bold text-xl"
                    style={{
                      color: 'var(--text)',
                    }}
                  >
                    {w.value}
                  </span>

                  <span
                    className="text-xs font-mono-data"
                    style={{
                      color: 'var(--muted)',
                    }}
                  >
                    {w.unit}
                  </span>
                </div>

                <div className="mt-1">
                  <RiskBadge level={w.risk} />
                </div>
              </div>
            ))}
          </div>

          {/* Infrastructure stat cards */}
          <div className="grid grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <button
                type="button"
                key={i}
                onClick={() =>
                  onNavigate(s.screen)
                }
                className={`stat-card ${glowClass[s.risk]} text-left p-4 rounded-xl border`}
                style={{
                  background:
                    'rgba(18,38,58,0.65)',
                  backdropFilter: 'blur(10px)',
                  borderColor:
                    'var(--border)',
                  borderLeft: `3px solid ${
                    riskColor[s.risk]
                  }`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${riskColor[s.risk]}18`,
                    }}
                  >
                    <s.icon
                      size={15}
                      style={{
                        color:
                          riskColor[s.risk],
                      }}
                    />
                  </div>

                  <RiskBadge level={s.risk} />
                </div>

                <div
                  className="font-mono-data font-bold text-2xl"
                  style={{
                    color: 'var(--text)',
                  }}
                >
                  {s.value}
                </div>

                <div
                  className="text-xs mt-0.5"
                  style={{
                    color: 'var(--muted)',
                  }}
                >
                  {s.unit}
                </div>

                <div
                  className="text-xs mt-2 font-medium"
                  style={{
                    color: 'var(--text)',
                  }}
                >
                  {s.label}
                </div>

                <div
                  className="text-xs mt-1 flex items-center gap-1"
                  style={{
                    color: 'var(--muted)',
                  }}
                >
                  <TrendingUp
                    size={9}
                    style={{
                      color: '#EF4444',
                    }}
                  />
                  {s.delta}
                </div>
              </button>
            ))}
          </div>

          {/* Map + Alert feed */}
          <div
            className="grid grid-cols-5 gap-3"
            style={{
              height: 280,
            }}
          >
            <div
              className="stat-card glow-accent col-span-3 rounded-xl overflow-hidden relative cursor-pointer"
              onClick={() => onNavigate('map')}
            >
              <WindMapPanel
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 0,
                  border: 'none',
                  boxShadow: 'none',
                }}
              />

              <div
                className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-mono-data font-medium z-10 pointer-events-none"
                style={{
                  background:
                    'rgba(7,17,31,0.85)',
                  color: 'var(--accent)',
                  border:
                    '1px solid rgba(56,189,248,0.25)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                WIND VELOCITY · Click to expand →
              </div>
            </div>

            {/* Alert feed */}
            <div
              className="col-span-2 rounded-xl border flex flex-col overflow-hidden"
              style={{
                background:
                  'rgba(18,38,58,0.65)',
                backdropFilter: 'blur(10px)',
                borderColor:
                  'var(--border)',
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-2 border-b shrink-0"
                style={{
                  borderColor:
                    'var(--border)',
                }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={13}
                    style={{
                      color: '#EF4444',
                    }}
                  />

                  <span
                    className="text-sm font-medium"
                    style={{
                      color: 'var(--text)',
                    }}
                  >
                    Alert Feed
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotificationsOpen(
                      true,
                    )
                  }
                  className="px-1.5 py-0.5 rounded text-xs font-mono-data"
                  style={{
                    background:
                      'rgba(239,68,68,0.15)',
                    color: '#EF4444',
                  }}
                >
                  {activeAlertCount} ACTIVE
                </button>
              </div>

              {alerts.length === 0 ? (
                <div
                  className="flex-1 flex items-center justify-center flex-col gap-2"
                  style={{
                    color: 'var(--muted)',
                  }}
                >
                  <Shield
                    size={20}
                    className="opacity-30"
                  />

                  <span className="text-xs">
                    All alerts cleared
                  </span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex gap-2.5 px-3 py-2.5 group transition-colors"
                      style={{
                        borderBottom:
                          '1px solid var(--border)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'rgba(26,50,80,0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'transparent';
                      }}
                    >
                      <div
                        className="w-0.5 rounded-full shrink-0"
                        style={{
                          background:
                            riskColor[
                              alert.severity
                            ],
                          minHeight: 40,
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-medium leading-snug"
                          style={{
                            color:
                              'var(--text)',
                          }}
                        >
                          {alert.title}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <RiskBadge
                            level={
                              alert.severity
                            }
                          />

                          <span
                            className="text-xs font-mono-data"
                            style={{
                              color:
                                'var(--muted)',
                            }}
                          >
                            {alert.time}
                          </span>

                          <span
                            className="text-xs"
                            style={{
                              color:
                                'var(--muted)',
                            }}
                          >
                            · {alert.district}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          dismiss(alert.id)
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                        title="Dismiss alert"
                      >
                        <X
                          size={11}
                          style={{
                            color:
                              'var(--muted)',
                          }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Risk summary */}
          <div
            className="rounded-xl border p-4"
            style={{
              background:
                'rgba(18,38,58,0.60)',
              backdropFilter: 'blur(10px)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-mono-data font-medium tracking-widest"
                style={{
                  color: 'var(--muted)',
                }}
              >
                INFRASTRUCTURE RISK SUMMARY
              </span>

              <button
                type="button"
                onClick={() =>
                  onNavigate('risk')
                }
                className="text-xs font-medium"
                style={{
                  color: 'var(--accent)',
                }}
              >
                Full analysis →
              </button>
            </div>

            <div className="grid grid-cols-6 gap-4">
              {riskCategories.map((cat) => (
                <div
                  key={cat.label}
                  className={`stat-card ${glowClass[cat.risk]} p-2.5 rounded-lg border cursor-default`}
                  style={{
                    background:
                      'rgba(7,17,31,0.4)',
                    borderColor:
                      'var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: 'var(--text)',
                      }}
                    >
                      {cat.label}
                    </span>

                    <span
                      className="text-xs font-mono-data"
                      style={{
                        color:
                          riskColor[cat.risk],
                      }}
                    >
                      {cat.pct}%
                    </span>
                  </div>

                  <div
                    className="h-1.5 rounded-full mb-2"
                    style={{
                      background:
                        'rgba(30,58,85,0.8)',
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${cat.pct}%`,
                        background:
                          riskColor[cat.risk],
                      }}
                    />
                  </div>

                  <RiskBadge
                    level={cat.risk}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
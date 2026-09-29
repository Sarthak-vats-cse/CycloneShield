import { useState } from 'react';
import {
  Map,
  AlertTriangle,
  BarChart3,
  Settings,
  Bot,
  ChevronDown,
  GitBranch,
  Smartphone,
  Check,
  X,
} from 'lucide-react';
import { CycloneShieldLogo } from './CycloneShieldLogo';

export type Screen =
  | 'userflow'
  | 'dashboard'
  | 'map'
  | 'risk'
  | 'advisory'
  | 'mobile';

const sections = [
  {
    label: 'DESIGN PROCESS',
    items: [
      {
        id: 'userflow' as Screen,
        icon: GitBranch,
        label: '01 · User Flow',
      },
    ],
  },
  {
    label: 'APP SCREENS',
    items: [
      {
        id: 'dashboard' as Screen,
        icon: BarChart3,
        label: '02 · Dashboard',
      },
      {
        id: 'map' as Screen,
        icon: Map,
        label: '03 · Map View',
      },
      {
        id: 'risk' as Screen,
        icon: AlertTriangle,
        label: '04 · Risk Analysis',
      },
      {
        id: 'advisory' as Screen,
        icon: Bot,
        label: '05 · AI Advisory',
      },
    ],
  },
  {
    label: 'RESPONSIVE',
    items: [
      {
        id: 'mobile' as Screen,
        icon: Smartphone,
        label: '06 · Mobile',
      },
    ],
  },
];

const alertBadge: Partial<Record<Screen, number>> = {
  dashboard: 3,
};

const cyclones = [
  {
    id: 'BOB-2024-05',
    name: 'Cyclone Mocha',
    status: 'ACTIVE WARNING',
    category: 'Category 4',
  },
  {
    id: 'ARB-2024-02',
    name: 'Cyclone Biparjoy',
    status: 'MONITORED',
    category: 'Category 3',
  },
];

export function Sidebar({
  active,
  onNavigate,
}: {
  active: Screen;
  onNavigate: (s: Screen) => void;
}) {
  const [cycloneOpen, setCycloneOpen] = useState(false);
  const [selectedCyclone, setSelectedCyclone] = useState(cyclones[0]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectCyclone = (cyclone: (typeof cyclones)[number]) => {
    setSelectedCyclone(cyclone);
    setCycloneOpen(false);
  };

  return (
    <aside
      className="relative flex flex-col h-full w-56 shrink-0 border-r"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 py-3.5 border-b"
        style={{
          borderColor: 'var(--border)',
        }}
      >
        <CycloneShieldLogo size={36} glow />

        <div>
          <div
            className="font-display text-sm font-bold"
            style={{
              color: 'var(--text)',
            }}
          >
            CycloneShield
          </div>

          <div
            className="text-xs"
            style={{
              color: 'var(--muted)',
            }}
          >
            Disaster Ops · NDMA
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            <div
              className="px-3 py-1 text-xs font-mono-data font-medium tracking-widest mb-1"
              style={{
                color: 'var(--border)',
              }}
            >
              {section.label}
            </div>

            {section.items.map((item) => {
              const isActive = active === item.id;
              const badge = alertBadge[item.id];

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-all text-left mb-0.5"
                  style={{
                    background: isActive
                      ? 'rgba(56,189,248,0.1)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--accent)'
                      : 'var(--muted)',
                    borderLeft: isActive
                      ? '2px solid var(--accent)'
                      : '2px solid transparent',
                  }}
                >
                  <item.icon size={14} />

                  <span className="flex-1 text-xs font-medium">
                    {item.label}
                  </span>

                  {badge && (
                    <span
                      className="px-1.5 py-0.5 rounded text-xs font-mono-data"
                      style={{
                        background: 'var(--risk-critical)',
                        color: '#fff',
                        fontSize: 9,
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom controls */}
      <div
        className="relative px-2 pb-2 space-y-1.5 border-t pt-2"
        style={{
          borderColor: 'var(--border)',
        }}
      >
        {/* Cyclone selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCycloneOpen((prev) => !prev)}
            className="w-full px-3 py-2 rounded border text-xs flex items-center gap-2 cursor-pointer transition-colors"
            style={{
              borderColor: cycloneOpen
                ? 'var(--accent)'
                : 'var(--border)',
              background: 'var(--bg-card)',
            }}
          >
            <span>🌀</span>

            <div className="flex-1 min-w-0 text-left">
              <div
                className="font-mono-data"
                style={{
                  color: 'var(--text)',
                }}
              >
                {selectedCyclone.id}
              </div>

              <div
                style={{
                  color: 'var(--muted)',
                }}
              >
                {selectedCyclone.name}
              </div>
            </div>

            <ChevronDown
              size={12}
              style={{
                color: 'var(--muted)',
                transform: cycloneOpen
                  ? 'rotate(180deg)'
                  : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {/* Dropdown */}
          {cycloneOpen && (
            <div
              className="absolute left-0 right-0 bottom-full mb-1 rounded-lg border overflow-hidden z-50 shadow-xl"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="px-3 py-2 text-[9px] font-mono-data tracking-widest border-b"
                style={{
                  color: 'var(--muted)',
                  borderColor: 'var(--border)',
                }}
              >
                SELECT CYCLONE
              </div>

              {cyclones.map((cyclone) => {
                const selected =
                  selectedCyclone.id === cyclone.id;

                return (
                  <button
                    type="button"
                    key={cyclone.id}
                    onClick={() => selectCyclone(cyclone)}
                    className="w-full text-left px-3 py-2.5 flex items-center gap-2 transition-colors"
                    style={{
                      background: selected
                        ? 'rgba(56,189,248,0.08)'
                        : 'transparent',
                    }}
                    onMouseEnter={(event) => {
                      if (!selected) {
                        event.currentTarget.style.background =
                          'rgba(56,189,248,0.05)';
                      }
                    }}
                    onMouseLeave={(event) => {
                      if (!selected) {
                        event.currentTarget.style.background =
                          'transparent';
                      }
                    }}
                  >
                    <span className="text-sm">🌀</span>

                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs font-mono-data"
                        style={{
                          color: 'var(--text)',
                        }}
                      >
                        {cyclone.id}
                      </div>

                      <div
                        className="text-xs"
                        style={{
                          color: 'var(--muted)',
                        }}
                      >
                        {cyclone.name}
                      </div>
                    </div>

                    {selected && (
                      <Check
                        size={13}
                        style={{
                          color: 'var(--accent)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active warning */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              background: 'var(--risk-critical)',
            }}
          />

          <span
            className="text-xs font-mono-data tracking-widest"
            style={{
              color: 'var(--risk-critical)',
              fontSize: 9,
            }}
          >
            {selectedCyclone.status}
          </span>
        </div>

        {/* Settings */}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded transition-colors"
          style={{
            color: 'var(--muted)',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background =
              'rgba(56,189,248,0.06)';
            event.currentTarget.style.color =
              'var(--text)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background =
              'transparent';
            event.currentTarget.style.color =
              'var(--muted)';
          }}
        >
          <span className="flex items-center gap-2">
            <Settings size={12} />
            <span>Settings</span>
          </span>

          <span className="font-mono-data text-xs">
            v2.4.1
          </span>
        </button>
      </div>

      {/* Settings modal */}
      {settingsOpen && (
        <div
          className="absolute inset-0 z-[100] flex items-end justify-center p-2"
          style={{
            background: 'rgba(7,17,31,0.72)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="w-full rounded-xl border p-4 shadow-2xl"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings
                  size={15}
                  style={{
                    color: 'var(--accent)',
                  }}
                />

                <span
                  className="text-sm font-medium"
                  style={{
                    color: 'var(--text)',
                  }}
                >
                  Settings
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
              >
                <X
                  size={14}
                  style={{
                    color: 'var(--muted)',
                  }}
                />
              </button>
            </div>

            <div className="space-y-2">
              <div
                className="flex items-center justify-between px-3 py-2 rounded"
                style={{
                  background: 'var(--bg-card)',
                }}
              >
                <span
                  className="text-xs"
                  style={{
                    color: 'var(--muted)',
                  }}
                >
                  System status
                </span>

                <span
                  className="text-[10px] font-mono-data"
                  style={{
                    color: '#22C55E',
                  }}
                >
                  ONLINE
                </span>
              </div>

              <div
                className="flex items-center justify-between px-3 py-2 rounded"
                style={{
                  background: 'var(--bg-card)',
                }}
              >
                <span
                  className="text-xs"
                  style={{
                    color: 'var(--muted)',
                  }}
                >
                  Version
                </span>

                <span
                  className="text-xs font-mono-data"
                  style={{
                    color: 'var(--text)',
                  }}
                >
                  v2.4.1
                </span>
              </div>

              <div
                className="flex items-center justify-between px-3 py-2 rounded"
                style={{
                  background: 'var(--bg-card)',
                }}
              >
                <span
                  className="text-xs"
                  style={{
                    color: 'var(--muted)',
                  }}
                >
                  Current cyclone
                </span>

                <span
                  className="text-xs font-mono-data"
                  style={{
                    color: 'var(--text)',
                  }}
                >
                  {selectedCyclone.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
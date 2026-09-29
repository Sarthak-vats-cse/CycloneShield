import React, { useState, useMemo, useEffect } from 'react';
import satImg from '../assets/ref2.png';
import stdImg from '../assets/ref3.png';

export type MapMode = 'standard' | 'satellite' | 'wind' | 'gee';

export interface LeafletMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  locate: () => void;
}

/* ── Coordinate transform ────────────────────────────────────────── */
const W = 1000;
const H = 800;
const LNG0 = 68;
const DLNG = 28;
const LAT0 = 30;
const DLAT = 23;

function geo(lat: number, lng: number): [number, number] {
  return [
    ((lng - LNG0) / DLNG) * W,
    ((LAT0 - lat) / DLAT) * H,
  ];
}

/* Return SVG x,y,width,height for a background image given its
   approximate geographic bounding box. */
function imgRect(
  latMin: number,
  latMax: number,
  lngMin: number,
  lngMax: number,
) {
  const x = ((lngMin - LNG0) / DLNG) * W;
  const y = ((LAT0 - latMax) / DLAT) * H;
  const width = ((lngMax - lngMin) / DLNG) * W;
  const height = ((latMax - latMin) / DLAT) * H;

  return { x, y, width, height };
}

/* ── Cyclone data ────────────────────────────────────────────────── */
const EYE = geo(19.8135, 85.8312);
const FALL = geo(20.32, 86.67);

const TRACK = [
  geo(19.8135, 85.8312),
  geo(20.15, 86.10),
  geo(20.5, 86.4),
  geo(20.32, 86.67),
];

/*
 * Background image geographic extents (estimated from visual inspection):
 * ref2.png — satellite-style image of India and surroundings
 * ref3.png — standard political/topographic map of South Asia
 */
const SAT_RECT = imgRect(1, 44, 56, 102);
const STD_RECT = imgRect(2, 43, 60, 118);

/* ── India silhouette for wind mode ───────────────────────────────── */
const INDIA_PATH = `
  M 729,261 L 750,261 L 804,278 L 839,261 L 839,226
  L 893,174 L 964,87 L 1000,35
  L 1000,0 L 0,0 L 0,100
  L 25,243 L 39,261 L 79,271 L 168,296 L 175,330
  L 172,374 L 175,383 L 196,470 L 211,504
  L 246,595 L 282,654 L 296,696 L 321,748 L 343,761
  L 371,726 L 425,661 L 425,623 L 439,580
  L 433,536 L 469,479 L 507,452 L 546,428
  L 578,407 L 599,372 L 611,355 L 667,337
  L 682,313 L 696,296 L 718,278 L 729,261 Z
`;

const SRI_LANKA = `
  M 429,706 L 465,706 L 471,744 L 490,800
  L 446,800 L 425,800 L 425,774 L 429,753 L 422,730 Z
`;

/* ── Wind vectors: golden-ratio spiral, fully deterministic ───────── */
const GOLDEN_ANGLE = 2.39996;

function buildWindVectors(ex: number, ey: number, count = 180) {
  return Array.from({ length: count }, (_, i) => {
    const angle = i * GOLDEN_ANGLE;
    const t = i / count;

    /* Square-root distribution → denser near the eye */
    const r = 16 + 385 * Math.sqrt(t);

    const px = ex + Math.cos(angle) * r;
    const py = ey + Math.sin(angle) * r;

    /* Blend: radial-outward near eye → tangential CCW far from eye */
    const rf = Math.max(0, 1 - r / 185);
    const tf = 1 - rf;

    const dx = Math.cos(angle) * rf + -Math.sin(angle) * tf;
    const dy = Math.sin(angle) * rf + Math.cos(angle) * tf;
    const mag = Math.hypot(dx, dy) || 1;

    /* Length peaks at mid-range */
    const len = 9 + 13 * Math.sin(t * Math.PI);

    /* Color ramp: white → yellow → orange → lime → green */
    const rn = r / 400;

    const color =
      rn < 0.1
        ? '#ffffff'
        : rn < 0.2
          ? '#ffff66'
          : rn < 0.35
            ? '#ffdd00'
            : rn < 0.52
              ? '#ff8800'
              : rn < 0.68
                ? '#aaff00'
                : rn < 0.84
                  ? '#55ee22'
                  : '#22aa22';

    return {
      x1: px,
      y1: py,
      x2: px + (dx / mag) * len,
      y2: py + (dy / mag) * len,
      color,
      opacity: Math.max(0.18, 0.95 - rn * 0.7),
    };
  });
}

/* ── Static labels for wind mode ─────────────────────────────────── */
const WIND_LABELS = [
  { text: 'INDIA', lat: 23.5, lng: 78.5 },
  { text: 'MYANMAR', lat: 24, lng: 94 },
  { text: 'BAY OF BENGAL', lat: 13.5, lng: 89 },
];

/* ── City overlay for satellite/standard modes ───────────────────── */
const CITIES = [
  { name: 'Mumbai', lat: 19.1, lng: 72.9, hi: false },
  { name: 'New Delhi', lat: 28.6, lng: 77.2, hi: false },
  { name: 'Kolkata', lat: 22.6, lng: 88.4, hi: false },
  { name: 'Chennai', lat: 13.1, lng: 80.3, hi: false },
  { name: 'Bengaluru', lat: 12.9, lng: 77.6, hi: false },
  { name: 'Hyderabad', lat: 17.4, lng: 78.5, hi: false },
  { name: 'Paradeep', lat: 20.32, lng: 86.67, hi: true },
];

/* ── Risk map types and helpers ──────────────────────────────────── */
type RiskFeature = {
  properties?: {
    risk_level?: string;
    risk_score?: number;
  };
  geometry?: {
    type?: string;
    coordinates?: any;
  };
};

function ringToSvgPath(ring: number[][]): string {
  if (!Array.isArray(ring) || ring.length < 3) {
    return '';
  }

  return (
    ring
      .map((coordinate, index) => {
        const [x, y] = geo(coordinate[1], coordinate[0]);
        return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ') + ' Z'
  );
}

function geometryToSvgPath(feature: RiskFeature): string {
  const geometry = feature.geometry;

  if (!geometry?.coordinates) {
    return '';
  }

  if (geometry.type === 'Polygon') {
    return (geometry.coordinates as number[][][])
      .map(ringToSvgPath)
      .join(' ');
  }

  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as number[][][][])
      .map((polygon) => polygon.map(ringToSvgPath).join(' '))
      .join(' ');
  }

  return '';
}

/* ── Component props ─────────────────────────────────────────────── */
interface Props {
  mode: MapMode;
  showTrack?: boolean;
  showSurge?: boolean;
}

export const LeafletMap = React.forwardRef<LeafletMapHandle, Props>(
  function LeafletMap(
    { mode, showTrack = true, showSurge = true },
    ref,
  ) {
    const [zoom, setZoom] = useState(1);
    const [cx, setCx] = useState(EYE[0]);
    const [cy, setCy] = useState(EYE[1]);
    const [riskFeatures, setRiskFeatures] = useState<RiskFeature[]>([]);

    /* ── Fetch risk map from backend ─────────────────────────────── */
    useEffect(() => {
      const controller = new AbortController();

      fetch('/api/v1/data/risk-map', {
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Risk map request failed: ${response.status}`,
            );
          }

          return response.json();
        })
        .then((data) => {
          setRiskFeatures(
            Array.isArray(data?.features) ? data.features : [],
          );
        })
        .catch((error) => {
          if ((error as Error).name !== 'AbortError') {
            console.error(
              'Could not load backend risk map:',
              error,
            );
          }
        });

      return () => controller.abort();
    }, []);

    /* ── Expose map controls ─────────────────────────────────────── */
    React.useImperativeHandle(ref, () => ({
      zoomIn: () => setZoom((z) => Math.min(z * 1.4, 8)),
      zoomOut: () => setZoom((z) => Math.max(z / 1.4, 0.6)),
      locate: () => {
        setCx(EYE[0]);
        setCy(EYE[1]);
        setZoom(1.5);
      },
    }));

    /* ── Wind vectors ────────────────────────────────────────────── */
    const windVectors = useMemo(
      () => buildWindVectors(EYE[0], EYE[1]),
      [],
    );

    /* ── Group risk paths by risk level ──────────────────────────── */
    const riskPaths = useMemo(() => {
      const grouped: Record<string, string[]> = {
        LOW: [],
        MEDIUM: [],
        HIGH: [],
        CRITICAL: [],
      };

      for (const feature of riskFeatures) {
        const level = String(
          feature.properties?.risk_level || 'LOW',
        ).toUpperCase();

        const key = level in grouped ? level : 'LOW';
        const path = geometryToSvgPath(feature);

        if (path) {
          grouped[key].push(path);
        }
      }

      return grouped;
    }, [riskFeatures]);

    /* ── Viewbox and map paths ───────────────────────────────────── */
    const vw = W / zoom;
    const vh = H / zoom;
    const viewBox = `${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`;

    const trackD = TRACK.map(([x, y], i) =>
      `${i ? 'L' : 'M'} ${x},${y}`,
    ).join(' ');

    const isSat = mode === 'satellite' || mode === 'gee';

    return (
      <svg
        viewBox={viewBox}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <style>{`
            @keyframes svgPe {
              0%, 100% {
                opacity: .14;
                transform: scale(1);
              }
              50% {
                opacity: .44;
                transform: scale(1.36);
              }
            }

            @keyframes svgPe2 {
              0%, 100% {
                opacity: .07;
                transform: scale(1);
              }
              50% {
                opacity: .28;
                transform: scale(1.58);
              }
            }

            @keyframes svgTf {
              to {
                stroke-dashoffset: -20;
              }
            }

            @keyframes svgSp {
              0%, 100% {
                opacity: .32;
              }
              50% {
                opacity: .72;
              }
            }

            @keyframes wvFlow {
              0% {
                stroke-dashoffset: 22;
              }
              100% {
                stroke-dashoffset: 0;
              }
            }
          `}</style>

          {/* Glow filters */}
          <filter
            id="gr"
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter
            id="gc"
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Wind mode: radial heatmap gradient from eye */}
          <radialGradient
            id="cheat"
            cx={EYE[0]}
            cy={EYE[1]}
            r="420"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor="#ff1100"
              stopOpacity="0.92"
            />
            <stop
              offset="6%"
              stopColor="#ff4400"
              stopOpacity="0.80"
            />
            <stop
              offset="16%"
              stopColor="#ff7700"
              stopOpacity="0.64"
            />
            <stop
              offset="30%"
              stopColor="#ffbb00"
              stopOpacity="0.46"
            />
            <stop
              offset="48%"
              stopColor="#99ff00"
              stopOpacity="0.24"
            />
            <stop
              offset="70%"
              stopColor="#00ee44"
              stopOpacity="0.09"
            />
            <stop
              offset="100%"
              stopColor="#000000"
              stopOpacity="0"
            />
          </radialGradient>
        </defs>

        {/* ── SATELLITE / GEE ─────────────────────────────────────── */}
        {isSat && (
          <>
            <rect
              x={-W}
              y={-H}
              width={W * 3}
              height={H * 3}
              fill="#030c18"
            />

            <image
              href={satImg}
              x={SAT_RECT.x}
              y={SAT_RECT.y}
              width={SAT_RECT.width}
              height={SAT_RECT.height}
              preserveAspectRatio="none"
            />

            {/* Subtle dark-blue ocean tint outside the image */}
            <rect
              x={-W}
              y={-H}
              width={W * 3}
              height={H * 3}
              fill="none"
              stroke="none"
            />
          </>
        )}

        {/* ── STANDARD MAP ────────────────────────────────────────── */}
        {mode === 'standard' && (
          <>
            <rect
              x={-W}
              y={-H}
              width={W * 3}
              height={H * 3}
              fill="#a8d5f5"
            />

            <image
              href={stdImg}
              x={STD_RECT.x}
              y={STD_RECT.y}
              width={STD_RECT.width}
              height={STD_RECT.height}
              preserveAspectRatio="none"
            />
          </>
        )}

        {/* ── WIND VELOCITY ───────────────────────────────────────── */}
        {mode === 'wind' && (
          <>
            {/* Deep-space dark ocean */}
            <rect
              x={-W}
              y={-H}
              width={W * 3}
              height={H * 3}
              fill="#06070e"
            />

            {/* Radial heatmap glow centered on cyclone eye */}
            <circle
              cx={EYE[0]}
              cy={EYE[1]}
              r={440}
              fill="url(#cheat)"
            />

            {/* Land silhouette */}
            <path
              d={INDIA_PATH}
              fill="#131b30"
              stroke="#1c2a48"
              strokeWidth="0.8"
            />

            <path
              d={SRI_LANKA}
              fill="#131b30"
              stroke="#1c2a48"
              strokeWidth="0.6"
            />

            {/* Wind vector streaks */}
            {windVectors.map((v, i) => {
              const len = Math.hypot(
                v.x2 - v.x1,
                v.y2 - v.y1,
              );

              const dash = len * 0.55;
              const gap = len - dash;
              const dur = 0.55 + (i % 7) * 0.08;
              const delay = -(i % 13) * (dur / 13);

              return (
                <line
                  key={i}
                  x1={v.x1}
                  y1={v.y1}
                  x2={v.x2}
                  y2={v.y2}
                  stroke={v.color}
                  strokeWidth="1.6"
                  strokeOpacity={v.opacity}
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${gap}`}
                  style={{
                    animation: `wvFlow ${dur}s linear ${delay}s infinite`,
                  }}
                />
              );
            })}

            {/* Region labels */}
            {WIND_LABELS.map(({ text, lat, lng }) => {
              const [x, y] = geo(lat, lng);

              return (
                <text
                  key={text}
                  x={x}
                  y={y}
                  fontSize="10"
                  fill="rgba(255,255,255,0.26)"
                  fontFamily="Inter,sans-serif"
                  fontWeight="700"
                  letterSpacing="3"
                  textAnchor="middle"
                >
                  {text}
                </text>
              );
            })}
          </>
        )}

        {/* ── BACKEND RISK-MAP OVERLAY ────────────────────────────── */}
        <g
          data-layer="backend-risk-map"
          pointerEvents="none"
        >
          {(
            [
              ['LOW', '#22c55e', 0.1],
              ['MEDIUM', '#eab308', 0.17],
              ['HIGH', '#f97316', 0.23],
              ['CRITICAL', '#ef4444', 0.28],
            ] as const
          ).map(([level, color, opacity]) =>
            riskPaths[level].length > 0 ? (
              <path
                key={level}
                d={riskPaths[level].join(' ')}
                fill={color}
                fillOpacity={opacity}
                stroke={color}
                strokeOpacity={0.18}
                strokeWidth={0.35}
                fillRule="evenodd"
              />
            ) : null,
          )}
        </g>

        {/* ── CYCLONE OVERLAYS ────────────────────────────────────── */}

        {/* Surge zone ellipses */}
        {showSurge && (
          <>
            <ellipse
              cx={FALL[0]}
              cy={FALL[1]}
              rx={50}
              ry={44}
              fill="rgba(250,204,21,.06)"
              stroke="#facc15"
              strokeWidth="1.5"
              strokeDasharray="7 5"
              style={{
                animation: 'svgSp 3s ease-in-out infinite',
              }}
            />

            <ellipse
              cx={FALL[0]}
              cy={FALL[1]}
              rx={29}
              ry={25}
              fill="rgba(239,68,68,.05)"
              stroke="rgba(239,68,68,.45)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity=".6"
            />
          </>
        )}

        {/* Cyclone track */}
        {showTrack && (
          <>
            <path
              d={trackD}
              fill="none"
              stroke="rgba(0,242,255,.18)"
              strokeWidth="9"
              strokeLinecap="round"
            />

            <path
              d={trackD}
              fill="none"
              stroke="#00f2ff"
              strokeWidth="2.5"
              strokeDasharray="10 6"
              strokeLinecap="round"
              filter="url(#gc)"
              style={{
                animation: 'svgTf 1s linear infinite',
              }}
            />

            {TRACK.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={3.5}
                fill="#00f2ff"
                stroke="rgba(0,242,255,.3)"
                strokeWidth="5"
              />
            ))}
          </>
        )}

        {/* Landfall marker */}
        {showTrack && (
          <g>
            <circle
              cx={FALL[0]}
              cy={FALL[1]}
              r={14}
              fill="rgba(249,115,22,.12)"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />

            <circle
              cx={FALL[0]}
              cy={FALL[1]}
              r={5}
              fill="#f97316"
            />

            <rect
              x={FALL[0] + 18}
              y={FALL[1] - 19}
              width={93}
              height={36}
              rx={4}
              fill="rgba(15,23,42,.92)"
              stroke="rgba(249,115,22,.35)"
              strokeWidth="1"
            />

            <text
              x={FALL[0] + 24}
              y={FALL[1] - 5}
              fontSize="8"
              fill="#f97316"
              fontFamily="JetBrains Mono,monospace"
              fontWeight="700"
            >
              LANDFALL
            </text>

            <text
              x={FALL[0] + 24}
              y={FALL[1] + 7}
              fontSize="7"
              fill="#94a3b8"
              fontFamily="JetBrains Mono,monospace"
            >
              Paradeep, Odisha
            </text>

            <text
              x={FALL[0] + 24}
              y={FALL[1] + 17}
              fontSize="6.5"
              fill="#64748b"
              fontFamily="JetBrains Mono,monospace"
            >
              20.32°N · 86.67°E
            </text>
          </g>
        )}

        {/* Cyclone eye */}
        {showTrack && (
          <g>
            <circle
              cx={EYE[0]}
              cy={EYE[1]}
              r={68}
              fill="rgba(239,68,68,.07)"
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                animation: 'svgPe2 3.5s ease-in-out infinite',
              }}
            />

            <circle
              cx={EYE[0]}
              cy={EYE[1]}
              r={44}
              fill="rgba(239,68,68,.13)"
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                animation: 'svgPe 2.5s ease-in-out infinite',
              }}
            />

            <circle
              cx={EYE[0]}
              cy={EYE[1]}
              r={21}
              fill="rgba(239,68,68,.22)"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="6 3"
            />

            <circle
              cx={EYE[0]}
              cy={EYE[1]}
              r={7.5}
              fill="#ef4444"
              filter="url(#gr)"
            />

            <circle
              cx={EYE[0]}
              cy={EYE[1]}
              r={3.5}
              fill="#fff"
              opacity=".96"
            />

            <rect
              x={EYE[0] + 28}
              y={EYE[1] - 26}
              width={100}
              height={48}
              rx={5}
              fill="rgba(15,23,42,.93)"
              stroke="rgba(239,68,68,.42)"
              strokeWidth="1"
            />

            <text
              x={EYE[0] + 35}
              y={EYE[1] - 11}
              fontSize="9"
              fill="#ef4444"
              fontFamily="JetBrains Mono,monospace"
              fontWeight="700"
            >
              CYCLONE ALPHA
            </text>

            <text
              x={EYE[0] + 35}
              y={EYE[1] + 3}
              fontSize="7.5"
              fill="#94a3b8"
              fontFamily="JetBrains Mono,monospace"
            >
              CAT 4 · 215 km/h
            </text>

            <text
              x={EYE[0] + 35}
              y={EYE[1] + 16}
              fontSize="7"
              fill="#64748b"
              fontFamily="JetBrains Mono,monospace"
            >
              19.8°N · 940 hPa
            </text>
          </g>
        )}

        {/* City markers — satellite and standard modes */}
        {mode !== 'wind' &&
          CITIES.map(({ name, lat, lng, hi }) => {
            const [x, y] = geo(lat, lng);

            return (
              <g key={name}>
                <circle
                  cx={x}
                  cy={y}
                  r={hi ? 4 : 3}
                  fill={
                    hi
                      ? '#f97316'
                      : isSat
                        ? '#00e5ff'
                        : '#1e3a8a'
                  }
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={hi ? 0 : 0.8}
                />

                <text
                  x={x + 7}
                  y={y + 4}
                  fontSize={hi ? 9 : 8}
                  fill={
                    hi
                      ? '#f97316'
                      : isSat
                        ? '#f0f9ff'
                        : '#1e1e3f'
                  }
                  fontFamily="Inter,sans-serif"
                  fontWeight={hi ? '700' : '500'}
                  style={
                    isSat
                      ? undefined
                      : { filter: 'drop-shadow(0 0 2px white)' }
                  }
                >
                  {name}
                </text>
              </g>
            );
          })}
      </svg>
    );
  },
);
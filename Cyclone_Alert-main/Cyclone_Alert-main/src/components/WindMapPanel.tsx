import React, { useState } from 'react';
import { Map, Globe, Wind } from 'lucide-react';

type MapLayer = 'base' | 'satellite' | 'wind';

/* ── Wind particle paths ─────────────────────────────────────────────
   Each entry: [svgPath, strokeColor, opacity, dashLen, gap, duration(s)]
   Cyclone eye approx at svg coordinate (628, 298).
──────────────────────────────────────────────────────────────────── */
type WP = [string, string, number, number, number, number];

const WIND: WP[] = [
  // ── Arabian Sea / Indian Ocean — green (low wind) ──────────────
  ['M 25,422 C 98,392 198,342 288,282 C 348,237 390,200 412,170', '#4ade80', .68, 20, 14, 3.4],
  ['M 55,458 C 130,428 230,376 322,310 C 378,266 420,230 444,200', '#22c55e', .62, 18, 12, 3.8],
  ['M 18,372 C 85,347 175,300 265,240 C 326,200 366,170 390,146', '#4ade80', .70, 22, 15, 3.1],
  ['M 48,338 C 116,314 205,270 295,214 C 352,178 392,150 414,130', '#86efac', .52, 16, 11, 4.2],
  ['M 78,466 C 154,446 254,408 348,350 C 406,310 446,276 468,245', '#22c55e', .65, 19, 13, 3.2],
  ['M 8,295 C 65,272 145,238 225,198 C 280,170 325,150 355,134', '#4ade80', .58, 15, 10, 4.5],
  ['M 98,442 C 170,416 268,376 364,316 C 420,278 456,248 476,222', '#86efac', .55, 17, 12, 3.6],
  ['M 128,468 C 200,446 292,408 384,350 C 437,312 470,282 490,256', '#22c55e', .60, 16, 11, 3.9],
  ['M 38,254 C 95,232 170,202 249,172 C 299,152 344,134 372,120', '#4ade80', .52, 14, 9,  4.8],
  ['M 165,468 C 235,446 325,408 412,352 C 460,316 490,286 506,262', '#84cc16', .58, 17, 12, 3.5],
  ['M 195,452 C 262,430 348,392 428,342 C 470,312 498,286 514,262', '#84cc16', .56, 16, 11, 3.7],
  ['M 238,468 C 298,447 378,412 448,362 C 486,332 508,307 518,282', '#a3e635', .53, 15, 10, 4.0],
  ['M 58,422 C 128,410 212,390 292,362 C 344,340 378,320 396,297', '#a3e635', .48, 16, 11, 4.3],
  ['M 0,352 C 54,340 128,320 202,297 C 253,280 292,264 316,250', '#86efac', .44, 13, 9,  4.9],
  // ── Bay of Bengal outer ring — yellow→orange (moderate-high) ──
  ['M 758,196 C 730,215 703,237 680,258 C 661,274 646,287 636,296', '#facc15', .74, 20, 13, 2.7],
  ['M 784,272 C 754,272 724,274 700,282 C 678,289 658,294 642,297', '#fbbf24', .80, 22, 14, 2.4],
  ['M 774,346 C 750,335 726,324 704,314 C 684,307 664,302 646,298', '#f59e0b', .76, 20, 13, 2.6],
  ['M 738,416 C 722,397 706,375 692,354 C 680,336 666,320 650,304', '#f97316', .70, 18, 12, 2.9],
  ['M 678,447 C 669,426 658,405 649,382 C 641,362 636,341 633,307', '#f97316', .68, 17, 11, 3.1],
  ['M 598,438 C 608,418 619,396 626,374 C 632,354 634,332 633,302', '#fb923c', .66, 16, 10, 3.3],
  ['M 538,413 C 556,394 572,372 585,351 C 595,333 624,317 632,300', '#f97316', .63, 17, 11, 3.0],
  ['M 528,358 C 546,346 562,332 576,319 C 588,308 616,302 631,298', '#fbbf24', .68, 18, 12, 2.8],
  ['M 563,263 C 573,273 582,283 593,293 C 604,303 618,308 632,298', '#facc15', .72, 19, 13, 2.7],
  ['M 586,213 C 592,226 598,240 606,255 C 614,268 624,282 633,297', '#fbbf24', .74, 20, 13, 2.5],
  ['M 626,166 C 626,182 627,198 629,217 C 630,234 632,259 633,294', '#f59e0b', .70, 17, 11, 2.9],
  ['M 663,177 C 657,193 650,211 644,230 C 639,247 636,267 635,295', '#facc15', .66, 16, 10, 3.2],
  ['M 698,191 C 689,207 680,224 671,243 C 663,260 654,278 644,296', '#f97316', .68, 18, 12, 2.8],
  ['M 720,230 C 708,245 696,260 684,276 C 673,289 660,296 645,297', '#f59e0b', .65, 16, 11, 3.0],
  ['M 748,310 C 730,306 712,304 696,302 C 680,300 664,298 648,298', '#fbbf24', .72, 19, 13, 2.6],
  // ── Cyclone core — orange→red (high/critical) ─────────────────
  ['M 710,297 C 695,293 678,291 663,293 C 652,295 644,297 637,298', '#f97316', .86, 16, 8,  2.1],
  ['M 707,322 C 692,315 677,309 663,306 C 652,304 645,301 638,299', '#ef4444', .83, 14, 7,  1.9],
  ['M 692,344 C 680,334 667,324 656,317 C 648,312 642,307 638,300', '#ef4444', .80, 13, 7,  2.0],
  ['M 672,360 C 662,347 653,334 647,322 C 643,314 640,307 637,300', '#dc2626', .78, 12, 6,  1.8],
  ['M 650,370 C 644,356 640,341 638,328 C 637,319 637,310 636,301', '#ef4444', .75, 12, 6,  1.9],
  ['M 624,362 C 627,348 631,334 634,321 C 636,313 637,307 637,301', '#f97316', .78, 13, 7,  2.0],
  ['M 612,340 C 618,328 623,318 628,309 C 631,304 634,301 637,300', '#fb923c', .80, 12, 6,  2.1],
  ['M 614,313 C 620,309 626,306 631,303 C 634,302 636,301 637,300', '#fbbf24', .83, 10, 5,  1.9],
  ['M 620,285 C 625,289 629,293 633,297 C 635,298 636,299 637,300', '#f97316', .80, 10, 5,  1.7],
  ['M 636,270 C 636,277 636,283 636,290 C 636,295 636,298 636,300', '#ef4444', .86, 11, 6,  1.6],
  ['M 650,278 C 646,284 642,289 639,294 C 638,297 637,299 637,300', '#ef4444', .82, 10, 5,  1.8],
  ['M 658,305 C 651,303 645,301 640,300 C 638,300 637,300 637,300', '#dc2626', .90, 8,  4,  1.5],
  // ── Extra density passes ────────────────────────────────────────
  ['M 0,458 C 58,445 138,422 212,392 C 265,370 302,350 327,330', '#22c55e', .43, 14, 9,  5.2],
  ['M 278,353 C 308,342 338,330 366,317 C 387,306 407,294 421,280', '#84cc16', .48, 15, 10, 4.1],
  ['M 378,293 C 396,283 413,270 427,258 C 440,246 449,234 455,220', '#a3e635', .44, 12, 8,  4.7],
  ['M 440,242 C 452,232 463,220 472,208 C 479,198 484,188 486,176', '#84cc16', .40, 11, 7,  5.0],
];

/* ── Glassmorphism style ─────────────────────────────────────────── */
const glass: React.CSSProperties = {
  background: 'rgba(15,23,42,0.78)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(71,85,105,0.50)',
  borderRadius: 12,
};

/* ── Segmented layer toggle ──────────────────────────────────────── */
const LAYER_OPTS: { id: MapLayer; label: string; Icon: React.ElementType }[] = [
  { id: 'base',      label: 'Base Map',     Icon: Map   },
  { id: 'satellite', label: 'Satellite',    Icon: Globe },
  { id: 'wind',      label: 'Wind Velocity', Icon: Wind  },
];

function LayerToggle({ value, onChange }: { value: MapLayer; onChange: (l: MapLayer) => void }) {
  return (
    <div style={{ ...glass, display: 'flex', padding: 4, gap: 3, userSelect: 'none' }}>
      {LAYER_OPTS.map(opt => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              border: active ? '1px solid rgba(56,189,248,0.55)' : '1px solid transparent',
              background: active ? 'rgba(56,189,248,0.13)' : 'transparent',
              boxShadow: active ? '0 0 12px rgba(56,189,248,0.20)' : 'none',
              color: active ? '#38bdf8' : '#64748b',
              fontSize: 11, fontFamily: 'Inter,sans-serif', fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
          >
            <opt.Icon size={12} strokeWidth={active ? 2 : 1.5} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Wind speed legend ───────────────────────────────────────────── */
const LEGEND_STOPS = [
  { label: 'Low',      color: '#22c55e', speed: '0–20 km/h' },
  { label: 'Moderate', color: '#a3e635', speed: '21–50 km/h' },
  { label: 'High',     color: '#facc15', speed: '51–100 km/h' },
  { label: 'Severe',   color: '#f97316', speed: '101–160 km/h' },
  { label: 'Extreme',  color: '#ef4444', speed: '160+ km/h' },
];

function WindLegend() {
  return (
    <div style={{ ...glass, padding: '12px 14px', minWidth: 190 }}>
      {/* Title */}
      <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono,monospace', letterSpacing: '0.12em',
        color: '#475569', textTransform: 'uppercase', marginBottom: 10 }}>
        Wind Speed (km/h)
      </div>

      {/* Gradient bar */}
      <div style={{ position: 'relative', marginBottom: 6 }}>
        <div style={{
          height: 10, borderRadius: 5,
          background: 'linear-gradient(to right, #22c55e, #a3e635, #facc15, #f97316, #ef4444)',
          boxShadow: '0 0 8px rgba(239,68,68,0.3)',
        }} />
        {/* Tick marks */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {['0', '50', '100', '160', '215+'].map(v => (
            <span key={v} style={{ fontSize: 8, fontFamily: 'JetBrains Mono,monospace', color: '#64748b' }}>{v}</span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(71,85,105,0.35)', margin: '8px 0' }} />

      {/* Category rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {LEGEND_STOPS.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              background: s.color,
              boxShadow: `0 0 5px ${s.color}88`,
            }} />
            <span style={{ flex: 1, fontSize: 10, fontFamily: 'Inter,sans-serif', color: '#94a3b8' }}>
              {s.label}
            </span>
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono,monospace', color: '#64748b' }}>
              {s.speed}
            </span>
          </div>
        ))}
      </div>

      {/* Source tag */}
      <div style={{ marginTop: 8, fontSize: 8, fontFamily: 'JetBrains Mono,monospace',
        color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Source: IMD · 2026-09-24 00:00 UTC
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export function WindMapPanel({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const [layer, setLayer] = useState<MapLayer>('wind');
  const showWind = layer === 'wind';

  /* satellite shifts ocean tones greener */
  const oceanFill = layer === 'satellite'
    ? 'radial-gradient(ellipse at 40% 60%, #1a3a28 0%, #0e2535 45%, #07111f 100%)'
    : 'radial-gradient(ellipse at 35% 70%, #1e2a4a 0%, #111e38 40%, #07111f 100%)';

  return (
    <div
      className={className}
      style={{
        position: 'relative', borderRadius: 20, overflow: 'hidden',
        border: '1px solid rgba(30,58,85,0.6)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
        background: '#07111f',
        ...style,
      }}
    >
      {/* ── SVG map canvas ──────────────────────────────────────── */}
      <svg
        viewBox="0 0 800 480"
        style={{ display: 'block', width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="wm-ocean" cx="35%" cy="70%" r="70%">
            <stop offset="0%"  stopColor={layer === 'satellite' ? '#1a3a28' : '#1e2a4a'} />
            <stop offset="45%" stopColor={layer === 'satellite' ? '#0e2535' : '#111e38'} />
            <stop offset="100%" stopColor="#07111f" />
          </radialGradient>

          {/* Wind heatmap blobs */}
          <radialGradient id="wm-arabian" cx="30%" cy="65%" r="45%">
            <stop offset="0%"  stopColor="#22c55e" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#4ade80" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wm-bob-outer" cx="78%" cy="62%" r="35%">
            <stop offset="0%"  stopColor="#f97316" stopOpacity="0.65" />
            <stop offset="55%" stopColor="#facc15" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wm-cyclone" cx="79%" cy="62%" r="18%">
            <stop offset="0%"  stopColor="#7f1d1d" stopOpacity="0.80" />
            <stop offset="40%" stopColor="#dc2626" stopOpacity="0.60" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wm-south" cx="50%" cy="95%" r="40%">
            <stop offset="0%"  stopColor="#a3e635" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wm-north" cx="55%" cy="15%" r="45%">
            <stop offset="0%"  stopColor="#818cf8" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>

          <clipPath id="wm-clip"><rect width="800" height="480" /></clipPath>
        </defs>

        {/* Ocean base */}
        <rect width="800" height="480" fill="url(#wm-ocean)" />

        {/* Northern purple-indigo cold tones */}
        <rect width="800" height="480" fill="url(#wm-north)" />

        {/* ── Wind heatmap overlays (wind layer only) ─────────── */}
        {showWind && (
          <>
            <rect width="800" height="480" fill="url(#wm-arabian)" />
            <rect width="800" height="480" fill="url(#wm-south)" />
            <rect width="800" height="480" fill="url(#wm-bob-outer)" />
            <rect width="800" height="480" fill="url(#wm-cyclone)" />
          </>
        )}

        {/* ── Land masses ───────────────────────────────────────── */}
        {/* India */}
        <path
          d="M 330,95 L 358,88 L 392,82 L 428,86 L 464,98 L 494,115
             L 512,140 L 518,168 L 514,198 L 506,228 L 496,258
             L 488,288 L 478,318 L 466,348 L 450,374 L 438,400
             L 428,420 L 416,434 L 406,428 L 396,415 L 382,396
             L 362,372 L 347,342 L 334,310 L 323,278
             L 318,250 L 311,268 L 296,284 L 274,282
             L 260,266 L 268,246 L 286,230 L 310,220
             L 322,202 L 326,174 L 324,148 L 328,120 Z"
          fill={layer === 'satellite' ? '#1a3d20' : '#162238'}
          stroke="#1e3a55" strokeWidth="0.8"
        />
        {/* Sri Lanka */}
        <path
          d="M 428,420 L 442,428 L 452,440 L 454,458 L 447,472 L 435,475 L 426,465 L 424,450 Z"
          fill={layer === 'satellite' ? '#1a3d20' : '#162238'}
          stroke="#1e3a55" strokeWidth="0.6"
        />
        {/* Bangladesh */}
        <path
          d="M 496,115 L 516,112 L 530,120 L 534,138 L 527,155 L 511,158 L 499,148 L 497,130 Z"
          fill={layer === 'satellite' ? '#1a3d20' : '#162238'}
          stroke="#1e3a55" strokeWidth="0.6"
        />
        {/* Pakistan */}
        <path
          d="M 258,80 L 295,72 L 330,75 L 330,95 L 326,115 L 310,130
             L 289,138 L 266,135 L 244,120 L 243,100 Z"
          fill={layer === 'satellite' ? '#203830' : '#162238'}
          stroke="#1e3a55" strokeWidth="0.6"
        />
        {/* Myanmar simplified */}
        <path
          d="M 540,112 L 565,100 L 596,102 L 618,118 L 624,138
             L 617,165 L 604,188 L 589,205 L 571,215 L 554,210
             L 540,194 L 532,174 L 528,155 L 535,138 Z"
          fill={layer === 'satellite' ? '#1a3d20' : '#162238'}
          stroke="#1e3a55" strokeWidth="0.6"
        />
        {/* Arabian Peninsula corner */}
        <path
          d="M 0,180 L 60,160 L 120,158 L 155,175 L 162,210
             L 140,248 L 105,272 L 65,280 L 22,268 L 0,240 Z"
          fill={layer === 'satellite' ? '#2a3820' : '#162238'}
          stroke="#1e3a55" strokeWidth="0.6"
        />

        {/* ── Geographic labels ──────────────────────────────────── */}
        {[
          [400, 245, 'INDIA'],
          [200, 316, 'ARABIAN SEA'],
          [630, 400, 'BAY OF BENGAL'],
          [350, 55,  'PAKISTAN'],
          [580, 55,  'BANGLADESH'],
          [680, 152, 'MYANMAR'],
          [80,  230, 'OMAN'],
        ].map(([x, y, label]) => (
          <text key={label as string}
            x={x} y={y}
            fontSize="9" fontFamily="JetBrains Mono,monospace"
            fill="rgba(148,163,184,0.55)" textAnchor="middle"
            letterSpacing="1.5"
          >
            {label as string}
          </text>
        ))}

        {/* ── Wind particle streams ──────────────────────────────── */}
        {showWind && WIND.map(([path, color, opacity, dash, gap, dur], i) => (
          <path
            key={i}
            d={path}
            stroke={color}
            strokeWidth="1.4"
            strokeOpacity={opacity}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${dash} ${gap}`}
            className="wind-stream"
            style={{ animationDuration: `${dur}s`, animationDelay: `${-(i * 0.17) % dur}s` }}
          />
        ))}

        {/* ── Projected track line (mock-cyclone projected_path) ───── */}
        {showWind && (
          <g>
            {/* Track: 19.81°N 85.83°E → 20.15°N 86.10°E → 20.50°N 86.40°E → landfall Paradeep */}
            <polyline
              points="628,298 614,284 600,268 508,245"
              fill="none"
              stroke="#00f2ff"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.65"
            />
            {/* T+6h waypoint */}
            <circle cx="614" cy="284" r="3" fill="none" stroke="#00f2ff" strokeWidth="1" opacity="0.7" />
            {/* T+12h waypoint */}
            <circle cx="600" cy="268" r="3" fill="none" stroke="#00f2ff" strokeWidth="1" opacity="0.7" />
            {/* Landfall marker at Paradeep coast */}
            <circle cx="508" cy="245" r="5" fill="none" stroke="#f97316" strokeWidth="1.5"
              strokeDasharray="3 2" opacity="0.8" />
            <text x="508" y="238" fontSize="7" fontFamily="JetBrains Mono,monospace"
              fill="#f97316" textAnchor="middle" opacity="0.85" letterSpacing="0.5">
              PARADEEP
            </text>
          </g>
        )}

        {/* ── Cyclone eye marker ─────────────────────────────────── */}
        {showWind && (
          <g>
            <circle cx="628" cy="298" r="18" fill="none" stroke="#ef4444" strokeWidth="1"
              strokeDasharray="4 2" opacity="0.6" />
            <circle cx="628" cy="298" r="8"  fill="none" stroke="#ef4444" strokeWidth="1.5"
              opacity="0.8" />
            <circle cx="628" cy="298" r="3"  fill="#ef4444" opacity="0.9" />
            <text x="628" y="330" fontSize="8" fontFamily="JetBrains Mono,monospace"
              fill="#ef4444" textAnchor="middle" opacity="0.9" letterSpacing="1">
              CYCLONE ALPHA
            </text>
            <text x="628" y="340" fontSize="7" fontFamily="JetBrains Mono,monospace"
              fill="#f97316" textAnchor="middle" opacity="0.75" letterSpacing="0.5">
              215 km/h · 940 hPa
            </text>
          </g>
        )}

        {/* Grid overlay (subtle) */}
        <g opacity="0.06">
          {[...Array(8)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={(i+1)*53} x2="800" y2={(i+1)*53}
              stroke="#38bdf8" strokeWidth="0.5" />
          ))}
          {[...Array(15)].map((_, i) => (
            <line key={`v${i}`} x1={(i+1)*50} y1="0" x2={(i+1)*50} y2="480"
              stroke="#38bdf8" strokeWidth="0.5" />
          ))}
        </g>
      </svg>

      {/* ── Top-right: layer switcher ──────────────────────────── */}
      <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10 }}>
        <LayerToggle value={layer} onChange={setLayer} />
      </div>

      {/* ── Bottom-left: wind legend ───────────────────────────── */}
      <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 10 }}>
        <WindLegend />
      </div>

      {/* Vignette edge darkening */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(7,17,31,0.55) 100%)',
      }} />
    </div>
  );
}

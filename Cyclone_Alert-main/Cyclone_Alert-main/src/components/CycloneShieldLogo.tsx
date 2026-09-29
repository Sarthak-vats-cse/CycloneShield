import { useId } from 'react';

interface Props {
  size?: number;
  /** Soft cyan drop-shadow for dark UI backgrounds */
  glow?: boolean;
  className?: string;
}

/**
 * CycloneShield — minimalist vector logo.
 *
 * Shield:   heater-style, flat azure-teal (#1A9BB5), dark-slate border
 * Emblem:   6-blade shark-fin vortex pinwheel in dark navy (#0D1B3E)
 *           blades radiate from a single precise center point
 * Shadow:   soft diffused light-blue drop shadow for depth
 */
export function CycloneShieldLogo({ size = 40, glow = true, className }: Props) {
  // Unique filter ID — avoids conflicts when multiple instances render
  const uid = useId().replace(/:/g, '');

  const h = Math.round(size * 1.1);

  // ── Single shark-fin blade (local space, center at origin)
  // Leading edge: arcs up and outward to tip at (16, -8)
  // Trailing edge: sweeps back down to origin
  // Tip radius ≈ 17.9 units — fills ~45% of shield width
  const blade = 'M 0,0 C 3,-5 12,-13 16,-8 C 18,-2 14,5 0,0 Z';

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CycloneShield"
    >
      <defs>
        {/* Soft, diffused light-blue drop shadow */}
        <filter
          id={`${uid}-sh`}
          x="-38%" y="-28%"
          width="176%" height="168%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0" dy="5"
            stdDeviation="7"
            floodColor="#64C8E0"
            floodOpacity={glow ? 0.40 : 0}
          />
        </filter>
      </defs>

      {/* ── Heater-style shield ──────────────────────────────────────
          Flat top edge, straight vertical sides, cubic-bezier base
          tapering to a precise bottom point.
      ─────────────────────────────────────────────────────────── */}
      <path
        d="M 10,8 L 90,8 L 90,65
           C 90,89 70,103 50,107
           C 30,103 10,89 10,65
           Z"
        fill="#1A9BB5"
        stroke="#334155"
        strokeWidth="1.8"
        strokeLinejoin="miter"
        filter={`url(#${uid}-sh)`}
      />

      {/* ── 6-blade vortex pinwheel ──────────────────────────────────
          Each blade is the same shark-fin path rotated 60° increments
          around the mathematical center of the shield interior.
          A 2 px center dot anchors all blades to a single sharp point.
      ─────────────────────────────────────────────────────────── */}
      <g transform="translate(50, 58)">
        {[0, 60, 120, 180, 240, 300].map(a => (
          <path
            key={a}
            d={blade}
            fill="#0D1B3E"
            transform={`rotate(${a})`}
          />
        ))}
        {/* Precise center convergence point */}
        <circle r="2" fill="#0D1B3E" />
      </g>
    </svg>
  );
}

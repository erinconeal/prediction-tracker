import { memo, useMemo } from 'react';
import type { ForecastTrend } from '@/lib/forecast-display-metric';

type ForecastSparklineProps = {
  seed: string;
  trend: ForecastTrend;
  className?: string;
};

const TREND_STROKE: Record<ForecastTrend, string> = {
  up: 'stroke-success',
  down: 'stroke-error',
  flat: 'stroke-warning',
};

/** Deterministic decorative sparkline; not live market data. */
function pointsFromSeed(seed: string, trend: ForecastTrend): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const w = 72;
  const h = 28;
  const n = 8;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const noise = ((hash >> (i % 5)) & 7) / 7;
    hash = (hash * 1103515245 + 12345) | 0;
    let yNorm
      = trend === 'up'
        ? 0.75 - t * 0.55 + noise * 0.15
        : trend === 'down'
          ? 0.25 + t * 0.55 + noise * 0.15
          : 0.5 + Math.sin(t * Math.PI * 2) * 0.12 + noise * 0.1;
    yNorm = Math.min(0.92, Math.max(0.08, yNorm));
    const x = t * w;
    const y = yNorm * h;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

export const ForecastSparkline = memo(function ForecastSparkline({
  seed,
  trend,
  className = '',
}: ForecastSparklineProps) {
  const d = useMemo(() => pointsFromSeed(seed, trend), [seed, trend]);
  const stroke = TREND_STROKE[trend];

  return (
    <svg
      className={`h-7 w-[4.5rem] shrink-0 ${className}`.trim()}
      viewBox="0 0 72 28"
      fill="none"
      aria-hidden
    >
      <polyline
        points={d}
        className={`${stroke} fill-none`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

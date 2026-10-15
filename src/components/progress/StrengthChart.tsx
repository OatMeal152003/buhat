import { useLayoutEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import type { ExerciseHistoryPoint } from '@/lib/stats';
import { formatDateShort, toDisplayWeight, weightUnitLabel } from '@/lib/format';
import { EASE, motionEnabled } from '@/lib/motion';

interface StrengthChartProps {
  points: ExerciseHistoryPoint[];
  units: 'kg' | 'lb';
  exerciseName: string;
  metric: 'weight' | 'e1rm';
}

const W = 340;
const H = 160;
const PAD = 24;

/**
 * Strength progression line. The path draws itself on first view; values come
 * strictly from the user's logged sets.
 */
export function StrengthChart({ points, units, exerciseName, metric }: StrengthChartProps) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const dotsRef = useRef<Array<SVGCircleElement | null>>([]);

  const values = points.map((p) => (metric === 'weight' ? p.topWeightKg : p.topE1RM));
  const minRaw = Math.min(...values);
  const maxRaw = Math.max(...values);
  const min = values.length > 0 && maxRaw > minRaw ? minRaw - (maxRaw - minRaw) * 0.15 : 0;
  const max = values.length > 0 && maxRaw > minRaw ? maxRaw + (maxRaw - minRaw) * 0.15 : Math.max(maxRaw, 1);

  const coords = points.map((p, i) => {
    const v = metric === 'weight' ? p.topWeightKg : p.topE1RM;
    const x = PAD + (points.length === 1 ? (W - PAD * 2) / 2 : (i / (points.length - 1)) * (W - PAD * 2));
    const y = H - PAD - ((v - min) / Math.max(1e-6, max - min)) * (H - PAD * 2);
    return { x, y, ...p, v };
  });

  const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || points.length < 2 || !motionEnabled()) return;
    const len = path.getTotalLength?.() ?? 400;
    path.style.strokeDasharray = String(len);
    const anims = [
      animate(path, { strokeDashoffset: [len, 0], duration: 1100, ease: EASE.inOut }),
      animate(
        dotsRef.current.filter((n): n is SVGCircleElement => n !== null),
        {
          opacity: [0, 1],
          scale: [0.4, 1],
          duration: 420,
          delay: stagger(90, { start: 500 }),
          ease: EASE.out,
        },
      ),
    ];
    return () => anims.forEach((a) => a.revert());
  }, [d, points.length]);

  if (points.length === 0) return null;

  const unit = weightUnitLabel(units);
  const latest = coords[coords.length - 1];
  const first = coords[0];
  const delta = latest.v - first.v;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted">
          {metric === 'weight' ? 'Top weight per session' : 'Estimated 1RM per session'} · {exerciseName}
        </p>
        <p className="num text-sm font-bold text-lime">
          {toDisplayWeight(latest.v, units)} {unit}
          {points.length > 1 && (
            <span className={delta >= 0 ? 'ml-2 text-xs text-lime' : 'ml-2 text-xs text-flame'}>
              {delta >= 0 ? '+' : ''}
              {toDisplayWeight(Math.round(delta * 10) / 10, units)} {unit}
            </span>
          )}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-44 w-full"
        role="img"
        aria-label={`${metric === 'weight' ? 'Top weight' : 'Estimated one rep max'} progression for ${exerciseName} over ${points.length} sessions.`}
      >
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--color-line)" strokeWidth="1" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--color-line)" strokeWidth="1" />
        <text x={4} y={PAD + 4} fill="var(--color-faint)" fontSize="9">
          {toDisplayWeight(Math.round(maxRaw), units)}
        </text>
        <text x={4} y={H - PAD} fill="var(--color-faint)" fontSize="9">
          {toDisplayWeight(Math.round(minRaw), units)}
        </text>

        {points.length > 1 && (
          <path ref={pathRef} d={d} fill="none" stroke="var(--color-lime)" strokeWidth="2.5" strokeLinejoin="round" />
        )}

        {coords.map((c, i) => (
          <circle
            key={points[i].date}
            ref={(el) => {
              dotsRef.current[i] = el;
            }}
            cx={c.x}
            cy={c.y}
            r={4}
            fill="var(--color-bg)"
            stroke="var(--color-lime)"
            strokeWidth="2.5"
          >
            <title>
              {formatDateShort(c.date)}: {toDisplayWeight(c.v, units)} {unit}
            </title>
          </circle>
        ))}
      </svg>

      <div className="mt-1 flex justify-between text-[0.6rem] uppercase tracking-[0.08em] text-faint">
        <span>{formatDateShort(points[0].date)}</span>
        {points.length > 1 && <span>{formatDateShort(points[points.length - 1].date)}</span>}
      </div>

      <ul className="sr-only">
        {points.map((p) => (
          <li key={p.date}>
            {formatDateShort(p.date)}: {toDisplayWeight(metric === 'weight' ? p.topWeightKg : p.topE1RM, units)} {unit}
          </li>
        ))}
      </ul>
    </div>
  );
}

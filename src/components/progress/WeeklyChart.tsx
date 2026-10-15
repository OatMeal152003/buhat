import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import type { WeekBucket } from '@/lib/stats';
import { formatDateShort } from '@/lib/format';
import { EASE, motionEnabled } from '@/lib/motion';

interface WeeklyChartProps {
  buckets: WeekBucket[];
  goalPerWeek: number;
}

/**
 * Weekly session frequency. Bars grow with Anime.js on first view; a text
 * alternative lists every value for screen readers.
 */
export function WeeklyChart({ buckets, goalPerWeek }: WeeklyChartProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const max = Math.max(goalPerWeek, ...buckets.map((b) => b.sessions), 1);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !motionEnabled()) return;
    const bars = Array.from(root.querySelectorAll<HTMLElement>('[data-bar]'));
    if (bars.length === 0) return;
    let anim: { revert(): void } | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();
          anim = animate(bars, {
            scaleY: [0, 1],
            duration: 700,
            delay: stagger(70),
            ease: EASE.out,
          });
        }
      },
      { threshold: 0.3 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      anim?.revert();
    };
  }, [buckets]);

  const totalSessions = buckets.reduce((sum, b) => sum + b.sessions, 0);

  return (
    <div>
      <div
        ref={rootRef}
        role="img"
        aria-label={`Weekly workout frequency over the last ${buckets.length} weeks. Total: ${totalSessions} sessions.`}
        className="flex h-44 items-end gap-2 border-b border-line pb-0"
      >
        {buckets.map((b) => (
          <div key={b.weekStart} className="flex h-full flex-1 flex-col justify-end gap-1">
            <span className="num text-center text-[0.65rem] text-muted">
              {b.sessions > 0 ? b.sessions : ''}
            </span>
            <div
              data-bar
              className={`w-full origin-bottom ${b.sessions >= goalPerWeek && b.sessions > 0 ? 'bg-lime' : 'bg-line2'}`}
              style={{ height: `${Math.max(3, (b.sessions / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {buckets.map((b) => (
          <span key={b.weekStart} className="flex-1 text-center text-[0.6rem] uppercase tracking-[0.08em] text-faint">
            {formatDateShort(b.weekStart)}
          </span>
        ))}
      </div>
      <ul className="sr-only">
        {buckets.map((b) => (
          <li key={b.weekStart}>
            Week of {formatDateShort(b.weekStart)}: {b.sessions} sessions, {b.minutes} minutes
          </li>
        ))}
      </ul>
    </div>
  );
}

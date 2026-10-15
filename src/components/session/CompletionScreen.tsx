import { useLayoutEffect, useMemo, useRef } from 'react';
import { animate, createTimeline, stagger } from 'animejs';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import type { CompletedSession } from '@/types';
import { Button } from '@/components/ui/Button';
import { EASE, motionEnabled } from '@/lib/motion';
import { formatClock, formatDate, formatWeight } from '@/lib/format';
import { detectPrEvents } from '@/lib/stats';
import { getExercise } from '@/data/exercises';
import { useApp } from '@/store/AppStore';

interface CompletionScreenProps {
  summary: CompletedSession;
  onDone(): void;
}

/**
 * Branded BUHAT completion screen. Shows only what was actually completed —
 * no fabricated stats — with a restrained premium celebration, including any
 * personal records detected against the sessions stored before this one.
 */
export function CompletionScreen({ summary, onDone }: CompletionScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const checkRef = useRef<SVGPathElement | null>(null);
  const { data } = useApp();

  /* The store unshifts `summary` into `data.sessions` at finish time, so the
     prior history is every other session — same detection the store ran. */
  const newPrs = useMemo(
    () => detectPrEvents(summary, data.sessions.filter((s) => s !== summary)),
    [data.sessions, summary],
  );

  useLayoutEffect(() => {
    if (!motionEnabled()) return;
    const root = rootRef.current;
    const check = checkRef.current;
    if (!root) return;

    const tl = createTimeline({ defaults: { ease: EASE.out } });
    tl.add('[data-done-panel]', { opacity: [0, 1], translateY: [26, 0], duration: 620 }, 0)
      .add('[data-done-word]', { opacity: [0, 1], translateY: [24, 0], duration: 560, delay: stagger(80) }, 120);

    if (check) {
      const len = check.getTotalLength?.() ?? 60;
      check.style.strokeDasharray = String(len);
      tl.add(
        check,
        { strokeDashoffset: [len, 0], duration: 520, ease: EASE.inOut },
        '-=380',
      ).add('[data-done-stat]', { opacity: [0, 1], translateY: [14, 0], duration: 460, delay: stagger(90) }, '-=300');
    } else {
      tl.add('[data-done-stat]', { opacity: [0, 1], translateY: [14, 0], duration: 460, delay: stagger(90) }, '-=200');
    }

    /* Personal-record celebration — only segments with real targets so anime
       never warns about empty selectors. */
    if (newPrs.length > 0) {
      tl.add(
        '[data-done-pr]',
        { opacity: [0, 1], translateY: [14, 0], scale: [0.92, 1], duration: 480, delay: stagger(110) },
        '-=240',
      );
    }

    return () => {
      tl.revert();
    };
  }, []);

  return (
    <div className="min-h-dvh bg-bg px-4 py-10 md:px-8">
      <div ref={rootRef} className="mx-auto max-w-3xl">
        <div data-done-panel className="slashes panel overflow-hidden">
          <div className="border-b border-line bg-ink px-6 py-10 text-center md:px-10">
            <svg viewBox="0 0 64 64" className="mx-auto size-16" aria-hidden="true">
              <circle cx="32" cy="32" r="30" fill="none" stroke="var(--color-lime)" strokeWidth="2.5" opacity="0.35" />
              <path
                ref={checkRef}
                d="M19 33.5 28 42l17-19"
                fill="none"
                stroke="var(--color-lime)"
                strokeWidth="4.5"
                strokeLinecap="square"
              />
            </svg>
            <h1 className="display mt-6 text-[clamp(1.9rem,6vw,3.25rem)] text-fg">
              <span className="sr-only">Workout complete.</span>
              <span aria-hidden="true">
                {['Workout', 'Complete.'].map((word) => (
                  <span key={word} data-done-word className="mr-[0.22em] inline-block last:mr-0">
                    {word}
                  </span>
                ))}
              </span>
            </h1>
            <p className="mt-3 text-lg text-lime">{summary.workoutName}</p>
            <p className="mt-1 text-xs text-faint">{formatDate(summary.endedAt)}</p>
          </div>

          <dl className="grid grid-cols-2 divide-line border-b border-line md:grid-cols-4 md:divide-x">
            <div data-done-stat className="p-5 text-center">
              <dt className="eyebrow text-[0.6rem] text-faint">Duration</dt>
              <dd className="num display mt-2 text-2xl text-fg">{formatClock(summary.durationSec)}</dd>
            </div>
            <div data-done-stat className="p-5 text-center">
              <dt className="eyebrow text-[0.6rem] text-faint">Exercises</dt>
              <dd className="num display mt-2 text-2xl text-fg">{summary.completedExercises}</dd>
            </div>
            <div data-done-stat className="p-5 text-center">
              <dt className="eyebrow text-[0.6rem] text-faint">Sets logged</dt>
              <dd className="num display mt-2 text-2xl text-lime">{summary.totalSets}</dd>
            </div>
            <div data-done-stat className="p-5 text-center">
              <dt className="eyebrow text-[0.6rem] text-faint">Energy (est.)</dt>
              <dd className="num display mt-2 text-2xl text-fg">≈{summary.estimatedKcal}</dd>
            </div>
          </dl>

          {newPrs.length > 0 && (
            <div className="border-b border-line bg-lime/[0.06] px-6 py-5 md:px-8">
              <p className="eyebrow flex items-center gap-2 text-[0.6rem] text-lime">
                <Trophy className="size-3.5" aria-hidden="true" />
                New personal records
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {newPrs.slice(0, 4).map((pr) => (
                  <li
                    key={pr.exerciseId}
                    data-done-pr
                    className="flex items-center gap-2 border border-lime/50 bg-lime/10 px-3 py-2 text-xs font-bold text-lime"
                  >
                    <span className="text-fg">
                      {getExercise(pr.exerciseId)?.name ?? pr.exerciseId}
                    </span>
                    <span className="num">
                      {formatWeight(pr.weightKg, data.prefs.units)} × {pr.reps} · e1RM{' '}
                      {formatWeight(pr.e1rm, data.prefs.units)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-6 md:p-8">
            <h2 className="display text-lg text-fg">Session log</h2>
            <ul className="mt-4 space-y-4">
              {summary.exercises.map((ex) => (
                <li key={ex.exerciseId} className="border-t border-line pt-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="display text-base text-fg">{ex.name}</p>
                    <p className="text-xs text-faint">
                      {ex.sets.length} set{ex.sets.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {ex.sets.map((set, i) => (
                      <li
                        key={i}
                        className="num border border-line2 px-2.5 py-1 text-xs text-muted"
                      >
                        {set.weightKg != null && set.weightKg > 0
                          ? `${Math.round((data.prefs.units === 'lb' ? set.weightKg * 2.2046 : set.weightKg) * 10) / 10} ${data.prefs.units} × `
                          : ''}
                        {set.reps}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={onDone}>
                Back to dashboard
              </Button>
              <Link
                to="/app/progress"
                className="focus-ring inline-flex min-h-14 items-center border border-line2 px-6 text-sm font-semibold uppercase tracking-[0.12em] text-fg transition-colors hover:border-lime hover:text-lime"
              >
                View progress
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Pause,
  Play,
  SkipForward,
  Square,
} from 'lucide-react';
import type { CompletedSession } from '@/types';
import { useApp } from '@/store/AppStore';
import { getExercise } from '@/data/exercises';
import { useNow } from '@/hooks/useNow';
import { elapsedMs, restRemainingSec, completedSets, totalPlannedSets } from '@/lib/session';
import { formatClock, toDisplayWeight, toKg, weightUnitLabel } from '@/lib/format';
import { EASE, motionEnabled } from '@/lib/motion';
import { playCue } from '@/lib/sound';
import { Button } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';
import { Tag } from '@/components/ui/Tag';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { NumberField } from '@/components/ui/Field';
import { RestTimer, PauseBadge } from '@/components/session/RestTimer';
import { cn } from '@/lib/cn';

function parseReps(target: string): { value: number; timed: boolean } {
  const match = target.match(/(\d+)/);
  return { value: match ? parseInt(match[1], 10) : 10, timed: /sec/i.test(target) };
}

interface ActiveWorkoutProps {
  onFinished(summary: CompletedSession): void;
}

export function ActiveWorkout({ onFinished }: ActiveWorkoutProps) {
  const { data, actions } = useApp();
  const navigate = useNavigate();
  const now = useNow(250);

  const session = data.activeSession!;
  const units = data.prefs.units;

  const exIdx = Math.min(session.exerciseIndex, session.exercises.length - 1);
  const exercise = session.exercises[exIdx];
  const exerciseData = getExercise(exercise.exerciseId);
  const paused = session.status === 'paused';
  const resting = Boolean(session.rest);
  const restSec = restRemainingSec(session, now);

  const totalSets = useMemo(() => totalPlannedSets(session), [session]);
  const doneSets = useMemo(() => completedSets(session), [session]);
  const finished = session.exercises.every((e) => e.sets.every((s) => s.completed) || e.skipped);

  const parsed = parseReps(exercise.targetReps);
  const [repsInput, setRepsInput] = useState(String(parsed.value));
  const [weightInput, setWeightInput] = useState(
    exercise.weightKg != null ? String(toDisplayWeight(exercise.weightKg, units)) : '',
  );
  const [confirmEnd, setConfirmEnd] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLUListElement | null>(null);
  const dotsRef = useRef<Array<HTMLSpanElement | null>>([]);

  /* Reset inputs when the active exercise changes. */
  useEffect(() => {
    const p = parseReps(exercise.targetReps);
    setRepsInput(String(p.value));
    setWeightInput(
      exercise.weightKg != null ? String(toDisplayWeight(exercise.weightKg, units)) : '',
    );
  }, [exercise.exerciseId, exercise.targetReps, exercise.weightKg, units]);

  /* Exercise transition. */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !motionEnabled()) return;
    const anim = animate(panel, {
      opacity: [0, 1],
      translateX: [28, 0],
      duration: 460,
      ease: EASE.out,
    });
    return () => {
      anim.revert();
    };
  }, [exIdx]);

  /* Keep the active exercise tab visible in the horizontal strip. */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || strip.scrollWidth <= strip.clientWidth) return;
    const current = strip.querySelector<HTMLElement>('[aria-current="step"]');
    current?.scrollIntoView({
      behavior: motionEnabled() ? 'smooth' : 'auto',
      inline: 'center',
      block: 'nearest',
    });
  }, [exIdx]);

  /* Pop the set indicator that just completed. */
  const completedInExercise = exercise.sets.filter((s) => s.completed).length;
  useEffect(() => {
    if (!resting || !motionEnabled()) return;
    const lastIdx = exercise.sets.map((s) => s.completed).lastIndexOf(true);
    const dot = lastIdx >= 0 ? dotsRef.current[lastIdx] : null;
    if (!dot) return;
    const anim = animate(dot, { scale: [1, 1.45, 1], duration: 420, ease: EASE.out });
    return () => {
      anim.revert();
    };
  }, [resting, completedInExercise]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Rest completion: advance to the next set when the countdown hits zero. */
  const prevRestRef = useRef(0);
  useEffect(() => {
    const prev = prevRestRef.current;
    prevRestRef.current = restSec;
    if (session.rest?.running && prev > 0 && restSec === 0) {
      actions.advance();
      playCue('rest', data.prefs.sound);
    }
  }, [restSec, session.rest?.running, actions, data.prefs.sound]);

  const completeSet = () => {
    const reps = parsed.timed
      ? parsed.value
      : Math.max(1, parseInt(repsInput, 10) || parsed.value);
    const weightNum = parseFloat(weightInput);
    const weightKg = Number.isFinite(weightNum) && weightNum > 0 ? toKg(weightNum, units) : null;
    actions.completeSet({ reps, weightKg });
  };

  const finishNow = () => {
    const summary = actions.finish();
    if (summary) onFinished(summary);
    else navigate('/app');
  };

  const elapsedSec = Math.round(elapsedMs(session, now) / 1000);
  const progress = totalSets > 0 ? doneSets / totalSets : 0;

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        {/* Header */}
        <header className="border-b border-line pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-lime">Active workout · BUHAT</p>
              <h1 className="display mt-2 text-2xl text-fg md:text-3xl">{session.workoutName}</h1>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="text-right">
                <p className="eyebrow text-[0.6rem] text-faint">Elapsed</p>
                <p className="num display text-2xl text-fg">{formatClock(elapsedSec)}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => (paused ? actions.resume() : actions.pause())}
                aria-label={paused ? 'Resume workout' : 'Pause workout'}
              >
                {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
                {paused ? 'Resume' : 'Pause'}
              </Button>
              <Button variant="danger" size="sm" onClick={() => setConfirmEnd(true)}>
                <Square className="size-3.5" aria-hidden="true" /> End
              </Button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div
              className="h-2 flex-1 overflow-hidden bg-line"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={totalSets}
              aria-valuenow={doneSets}
              aria-label={`${doneSets} of ${totalSets} sets completed`}
            >
              <div className="h-full bg-lime transition-[width] duration-500 ease-out motion-reduce:transition-none" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <span className="num text-xs font-bold uppercase tracking-[0.12em] text-muted">
              {doneSets}/{totalSets} sets
            </span>
          </div>
        </header>

        {/* Exercise navigation strip */}
        <nav aria-label="Exercises in this workout" className="mt-4">
          <ul ref={stripRef} className="flex gap-2 overflow-x-auto pb-2">
            {session.exercises.map((ex, i) => {
              const done = ex.sets.every((s) => s.completed) || ex.skipped;
              const current = i === exIdx;
              return (
                <li key={ex.exerciseId} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => actions.goToExercise(i)}
                    aria-current={current ? 'step' : undefined}
                    className={cn(
                      'focus-ring flex min-h-11 items-center gap-2 border px-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors',
                      current
                        ? 'border-lime bg-lime/10 text-lime'
                        : done
                          ? 'border-line2 text-faint'
                          : 'border-line text-muted hover:border-line2 hover:text-fg',
                    )}
                  >
                    {done && !ex.skipped && <Check className="size-3.5" aria-hidden="true" />}
                    {ex.skipped && <SkipForward className="size-3.5" aria-hidden="true" />}
                    {ex.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {paused && (
          <div className="mt-4">
            <PauseBadge onResume={actions.resume} />
          </div>
        )}

        {/* Main panel */}
        <div ref={panelRef} className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Exercise info */}
          <section aria-labelledby="current-exercise-title" className="panel overflow-hidden">
            <SmartImage
              src={exerciseData?.image ?? ''}
              alt={exerciseData?.imageAlt ?? exercise.name}
              className="h-48 w-full"
              fallbackLabel={exercise.name}
            />
            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone="lime">
                  Exercise {exIdx + 1} / {session.exercises.length}
                </Tag>
                {exercise.note && <Tag tone="flame">{exercise.note}</Tag>}
              </div>
              <h2 id="current-exercise-title" className="display mt-3 text-2xl text-fg">
                {exercise.name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Target: <span className="font-semibold text-fg">{exercise.targetSets} sets × {exercise.targetReps}</span>
                {exerciseData ? ` · ${exerciseData.primary}` : ''}
              </p>

              <ol className="mt-4 space-y-2">
                {exerciseData?.instructions.slice(0, 4).map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span className="num shrink-0 font-bold text-lime">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>

              <div className="mt-5 flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={exIdx === 0}
                  onClick={() => actions.goToExercise(exIdx - 1)}
                >
                  <ChevronLeft className="size-4" aria-hidden="true" /> Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={exIdx >= session.exercises.length - 1}
                  onClick={() => actions.skipExercise()}
                >
                  Skip exercise <SkipForward className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </section>

          {/* Set tracker / rest timer */}
          <section aria-labelledby="set-title" className="flex flex-col gap-4">
            {finished ? (
              <div className="panel flex flex-col items-center gap-4 border-l-2 border-l-lime p-8 text-center">
                <Check className="size-10 text-lime" aria-hidden="true" />
                <h2 id="set-title" className="display text-2xl text-fg">
                  All exercises complete
                </h2>
                <p className="max-w-sm text-sm leading-relaxed text-muted">
                  {doneSets} set{doneSets === 1 ? '' : 's'} logged in{' '}
                  {formatClock(elapsedSec)}. Finish to save this session to your logbook.
                </p>
                <Button size="lg" onClick={finishNow}>
                  Finish workout
                </Button>
              </div>
            ) : resting ? (
              <RestTimer
                remainingSec={restSec}
                totalSec={session.rest?.totalSec || exercise.restSec}
                paused={paused || !session.rest?.running}
                onSkip={() => {
                  actions.advance();
                }}
                onExtend={(sec) => actions.startRest(Math.max(restSec + sec, sec))}
                onResume={actions.resume}
              />
            ) : (
              <div className="panel flex flex-col gap-5 p-5 md:p-6">
                <div>
                  <p className="eyebrow text-[0.6rem] text-faint">Current set</p>
                  <h2 id="set-title" className="display mt-1 text-3xl text-fg">
                    Set {Math.min(exercise.sets.findIndex((s) => !s.completed) + 1 || exercise.targetSets, exercise.targetSets)}{' '}
                    <span className="text-line2">/ {exercise.targetSets}</span>
                  </h2>
                </div>

                {/* Set indicators */}
                <ul className="flex gap-2" aria-label="Set completion status">
                  {exercise.sets.map((set, i) => (
                    <li key={i}>
                      <span
                        ref={(el) => {
                          dotsRef.current[i] = el;
                        }}
                        aria-hidden="true"
                        className={cn(
                          'block h-2.5 w-10',
                          set.completed
                            ? 'bg-lime'
                            : i === exercise.sets.findIndex((s) => !s.completed)
                              ? 'bg-lime/25 ring-1 ring-lime'
                              : 'bg-line',
                        )}
                      />
                      <span className="sr-only">Set {i + 1}: {set.completed ? 'completed' : 'pending'}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    label={parsed.timed ? 'Hold (seconds)' : 'Repetitions'}
                    min={1}
                    max={parsed.timed ? 600 : 100}
                    value={repsInput}
                    onChange={(e) => setRepsInput(e.target.value)}
                    disabled={paused}
                  />
                  <NumberField
                    label="Weight"
                    min={0}
                    step={units === 'lb' ? 5 : 2.5}
                    value={weightInput}
                    placeholder="0"
                    onChange={(e) => setWeightInput(e.target.value)}
                    disabled={paused}
                    suffix={weightUnitLabel(units)}
                    hint="Leave empty for bodyweight"
                  />
                </div>

                <Button size="lg" onClick={completeSet} disabled={paused} className="w-full">
                  <Check className="size-5" aria-hidden="true" /> Complete set
                </Button>
                <p className="text-xs text-faint">
                  Logging this set starts a {exercise.restSec >= 60
                    ? `${Math.round(exercise.restSec / 60)} min`
                    : `${exercise.restSec}s`}{' '}
                  rest timer automatically.
                </p>
              </div>
            )}
          </section>
        </div>

        <p className="mt-8 flex items-center gap-2 text-xs text-faint">
          <Dumbbell className="size-3.5" aria-hidden="true" />
          Your session is saved locally as you go — closing the tab will not lose your sets.
        </p>
      </div>

      <ConfirmationDialog
        open={confirmEnd}
        title="End this workout?"
        body={
          doneSets > 0 ? (
            <>
              You have logged <strong className="text-fg">{doneSets} set{doneSets === 1 ? '' : 's'}</strong>. You
              can save them to your logbook, or discard the session entirely.
            </>
          ) : (
            'No sets have been logged yet. Ending now will discard this session.'
          )
        }
        confirmLabel={doneSets > 0 ? 'Save & finish' : 'Discard & exit'}
        cancelLabel='Keep training'
        destructive={doneSets === 0}
        onConfirm={() => {
          setConfirmEnd(false);
          finishNow();
        }}
        onCancel={() => setConfirmEnd(false)}
      />
    </div>
  );
}

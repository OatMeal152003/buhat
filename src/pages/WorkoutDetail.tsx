import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Dumbbell, Play, SearchX, Timer } from 'lucide-react';
import { getWorkout } from '@/data/workouts';
import { getExercise } from '@/data/exercises';
import { useApp } from '@/store/AppStore';
import { Button } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';
import { Tag } from '@/components/ui/Tag';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useReveal } from '@/hooks/useReveal';
import { difficultyTone } from '@/lib/tones';

export function WorkoutDetail() {
  const { id = '' } = useParams();
  const workout = getWorkout(id);
  const navigate = useNavigate();
  const { data, actions } = useApp();
  const [confirming, setConfirming] = useState(false);
  const ref = useReveal<HTMLElement>({ variant: 'fade', threshold: 0.05 });

  if (!workout) {
    return (
      <div className="space-y-6">
        <EmptyDetail />
      </div>
    );
  }

  const begin = () => {
    actions.startFromWorkout(workout);
    navigate('/app/active');
  };

  const onStart = () => {
    if (data.activeSession) setConfirming(true);
    else begin();
  };

  return (
    <article ref={ref} className="space-y-10">
      <Link
        to="/app/workouts"
        className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-lime"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to library
      </Link>

      <header className="panel grid overflow-hidden md:grid-cols-[1fr_1.2fr]">
        <SmartImage
          src={workout.image}
          alt={workout.imageAlt}
          className="min-h-64 md:h-full"
          loading="eager"
          fallbackLabel={workout.name}
        />
        <div className="flex flex-col gap-4 p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            <Tag tone={difficultyTone(workout.difficulty)}>{workout.difficulty}</Tag>
            {workout.categories.map((c) => (
              <Tag key={c} tone="neutral">
                {c}
              </Tag>
            ))}
          </div>
          <h1 className="display text-[clamp(1.9rem,4.5vw,2.75rem)] text-fg">{workout.name}</h1>
          <p className="text-lg text-lime">{workout.tagline}</p>
          <p className="leading-relaxed text-muted">{workout.description}</p>

          <dl className="mt-2 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm sm:grid-cols-4">
            <div>
              <dt className="eyebrow text-[0.6rem] text-faint">Duration</dt>
              <dd className="num mt-1 flex items-center gap-1.5 font-semibold text-fg">
                <Clock className="size-3.5" aria-hidden="true" /> {workout.durationMin} min
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-[0.6rem] text-faint">Exercises</dt>
              <dd className="num mt-1 flex items-center gap-1.5 font-semibold text-fg">
                <Dumbbell className="size-3.5" aria-hidden="true" /> {workout.exercises.length}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-[0.6rem] text-faint">Total sets</dt>
              <dd className="num mt-1 font-semibold text-fg">
                {workout.exercises.reduce((sum, e) => sum + e.sets, 0)}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-[0.6rem] text-faint">Energy cost</dt>
              <dd className="num mt-1 flex items-center gap-1.5 font-semibold text-fg">
                <Timer className="size-3.5" aria-hidden="true" /> ≈ {workout.estKcal} kcal (est.)
              </dd>
            </div>
          </dl>

          <div className="mt-2">
            <Button size="lg" onClick={onStart}>
              <Play className="size-4" aria-hidden="true" /> Start workout
            </Button>
            {data.activeSession && (
              <p className="mt-2 text-xs text-flame">
                A session is already in progress — starting will replace it.
              </p>
            )}
          </div>
        </div>
      </header>

      <section aria-labelledby="exercises-title" className="space-y-5">
        <h2 id="exercises-title" className="display text-2xl text-fg">
          Exercises
        </h2>
        <ol className="panel divide-y divide-line">
          {workout.exercises.map((item, i) => {
            const ex = getExercise(item.exerciseId);
            return (
              <li key={item.exerciseId} className="flex flex-wrap items-center gap-4 p-4 md:p-5">
                <span className="num display w-8 shrink-0 text-xl text-line2">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/app/exercises/${item.exerciseId}`}
                    className="focus-ring display text-lg text-fg transition-colors hover:text-lime"
                  >
                    {ex?.name ?? item.exerciseId}
                  </Link>
                  <p className="mt-0.5 text-xs text-faint">
                    {ex ? `${ex.primary}${ex.secondary.length > 0 ? ` · also ${ex.secondary.slice(0, 2).join(', ')}` : ''}` : ''}
                  </p>
                  {item.note && <p className="mt-1 text-xs italic text-lime/80">{item.note}</p>}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span className="num">
                    <span className="sr-only">Sets: </span>
                    {item.sets} × {item.reps}
                  </span>
                  <span className="num text-xs text-faint">
                    rest {item.restSec >= 60 ? `${Math.round(item.restSec / 60)} min` : `${item.restSec}s`}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="equipment-title" className="space-y-3">
        <h2 id="equipment-title" className="display text-xl text-fg">
          Required equipment
        </h2>
        <div className="flex flex-wrap gap-2">
          {workout.equipment.map((eq) => (
            <Tag key={eq} tone="lime">
              {eq}
            </Tag>
          ))}
        </div>
      </section>

      <ConfirmationDialog
        open={confirming}
        title="Replace the current session?"
        body={`You have "${data.activeSession?.workoutName}" in progress. Starting ${workout.name} will discard the current session's unsaved progress.`}
        confirmLabel="Start new workout"
        cancelLabel="Keep current"
        destructive
        onConfirm={() => {
          setConfirming(false);
          begin();
        }}
        onCancel={() => setConfirming(false)}
      />
    </article>
  );
}

function EmptyDetail() {
  return (
    <div className="space-y-6">
      <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
        <SearchX className="size-7 text-faint" aria-hidden="true" />
        <h1 className="display text-xl text-fg">Workout not found</h1>
        <p className="max-w-sm text-sm text-muted">
          This workout is not part of the BUHAT library. It may have been renamed.
        </p>
        <Link
          to="/app/workouts"
          className="focus-ring mt-2 inline-flex items-center gap-2 text-sm font-semibold text-lime hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to workout library
        </Link>
      </div>
    </div>
  );
}

import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Lightbulb, Timer } from 'lucide-react';
import { getExercise } from '@/data/exercises';
import { WORKOUTS } from '@/data/workouts';
import { SmartImage } from '@/components/ui/SmartImage';
import { Tag } from '@/components/ui/Tag';
import { useReveal } from '@/hooks/useReveal';
import { difficultyTone } from '@/lib/tones';

export function ExerciseDetail() {
  const { id = '' } = useParams();
  const ex = getExercise(id);
  const ref = useReveal<HTMLElement>({ variant: 'fade', threshold: 0.05 });

  if (!ex) {
    return (
      <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
        <h1 className="display text-xl text-fg">Exercise not found</h1>
        <p className="max-w-sm text-sm text-muted">
          This movement is not in the BUHAT exercise library.
        </p>
        <Link
          to="/app/exercises"
          className="focus-ring mt-2 inline-flex items-center gap-2 text-sm font-semibold text-lime hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to exercise library
        </Link>
      </div>
    );
  }

  const related = WORKOUTS.filter((w) => w.exercises.some((e) => e.exerciseId === ex.id));

  return (
    <article ref={ref} className="space-y-10">
      <Link
        to="/app/exercises"
        className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-lime"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to library
      </Link>

      <header className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel relative overflow-hidden">
          <SmartImage
            src={ex.image}
            alt={ex.imageAlt}
            className="aspect-4/3 w-full"
            loading="eager"
            fallbackLabel={ex.name}
          />
          <p className="border-t border-line bg-surface2 px-4 py-2 text-xs text-faint">
            Static photo demonstration — follow the step-by-step instructions for form.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Tag tone={difficultyTone(ex.difficulty)}>{ex.difficulty}</Tag>
            {ex.equipment.map((eq) => (
              <Tag key={eq} tone="neutral">
                {eq}
              </Tag>
            ))}
          </div>
          <h1 className="display text-[clamp(1.9rem,4.5vw,2.75rem)] text-fg">{ex.name}</h1>
          <p className="text-sm text-muted">
            <span className="font-bold text-fg">Primary:</span> {ex.primary}
            <br />
            <span className="font-bold text-fg">Secondary:</span>{' '}
            {ex.secondary.length > 0 ? ex.secondary.join(', ') : '—'}
          </p>

          <dl className="grid grid-cols-3 gap-4 border-y border-line py-4 text-sm">
            <div>
              <dt className="eyebrow text-[0.6rem] text-faint">Sets</dt>
              <dd className="num mt-1 font-semibold text-fg">{ex.recommendedSets}</dd>
            </div>
            <div>
              <dt className="eyebrow text-[0.6rem] text-faint">Reps</dt>
              <dd className="num mt-1 font-semibold text-fg">{ex.recommendedReps}</dd>
            </div>
            <div>
              <dt className="eyebrow text-[0.6rem] text-faint">Rest</dt>
              <dd className="num mt-1 flex items-center gap-1.5 font-semibold text-fg">
                <Timer className="size-3.5" aria-hidden="true" />
                {ex.restSec >= 60 ? `${Math.round(ex.restSec / 60)} min` : `${ex.restSec}s`}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <section aria-labelledby="steps-title" className="space-y-4">
        <h2 id="steps-title" className="display text-2xl text-fg">
          How to perform it
        </h2>
        <ol className="panel divide-y divide-line">
          {ex.instructions.map((step, i) => (
            <li key={i} className="flex gap-4 p-4 md:p-5">
              <span className="num display w-7 shrink-0 text-lg text-lime">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-sm leading-relaxed text-muted">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="mistakes-title" className="panel p-5 md:p-6">
          <h2 id="mistakes-title" className="display flex items-center gap-2 text-lg text-fg">
            <AlertTriangle className="size-5 text-flame" aria-hidden="true" /> Common form mistakes
          </h2>
          <ul className="mt-4 space-y-3">
            {ex.mistakes.map((m) => (
              <li key={m} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span aria-hidden="true" className="mt-2 h-1 w-3 shrink-0 bg-flame" />
                {m}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tips-title" className="panel p-5 md:p-6">
          <h2 id="tips-title" className="display flex items-center gap-2 text-lg text-fg">
            <Lightbulb className="size-5 text-lime" aria-hidden="true" /> Safety and performance tips
          </h2>
          <ul className="mt-4 space-y-3">
            {ex.tips.map((t) => (
              <li key={t} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span aria-hidden="true" className="mt-2 h-1 w-3 shrink-0 bg-lime" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="space-y-4">
          <h2 id="related-title" className="display text-xl text-fg">
            Workouts containing this exercise
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((w) => (
              <li key={w.id}>
                <Link
                  to={`/app/workouts/${w.id}`}
                  className="focus-ring panel flex items-center justify-between gap-3 p-4 transition-colors hover:border-lime"
                >
                  <div>
                    <p className="display text-sm text-fg">{w.name}</p>
                    <p className="mt-0.5 text-xs text-faint">
                      {w.durationMin} min · {w.difficulty}
                    </p>
                  </div>
                  <ArrowLeft className="size-4 rotate-180 text-lime" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

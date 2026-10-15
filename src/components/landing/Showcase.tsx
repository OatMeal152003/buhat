import { ArrowRight } from 'lucide-react';
import { WORKOUTS } from '@/data/workouts';
import { WorkoutCard } from '@/components/workouts/WorkoutCard';
import { ButtonLink } from '@/components/ui/Button';
import { useReveal, useStaggerReveal } from '@/hooks/useReveal';

export function Showcase() {
  const headingRef = useReveal<HTMLDivElement>({ variant: 'up' });
  const gridRef = useStaggerReveal<HTMLDivElement>();
  const featured = WORKOUTS.filter((w) =>
    ['full-body-foundation', 'hiit-furnace', 'upper-body-force', 'full-body-athlete'].includes(w.id),
  );

  return (
    <section id="workouts" aria-labelledby="showcase-title" className="border-b border-line py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div ref={headingRef} className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-lime">
              <span aria-hidden="true" className="text-lime/40">02 — </span>Workout showcase
            </p>
            <h2 id="showcase-title" className="display mt-4 text-[clamp(2rem,5vw,3.25rem)] text-fg">
              Programming that meets you where you are.
            </h2>
          </div>
          <ButtonLink to="/app/workouts" variant="secondary">
            Browse all workouts{' '}
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </ButtonLink>
        </div>

        <div ref={gridRef} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      </div>
    </section>
  );
}

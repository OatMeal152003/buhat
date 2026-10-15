import {
  Award,
  CalendarRange,
  ChartNoAxesColumnIncreasing,
  Timer,
  Waves,
} from 'lucide-react';
import { useReveal, useStaggerReveal } from '@/hooks/useReveal';

const FEATURES = [
  {
    icon: CalendarRange,
    title: 'Personalized workout plans',
    body: 'Weekly planner with starter templates for beginner, intermediate and advanced athletes. Assign workouts, build custom days, and adjust sets, reps and rest.',
  },
  {
    icon: Waves,
    title: 'Exercise library',
    body: 'Sixteen movement guides with step-by-step instructions, target muscles, equipment, common form mistakes and safety cues.',
  },
  {
    icon: Timer,
    title: 'Real workout tracking',
    body: 'A focused session mode with set logging, weight and reps, an accurate rest timer and pause controls. Every set you finish is recorded.',
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: 'Progress analytics',
    body: 'Weekly frequency, training volume, estimated strength progression and personal records — all derived from your own logbook.',
  },
  {
    icon: Award,
    title: 'Consistency and achievements',
    body: 'Streaks, milestones and personal records that unlock only through completed work. No participation trophies.',
  },
];

/**
 * Feature section: oversized numbered rows instead of a repetitive card grid.
 */
export function Features() {
  const sectionRef = useReveal<HTMLDivElement>({ variant: 'fade', threshold: 0.05 });
  const listRef = useStaggerReveal<HTMLUListElement>({ step: 90, threshold: 0.08 });

  return (
    <section id="features" aria-labelledby="features-title" className="border-b border-line py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
        <div ref={sectionRef} className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-lime">
            <span aria-hidden="true" className="text-lime/40">01 — </span>The platform
          </p>
          <h2 id="features-title" className="display mt-4 text-[clamp(2rem,5vw,3.25rem)] text-fg">
            Everything a serious training habit needs.
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-muted">
            BUHAT is not a static gallery of exercises. It is a working system: plan the week,
            run the session, keep the data, and let the next decision write itself.
          </p>
        </div>

        <ul ref={listRef} className="flex flex-col">
          {FEATURES.map((f, i) => (
            <li key={f.title} data-stagger className="border-t border-line first:border-t-0">
              <div className="group flex items-start gap-5 py-7 md:gap-8">
                <span className="num display mt-1 w-12 shrink-0 text-2xl text-line2 transition-colors duration-200 group-hover:text-lime md:text-3xl">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <f.icon className="mt-1.5 size-5 shrink-0 text-lime" aria-hidden="true" />
                <div>
                  <h3 className="display text-lg text-fg md:text-xl">{f.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{f.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

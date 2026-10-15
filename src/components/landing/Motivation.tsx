import { useReveal } from '@/hooks/useReveal';

const FACTS = [
  { value: '10', label: 'Programmed workouts' },
  { value: '16', label: 'Exercise guides' },
  { value: '0', label: 'Excuses logged' },
];

/**
 * Motivation band: big typography, restrained motion, no filler.
 */
export function Motivation() {
  const ref = useReveal<HTMLDivElement>({ variant: 'up' });

  return (
    <section id="progress" aria-labelledby="motivation-title" className="border-b border-line bg-ink py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="eyebrow text-lime">
          <span aria-hidden="true" className="text-lime/40">04 — </span>The BUHAT standard
        </p>
        <h2 id="motivation-title" className="display mt-6 text-[clamp(2.25rem,7vw,5rem)] leading-[0.95] text-fg">
          Consistency is the program.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Motivation gets you started. A plan you can repeat gets you strong. BUHAT keeps the
          plan visible, the work honest, and the progress impossible to ignore.
        </p>

        <dl className="mt-12 grid gap-8 sm:grid-cols-3">
          {FACTS.map((f) => (
            <div key={f.label} className="border-t border-line2 pt-5">
              <dt className="eyebrow text-[0.65rem] text-muted">{f.label}</dt>
              <dd className="num display mt-2 text-4xl text-lime md:text-5xl">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

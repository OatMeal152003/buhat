import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { EASE, motionEnabled } from '@/lib/motion';

const STEPS = [
  { title: 'Choose your fitness goal', body: 'Strength, muscle, fat loss, endurance or mobility — your goal steers the recommendations.' },
  { title: 'Build or select your workout plan', body: 'Start from a template, arrange your week, or pick a single session and go.' },
  { title: 'Train and track every session', body: 'Set the timer, complete the sets, and let BUHAT record exactly what you did.' },
  { title: 'Monitor your progress and keep improving', body: 'Watch volume, frequency and personal records move — then raise the bar.' },
];

export function HowItWorks() {
  const listRef = useRef<HTMLOListElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    const line = lineRef.current;
    if (!list || !line || !motionEnabled()) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-step]'));
    if (items.length === 0) return;

    let animations: { revert(): void }[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();
          animations = [
            animate(line, { scaleX: [0, 1], duration: 1100, ease: EASE.inOut }),
            animate(items, {
              opacity: [0, 1],
              translateY: [26, 0],
              duration: 640,
              delay: stagger(140, { start: 250 }),
              ease: EASE.out,
            }),
          ];
        }
      },
      { threshold: 0.2 },
    );
    io.observe(list);
    return () => {
      io.disconnect();
      animations.forEach((a) => a.revert());
    };
  }, []);

  return (
    <section id="how" aria-labelledby="how-title" className="border-b border-line py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-lime">
            <span aria-hidden="true" className="text-lime/40">03 — </span>How it works
          </p>
          <h2 id="how-title" className="display mt-4 text-[clamp(2rem,5vw,3.25rem)] text-fg">
            Four steps. One forward direction.
          </h2>
        </div>

        <div className="relative mt-14">
          <div
            ref={lineRef}
            data-how-line
            aria-hidden="true"
            className="absolute left-0 top-0 hidden h-px w-full origin-left bg-lime/50 lg:block"
          />
          <ol ref={listRef} className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((s, i) => (
              <li key={s.title} data-step className="relative pt-8 lg:pt-10">
                <span
                  aria-hidden="true"
                  className="absolute -top-1.5 left-0 size-3 border-2 border-lime bg-bg lg:top-0"
                />
                <span className="num display block text-4xl text-lime/30">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="display mt-3 text-lg text-fg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

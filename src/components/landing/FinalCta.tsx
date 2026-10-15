import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { useReveal } from '@/hooks/useReveal';

export function FinalCta() {
  const ref = useReveal<HTMLDivElement>({ variant: 'scale', threshold: 0.2 });

  return (
    <section aria-labelledby="cta-title" className="border-b border-line py-20 md:py-28">
      <div ref={ref} className="slashes mx-auto max-w-7xl border border-line px-6 py-16 text-center md:px-16 md:py-20">
        <h2 id="cta-title" className="display text-[clamp(2rem,6vw,4.25rem)] text-fg">
          Your next rep starts here.
        </h2>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted">
          No credit card, no cloud account. Open BUHAT, pick a workout, and start the first
          honest set of your week.
        </p>
        <div className="mt-9 flex justify-center">
          <span className="inline-flex">
            <ButtonLink to="/app/workouts" size="lg">
              Start your journey{' '}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </ButtonLink>
          </span>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { createTimeline, stagger, animate, onScroll } from 'animejs';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';
import { Tag } from '@/components/ui/Tag';
import { EASE, motionEnabled } from '@/lib/motion';

const HEADLINE = ['Build', 'Your', 'Stronger', 'Self.'];

export function Hero({ start = true }: { start?: boolean }) {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !start || !motionEnabled()) return;

    const tl = createTimeline({ defaults: { ease: EASE.out } });
    tl.add('[data-hero-eyebrow]', { opacity: [0, 1], translateY: [12, 0], duration: 460 }, 0)
      .add(
        '[data-hero-word]',
        { translateY: ['118%', '0%'], duration: 840, delay: stagger(76), ease: EASE.outExpo },
        140,
      )
      .add('[data-hero-support]', { opacity: [0, 1], translateY: [18, 0], duration: 540 }, '-=420')
      .add('[data-hero-cta]', { opacity: [0, 1], translateY: [16, 0], duration: 480, delay: stagger(90) }, '-=300')
      .add('[data-hero-media]', { opacity: [0, 1], scale: [1.07, 1], duration: 950 }, 300)
      .add('[data-hero-frame]', { scaleY: [0, 1], duration: 700, ease: EASE.inOut }, '-=720')
      .add('[data-hero-chip]', { opacity: [0, 1], translateX: [20, 0], duration: 480, delay: stagger(110) }, '-=540')
      .add('[data-hero-scroll]', { opacity: [0, 1], duration: 600 }, '-=300');

    return () => {
      tl.revert();
    };
  }, [start]);

  /* Scroll-responsive parallax: the media composition drifts slightly against
     the page as the hero leaves. Anime's ScrollObserver seeks a transform-only
     animation — no layout work, no timers, fully reverted on unmount. */
  useEffect(() => {
    const root = rootRef.current;
    const layer = root?.querySelector<HTMLElement>('[data-hero-parallax]');
    if (!root || !layer || !motionEnabled()) return;

    const scrub = animate(layer, { y: -56, autoplay: false });
    const observer = onScroll({
      target: root,
      enter: { container: 'start', target: 'start' },
      leave: { container: 'start', target: 'end' },
      sync: true,
    });
    observer.link(scrub);

    return () => {
      observer.revert();
      scrub.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-line pt-16"
    >
      <div className="slashes pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Copy */}
        <div className="relative z-10">
          <p data-hero-eyebrow className="eyebrow text-lime">
            Train hard. Move forward.
          </p>

          <h1 id="hero-title" className="display mt-6 text-[clamp(2.75rem,9vw,6rem)] text-fg">
            <span className="sr-only">Build your stronger self.</span>
            <span aria-hidden="true" className="block">
              {HEADLINE.map((word, i) => (
                <span
                  key={word}
                  className="mr-[0.22em] inline-block -mb-[0.08em] overflow-hidden pb-[0.08em] last:mr-0"
                >
                  <span
                    data-hero-word
                    className={i === 3 ? 'inline-block text-lime' : 'inline-block'}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </span>
          </h1>

          <p data-hero-support className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Your training. Your progress. Your strength. BUHAT turns every session into data
            you can act on — plan it, log it, and keep moving forward.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <span data-hero-cta className="inline-flex">
              <ButtonLink to="/app/workouts" size="lg">
                Start Training{' '}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </ButtonLink>
            </span>
            <span data-hero-cta className="inline-flex">
              <ButtonLink to="/#workouts" variant="secondary" size="lg">
                Explore Workouts
              </ButtonLink>
            </span>
          </div>
        </div>

        {/* Media composition — the wrapper is the parallax layer; entrance
            animations only touch its children, so transforms never collide. */}
        <div data-hero-parallax className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div data-hero-media className="relative">
            <SmartImage
              src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=80"
              alt="Athlete training with a kettlebell in a dark gym"
              className="aspect-4/5 w-full"
              loading="eager"
              fallbackLabel="BUHAT Training"
            />
            <div
              data-hero-frame
              className="absolute -bottom-4 -left-4 -z-10 h-full w-full border-2 border-lime/70"
              aria-hidden="true"
            />
          </div>

          <div className="absolute -left-3 top-6 flex flex-col gap-2 md:-left-8">
            <div data-hero-chip className="panel-2 px-3 py-2 shadow-md">
              <p className="eyebrow text-[0.6rem] text-faint">Streak</p>
              <p className="num display text-lg text-lime">7 DAYS</p>
            </div>
            <div data-hero-chip className="panel-2 px-3 py-2 shadow-md">
              <p className="eyebrow text-[0.6rem] text-faint">This week</p>
              <p className="num display text-lg text-fg">3 / 3</p>
            </div>
          </div>

          <div className="absolute -right-2 bottom-8 md:-right-6">
            <div data-hero-chip className="panel-2 px-3 py-2 shadow-md">
              <Tag tone="lime">Live session tracking</Tag>
            </div>
          </div>
        </div>
      </div>

      <div
        data-hero-scroll
        className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 md:block"
        aria-hidden="true"
      >
        <ChevronDown className="size-5 text-faint" />
      </div>
    </section>
  );
}

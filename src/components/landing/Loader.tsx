import { useEffect, useRef } from 'react';
import { createTimeline, stagger } from 'animejs';
import { motionEnabled, prefersReducedSystem } from '@/lib/motion';

const BOOT_KEY = 'buhat:booted';

/**
 * True when this browser session should play the branded boot sequence.
 * One shot per session; never for reduced-motion users.
 */
export function bootingThisSession(): boolean {
  if (typeof window === 'undefined') return false;
  if (prefersReducedSystem()) return false;
  try {
    return !sessionStorage.getItem(BOOT_KEY);
  } catch {
    return false;
  }
}

interface LoaderProps {
  open: boolean;
  /** Fired once the curtain has fully lifted — the hero starts its entrance. */
  onDone(): void;
}

/**
 * Short branded boot animation, controlled by the landing page so the hero
 * entrance begins exactly as the curtain lifts. Content is never blocked by
 * it (reduced motion skips it entirely via bootingThisSession()).
 */
export function Loader({ open, onDone }: LoaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!open) return;
    try {
      sessionStorage.setItem(BOOT_KEY, '1');
    } catch {
      /* private mode — just don't show it again this session */
    }

    const root = rootRef.current;
    /* Safety net: never let a disabled-motion state strand the hero. */
    if (!root || !motionEnabled()) {
      doneRef.current();
      return;
    }

    const tl = createTimeline({ defaults: { ease: 'out(3)' } });
    tl.add('[data-loader-letter]', { translateY: ['115%', '0%'], duration: 520, delay: stagger(58) }, 0)
      .add('[data-loader-bar]', { scaleX: [0, 1], duration: 640, ease: 'inOut(2)' }, 100)
      .add('[data-loader-tagline]', { opacity: [0, 1], translateY: [8, 0], duration: 420 }, 420)
      .add(root, { translateY: ['0%', '-100%'], duration: 520, ease: 'inOut(2)' }, '+=140')
      .call(() => doneRef.current());

    return () => {
      tl.revert();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-bg"
    >
      <div className="flex items-center gap-1">
        {['B', 'U', 'H', 'A', 'T'].map((letter) => (
          <span key={letter} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em]">
            <span data-loader-letter className="display inline-block text-4xl text-fg md:text-5xl">
              {letter}
            </span>
          </span>
        ))}
      </div>
      <div className="h-[3px] w-40 overflow-hidden bg-line">
        <div data-loader-bar className="h-full origin-left bg-lime" />
      </div>
      <p data-loader-tagline className="eyebrow text-[0.6rem] text-faint">
        Train hard. Move forward.
      </p>
    </div>
  );
}

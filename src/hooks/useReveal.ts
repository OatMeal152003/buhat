import { useEffect, useLayoutEffect, useRef } from 'react';
import type { JSAnimation } from 'animejs';
import { animate, stagger } from 'animejs';
import { EASE, motionEnabled, playReveal, staggerIn, type RevealVariant } from '@/lib/motion';

/**
 * Scroll-triggered one-shot entrance for a single element.
 * The element is marked in a layout effect (before paint) so CSS can pre-hide
 * it when motion is allowed; it is revealed once it enters the viewport and
 * cleans up completely on unmount (Strict Mode safe).
 */
export function useReveal<T extends HTMLElement>(
  options: { variant?: RevealVariant; threshold?: number; delay?: number } = {},
) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!motionEnabled() || el.dataset.revealed === 'true') return;
    el.dataset.reveal = options.variant ?? el.dataset.reveal ?? 'up';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!motionEnabled() || el.dataset.revealed === 'true') return;

    let anim: JSAnimation | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();
          el.dataset.revealed = 'true';
          anim = playReveal(el, {
            variant: (el.dataset.reveal as RevealVariant) ?? 'up',
            delay: options.delay ?? 0,
          });
        }
      },
      { threshold: options.threshold ?? 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (anim) {
        anim.revert();
        delete el.dataset.revealed;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

/**
 * Staggered entrance for children of a container (e.g. card grids).
 * Children carry [data-stagger]; CSS pre-hides them while motion is enabled.
 * Pass `refreshKey` (e.g. a filter signature) to re-animate children that
 * remount after filtering — without it, remounted children would stay hidden.
 */
export function useStaggerReveal<T extends HTMLElement>(
  options: { step?: number; threshold?: number; refreshKey?: string | number } = {},
) {
  const ref = useRef<T | null>(null);
  const firstRefresh = useRef(true);
  const disposeRefresh = useRef<(() => void) | null>(null);

  const revealItems = (items: HTMLElement[]) =>
    animate(items, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 620,
      delay: stagger(options.step ?? 70),
      ease: EASE.out,
    });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!motionEnabled() || el.dataset.revealed === 'true') return;

    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-stagger]'));
    if (items.length === 0) return;

    let anim: JSAnimation | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();
          /* Another observer for the same container may have won the race. */
          if (el.dataset.revealed === 'true') return;
          el.dataset.revealed = 'true';
          anim = revealItems(items);
        }
      },
      { threshold: options.threshold ?? 0.1, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (anim) {
        anim.revert();
        delete el.dataset.revealed;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Refresh pass for filter/search changes. Two cases:
     1. Container still mounted (revealed): re-animate only children that just
        remounted (no inline opacity yet) — fast, never blocks clicks.
     2. Container itself remounted (zero results → EmptyState → results back):
        arm a fresh one-shot entrance, otherwise new cards stay CSS-hidden
        forever since the original observer already disconnected. */
  useEffect(() => {
    if (firstRefresh.current) {
      firstRefresh.current = false;
      return;
    }
    disposeRefresh.current?.();
    disposeRefresh.current = null;

    const el = ref.current;
    if (!el || !motionEnabled()) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-stagger]'));
    if (items.length === 0) return;

    if (el.dataset.revealed === 'true') {
      const fresh = items.filter((n) => n.style.opacity === '');
      const anim = staggerIn(fresh, { step: Math.min(options.step ?? 70, 48) });
      if (anim) disposeRefresh.current = () => anim.revert();
      return;
    }

    let anim: JSAnimation | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();
          if (el.dataset.revealed === 'true') return;
          el.dataset.revealed = 'true';
          anim = revealItems(items);
        }
      },
      { threshold: options.threshold ?? 0.1, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    disposeRefresh.current = () => {
      io.disconnect();
      if (anim) {
        anim.revert();
        delete el.dataset.revealed;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.refreshKey]);

  /* Dispose the last refresh observer/animation on unmount. */
  useEffect(() => () => disposeRefresh.current?.(), []);

  return ref;
}

/**
 * Grows [data-grow] children (chart bars) from the baseline once the
 * container first enters the viewport. CSS pre-hides them with scaleY(0).
 */
export function useGrowReveal<T extends HTMLElement>(
  options: { threshold?: number; step?: number } = {},
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!motionEnabled() || el.dataset.revealed === 'true') return;

    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-grow]'));
    if (items.length === 0) return;

    let anim: JSAnimation | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();
          el.dataset.revealed = 'true';
          anim = animate(items, {
            scaleY: [0, 1],
            duration: 640,
            delay: stagger(options.step ?? 60),
            ease: EASE.out,
          });
        }
      },
      { threshold: options.threshold ?? 0.25, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (anim) {
        anim.revert();
        delete el.dataset.revealed;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

import { animate, stagger } from 'animejs';

/**
 * Motion helpers for BUHAT.
 * Anime.js animates presentation only — application state always lives in React.
 * Every helper is a no-op when motion is disabled so the app works without animation.
 */

export function prefersReducedSystem(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function motionEnabled(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.motion === 'on';
}

/** Keep the <html data-motion> flag in sync with user + system preference. */
export function syncMotionAttribute(prefersReduced: boolean): void {
  const on = !prefersReduced && !prefersReducedSystem();
  document.documentElement.dataset.motion = on ? 'on' : 'off';
}

export const EASE = {
  out: 'out(3)',
  outExpo: 'outExpo',
  inOutExpo: 'inOutExpo',
  inOut: 'inOut(2)',
} as const;

export type RevealVariant = 'up' | 'left' | 'scale' | 'fade';

/**
 * Play a one-shot entrance on an element that CSS has pre-hidden via [data-reveal].
 * Returns the animation so callers can revert it on unmount.
 */
export function playReveal(
  el: HTMLElement,
  options: { variant?: RevealVariant; delay?: number; duration?: number } = {},
) {
  const { variant = 'up', delay = 0, duration = 700 } = options;
  const from = {
    opacity: 0,
    translateX: variant === 'left' ? -24 : 0,
    translateY: variant === 'up' ? 24 : 0,
    scale: variant === 'scale' ? 1.06 : 1,
  };
  return animate(el, {
    ...from,
    opacity: 1,
    translateX: 0,
    translateY: 0,
    scale: 1,
    duration,
    delay,
    ease: EASE.out,
  });
}

/** Subtle press feedback used on primary controls. */
export function pressPulse(el: HTMLElement | null): void {
  if (!el || !motionEnabled()) return;
  animate(el, { scale: [1, 0.96, 1], duration: 220, ease: EASE.out });
}

/**
 * One-shot staggered entrance for a list of elements (filter results,
 * freshly mounted cards). Never blocks pointer input — opacity and
 * transform only. Returns null when motion is disabled or there is nothing
 * to animate, so callers can skip cleanup entirely.
 */
export function staggerIn(
  items: ArrayLike<HTMLElement>,
  options: { step?: number; duration?: number; y?: number; start?: number } = {},
) {
  if (!motionEnabled() || items.length === 0) return null;
  return animate(items, {
    opacity: [0, 1],
    translateY: [options.y ?? 14, 0],
    duration: options.duration ?? 420,
    delay: stagger(options.step ?? 45, { start: options.start ?? 0 }),
    ease: EASE.out,
  });
}

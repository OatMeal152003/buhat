import { useEffect, useRef, useState } from 'react';
import type { JSAnimation } from 'animejs';
import { animate } from 'animejs';
import { EASE, motionEnabled } from '@/lib/motion';

/**
 * Animate a number from its current value to a new target with Anime.js.
 * Returns the live display value; when motion is disabled it snaps to the target.
 */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(target);
  const proxy = useRef({ v: target });
  const animRef = useRef<JSAnimation | null>(null);

  useEffect(() => {
    if (!motionEnabled()) {
      proxy.current.v = target;
      setValue(target);
      return;
    }
    animRef.current?.revert();
    animRef.current = animate(proxy.current, {
      v: target,
      duration,
      ease: EASE.outExpo,
      onUpdate: () => setValue(proxy.current.v),
      onComplete: () => setValue(target),
    });
    return () => {
      animRef.current?.revert();
    };
  }, [target, duration]);

  return value;
}

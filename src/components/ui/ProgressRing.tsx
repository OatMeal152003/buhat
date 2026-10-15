import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { cn } from '@/lib/cn';
import { EASE, motionEnabled } from '@/lib/motion';

interface ProgressRingProps {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  /** Preformatted center content (e.g. "3 / 5"). */
  center?: string;
  color?: 'lime' | 'flame';
  className?: string;
  ariaLabel?: string;
}

/**
 * Animated SVG progress ring. The stroke animates from empty to the current
 * value with Anime.js and renders statically when motion is disabled.
 */
export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  center,
  color = 'lime',
  className,
  ariaLabel,
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement | null>(null);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    const target = circumference * (1 - clamped);
    if (!motionEnabled()) {
      circle.style.strokeDashoffset = String(target);
      return;
    }
    const anim = animate(circle, {
      strokeDashoffset: target,
      duration: 950,
      ease: EASE.outExpo,
    });
    return () => {
      anim.revert();
    };
  }, [clamped, circumference]);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label={ariaLabel ?? `${Math.round(clamped * 100)} percent complete`}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={stroke}
          />
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color === 'lime' ? 'var(--color-lime)' : 'var(--color-flame)'}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          {center ? (
            <span className="num display text-xl text-fg">{center}</span>
          ) : (
            <span className="num display text-2xl text-fg">{Math.round(clamped * 100)}%</span>
          )}
        </div>
      </div>
      {(label || sublabel) && (
        <div className="text-center">
          {label && <div className="eyebrow text-[0.65rem] text-muted">{label}</div>}
          {sublabel && <div className="mt-1 text-xs text-faint">{sublabel}</div>}
        </div>
      )}
    </div>
  );
}

import { cn } from '@/lib/cn';

/**
 * BUHAT identity: a geometric chevron mark (progress / lift path) paired with
 * the bold wordmark. Uses currentColor so it inverts cleanly on any surface.
 */

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('size-8', className)}
      fill="none"
    >
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="5"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <path
        d="M9 20.5 16 9.5l7 11"
        stroke="var(--color-lime)"
        strokeWidth="3.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path d="M11.8 24.2h8.4" stroke="var(--color-lime)" strokeWidth="2.6" strokeLinecap="square" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  /** Hide the wordmark and show only the mark (compact navigation). */
  markOnly?: boolean;
  /** Accessible label override; defaults to "BUHAT home". */
  label?: string;
}

export function Logo({ className, markOnly = false, label = 'BUHAT home' }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-fg', className)} aria-label={label} role="img">
      <LogoMark className="size-7 shrink-0" />
      {!markOnly && (
        <span className="display text-xl leading-none tracking-[0.14em] text-fg">BUHAT</span>
      )}
    </span>
  );
}

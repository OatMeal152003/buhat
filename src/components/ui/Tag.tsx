import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'lime' | 'flame' | 'solid';

const tones: Record<Tone, string> = {
  neutral: 'border-line2 text-muted',
  lime: 'border-lime/40 bg-lime/10 text-lime',
  flame: 'border-flame/40 bg-flame/10 text-flame',
  solid: 'border-transparent bg-lime text-ink font-bold',
};

export function Tag({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

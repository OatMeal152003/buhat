import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/cn';

interface StatBlockProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  sub?: string;
  accent?: boolean;
  className?: string;
}

/** Animated statistic: counts up from zero when it enters the viewport. */
export function StatBlock({
  label,
  value,
  format = (n) => Math.round(n).toString(),
  sub,
  accent = false,
  className,
}: StatBlockProps) {
  const animated = useCountUp(value);
  return (
    <div
      data-stagger
      className={cn('border-l-2 border-line pl-4', accent && 'border-l-lime', className)}
    >
      <div className="eyebrow text-[0.65rem] text-muted">{label}</div>
      <div className={cn('num display mt-2 text-3xl md:text-4xl', accent ? 'text-lime' : 'text-fg')}>
        {format(animated)}
      </div>
      {sub && <div className="mt-1.5 text-xs text-faint">{sub}</div>}
    </div>
  );
}

import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { pressPulse } from '@/lib/motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group focus-ring inline-flex select-none items-center justify-center gap-2 font-semibold uppercase tracking-[0.12em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45';

const variants: Record<Variant, string> = {
  primary:
    'bg-lime text-ink hover:bg-limebright active:bg-limedim border border-transparent',
  secondary:
    'border border-line2 bg-transparent text-fg hover:border-lime hover:text-lime active:bg-surface2',
  ghost: 'border border-transparent bg-transparent text-muted hover:text-fg',
  danger: 'border border-danger/60 bg-transparent text-danger hover:bg-danger hover:text-ink',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-3.5 py-2 text-xs',
  md: 'min-h-12 px-5 py-2.5 text-sm',
  lg: 'min-h-14 px-7 py-3.5 text-sm',
};

export const buttonClasses = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cn(base, variants[variant], sizes[size], className);

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className, children, ref, ...rest }: ButtonProps & { ref?: Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={ref}
      type="button"
      className={buttonClasses(variant, size, className)}
      onPointerDown={(e) => pressPulse(e.currentTarget)}
      {...rest}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentPropsWithoutRef<'a'> {
  to: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  /** In-app navigation via router; hash links on the landing page use plain anchors. */
  reloadDocument?: boolean;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const isHash = to.startsWith('#') || to.startsWith('/#');
  if (isHash) {
    return (
      <a
        href={to}
        className={buttonClasses(variant, size, className)}
        onPointerDown={(e) => pressPulse(e.currentTarget)}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      to={to}
      className={buttonClasses(variant, size, className)}
      onPointerDown={(e) => pressPulse(e.currentTarget)}
      {...rest}
    >
      {children}
    </Link>
  );
}

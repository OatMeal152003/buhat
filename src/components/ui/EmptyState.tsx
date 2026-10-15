import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}

/** Never leave a screen blank: explain why it is empty and offer the next step. */
export function EmptyState({ icon: Icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={`rise-in slashes panel flex flex-col items-center gap-3 px-6 py-12 text-center ${className ?? ''}`}
    >
      <Icon className="size-7 text-faint" aria-hidden="true" />
      <h3 className="display text-lg text-fg">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

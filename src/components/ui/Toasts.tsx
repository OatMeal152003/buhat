import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Trophy, Info, X } from 'lucide-react';
import type { Toast } from '@/store/AppStore';
import { EASE, motionEnabled } from '@/lib/motion';

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss(id: string): void }) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const leavingRef = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el || !motionEnabled()) return;
    const anim = animate(el, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 420,
      ease: EASE.out,
    });
    return () => {
      anim.revert();
    };
  }, []);

  /* Manual dismiss exits smoothly, then hands off to the store. Auto-dismiss
     (store timer) removes immediately — that path must never be delayed. */
  const dismiss = () => {
    if (leavingRef.current) return;
    const el = elRef.current;
    if (!el || !motionEnabled()) {
      onDismiss(toast.id);
      return;
    }
    leavingRef.current = true;
    el.style.pointerEvents = 'none';
    animate(el, {
      opacity: 0,
      translateX: 24,
      duration: 260,
      ease: 'in(2)',
      onComplete: () => onDismiss(toast.id),
    });
  };

  const Icon = toast.kind === 'achievement' ? Trophy : Info;

  return (
    <div
      ref={elRef}
      data-toast
      role="status"
      className={`panel pointer-events-auto flex w-full max-w-sm items-start gap-3 p-4 shadow-lg ${
        toast.kind === 'achievement' ? 'border-l-2 border-l-lime' : ''
      }`}
    >
      <Icon
        className={`mt-0.5 size-5 shrink-0 ${toast.kind === 'achievement' ? 'text-lime' : 'text-muted'}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-fg">
          {toast.kind === 'achievement' ? 'Achievement unlocked — ' : ''}
          {toast.title}
        </p>
        {toast.body && <p className="mt-0.5 text-xs leading-relaxed text-muted">{toast.body}</p>}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="focus-ring -m-2.5 flex size-11 items-center justify-center text-faint transition-colors hover:text-fg"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastHost({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss(id: string): void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { animate, type JSAnimation } from 'animejs';
import { Button } from '@/components/ui/Button';
import { EASE, motionEnabled } from '@/lib/motion';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm(): void;
  onCancel(): void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible confirmation modal: focus trap, Escape to close, focus restore,
 * plus Anime.js entrance (backdrop fade + panel rise) and exit choreography —
 * the deferred action fires only once the panel has fully left, and runs
 * synchronously when motion is disabled.
 */
export function ConfirmationDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const closingRef = useRef(false);
  const pendingRef = useRef<(() => void) | null>(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  /* DOM presence: kept alive through the exit animation after `open` flips off. */
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useLayoutEffect(() => {
    if (open) {
      setMounted(true);
      closingRef.current = false;
      setClosing(false);
    }
  }, [open]);

  /* Safety net for closes that bypass requestClose (parent flips `open` itself). */
  useEffect(() => {
    if (!open && mounted) setMounted(false);
  }, [open, mounted]);

  /* Entrance — deliberately does not depend on `closing` so the exit animation
     starts from the settled state instead of a reverted (hidden) one. */
  useEffect(() => {
    if (!open || !mounted || !motionEnabled()) return;
    const anims: JSAnimation[] = [];
    const backdrop = backdropRef.current;
    const panel = dialogRef.current;
    if (backdrop) anims.push(animate(backdrop, { opacity: [0, 1], duration: 240, ease: EASE.out }));
    if (panel) {
      anims.push(
        animate(panel, {
          opacity: [0, 1],
          translateY: [16, 0],
          scale: [0.96, 1],
          duration: 340,
          ease: EASE.out,
        }),
      );
    }
    return () => {
      anims.forEach((a) => a.revert());
    };
  }, [open, mounted]);

  /* Exit — then the deferred action runs so users watch the dialog leave. */
  useEffect(() => {
    if (!closing) return;
    const finish = () => {
      if (!closingRef.current) return;
      closingRef.current = false;
      setClosing(false);
      setMounted(false);
      const action = pendingRef.current;
      pendingRef.current = null;
      action?.();
    };

    const panel = dialogRef.current;
    if (!motionEnabled() || !panel) {
      finish();
      return;
    }

    const backdrop = backdropRef.current;
    const anims: JSAnimation[] = [];
    if (backdrop) anims.push(animate(backdrop, { opacity: 0, duration: 260, ease: 'in(2)' }));
    anims.push(
      animate(panel, {
        opacity: 0,
        translateY: [-12, 0],
        scale: [1, 0.97],
        duration: 260,
        ease: 'in(2)',
        onComplete: finish,
      }),
    );
    return () => {
      anims.forEach((a) => a.revert());
    };
  }, [closing]);

  const requestClose = useCallback(
    (action: () => void) => {
      if (!open || closingRef.current) return;
      if (!motionEnabled()) {
        action();
        return;
      }
      pendingRef.current = action;
      closingRef.current = true;
      setClosing(true);
    },
    [open],
  );

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose(onCancelRef.current);
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreRef.current?.focus?.();
    };
  }, [open, requestClose]);

  if (!open && !mounted) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div
        ref={backdropRef}
        data-modal-backdrop
        className="absolute inset-0 bg-ink/80"
        onClick={() => requestClose(onCancelRef.current)}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        data-modal-panel
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="panel relative w-full max-w-md p-6 shadow-lg"
      >
        <h2 id="confirm-title" className="display text-xl text-fg">
          {title}
        </h2>
        {body && <div className="mt-3 text-sm leading-relaxed text-muted">{body}</div>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            ref={cancelRef}
            variant="secondary"
            size="sm"
            onClick={() => requestClose(onCancelRef.current)}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            size="sm"
            onClick={() => requestClose(onConfirm)}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

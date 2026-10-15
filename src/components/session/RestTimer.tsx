import { FastForward, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RestTimerProps {
  remainingSec: number;
  totalSec: number;
  paused: boolean;
  onSkip(): void;
  onExtend(sec: number): void;
  onResume(): void;
}

/**
 * Rest countdown driven by timestamps (via the parent session state).
 * The progress bar eases toward its true width with a CSS transition while the
 * numbers always come from the clock, so background tabs stay accurate.
 */
export function RestTimer({ remainingSec, totalSec, paused, onSkip, onExtend, onResume }: RestTimerProps) {
  const ratio = totalSec > 0 ? Math.max(0, Math.min(1, remainingSec / totalSec)) : 0;

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`Rest: ${remainingSec} seconds remaining`}
      className="panel-2 flex flex-col gap-4 border-l-2 border-l-lime p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-[0.6rem] text-lime">Rest period</p>
          <p className="num display mt-1 text-4xl text-fg md:text-5xl">
            {mm}:{ss}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="secondary" onClick={() => onExtend(15)}>
            +15s
          </Button>
          <Button size="sm" onClick={onSkip}>
            <FastForward className="size-3.5" aria-hidden="true" /> Skip rest
          </Button>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden bg-line" aria-hidden="true">
        <div
          className="h-full origin-left bg-lime transition-[width] duration-200 ease-linear motion-reduce:transition-none"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      {paused && (
        <Button size="sm" variant="secondary" onClick={onResume} className="self-start">
          <Play className="size-3.5" aria-hidden="true" /> Resume timer
        </Button>
      )}
      {!paused && (
        <p className="text-xs text-faint">
          Next set starts when you skip or the timer ends.
        </p>
      )}
    </div>
  );
}

export function PauseBadge({ onResume }: { onResume(): void }) {
  return (
    <div className="rise-in panel flex items-center justify-between gap-4 border-l-2 border-l-flame p-4">
      <div className="flex items-center gap-3">
        <Pause className="size-5 text-flame" aria-hidden="true" />
        <div>
          <p className="text-sm font-bold text-fg">Workout paused</p>
          <p className="text-xs text-muted">Timers are frozen. Resume when you are ready.</p>
        </div>
      </div>
      <Button size="sm" onClick={onResume}>
        <Play className="size-3.5" aria-hidden="true" /> Resume
      </Button>
    </div>
  );
}

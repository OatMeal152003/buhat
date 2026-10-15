import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Award, Flame, Mountain, Shield, Target, Timer, Trophy, Zap, Lock } from 'lucide-react';
import type { AchievementDef } from '@/types';
import { formatDate } from '@/lib/format';
import { EASE, motionEnabled } from '@/lib/motion';
import { cn } from '@/lib/cn';

const ICONS = {
  flame: Flame,
  trophy: Trophy,
  zap: Zap,
  target: Target,
  shield: Shield,
  mountain: Mountain,
  timer: Timer,
} as const;

interface AchievementCardProps {
  def: AchievementDef;
  unlockedAt?: number;
  current?: number;
  goal?: number;
  animateUnlock?: boolean;
}

export function AchievementCard({ def, unlockedAt, current, goal, animateUnlock = true }: AchievementCardProps) {
  const cardRef = useRef<HTMLLIElement | null>(null);
  const burstRef = useRef<HTMLSpanElement | null>(null);
  const unlocked = unlockedAt != null;
  const Icon = ICONS[def.icon] ?? Award;
  const pct = unlocked ? 1 : goal && goal > 0 ? Math.min(1, (current ?? 0) / goal) : 0;

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !unlocked || !animateUnlock || !motionEnabled()) return;

    const anims = [
      animate(card, {
        borderColor: ['var(--color-lime)', 'var(--color-line)'],
        duration: 1400,
        ease: 'inOut(2)',
        /* Release the inline border color when done so the unlocked card's
           lime left border (border-l-lime) is restored instead of being
           overwritten by the flash's end value. */
        onComplete: () => card.style.removeProperty('border-color'),
      }),
    ];

    /* Full celebration only for achievements earned in the last 15s (i.e. by
       the session just finished) — no fireworks replayed on every visit. */
    const fresh = unlockedAt != null && Date.now() - unlockedAt < 15_000;
    if (fresh) {
      anims.push(animate(card, { scale: [1, 1.05, 1], duration: 640, ease: EASE.out }));
      const burst = burstRef.current;
      if (burst) {
        anims.push(
          animate(burst, { opacity: [0.9, 0], scale: [0.85, 1.35], duration: 900, ease: 'out(2)' }),
        );
      }
    }

    return () => {
      anims.forEach((a) => a.revert());
    };
  }, [unlocked, animateUnlock, unlockedAt]);

  return (
    <li
      ref={cardRef}
      data-stagger
      className={cn(
        'panel relative flex flex-col gap-3 p-5',
        unlocked ? 'border-l-2 border-l-lime' : 'opacity-90',
      )}
    >
      {unlocked && (
        <span
          ref={burstRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 border-2 border-lime opacity-0"
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'grid size-10 shrink-0 place-items-center border',
            unlocked ? 'border-lime/50 bg-lime/10 text-lime' : 'border-line2 text-faint',
          )}
          aria-hidden="true"
        >
          {unlocked ? <Icon className="size-5" /> : <Lock className="size-4" />}
        </span>
        <span
          className={cn(
            'eyebrow text-[0.6rem]',
            unlocked ? 'text-lime' : 'text-faint',
          )}
        >
          {unlocked ? 'Unlocked' : 'Locked'}
        </span>
      </div>

      <div>
        <h3 className={cn('display text-base', unlocked ? 'text-fg' : 'text-muted')}>{def.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">{def.description}</p>
      </div>

      {!unlocked && goal != null && (
        <div className="mt-auto">
          <div className="h-1.5 w-full overflow-hidden bg-line" aria-hidden="true">
            <div className="h-full bg-lime/70" style={{ width: `${Math.round(pct * 100)}%` }} />
          </div>
          <p className="num mt-1.5 text-[0.65rem] text-faint">
            {Math.min(current ?? 0, goal)} / {goal}
          </p>
        </div>
      )}

      {unlocked && (
        <p className="mt-auto text-[0.65rem] uppercase tracking-[0.12em] text-faint">
          Earned {formatDate(unlockedAt)}
        </p>
      )}
    </li>
  );
}

import { useMemo } from 'react';
import { Award } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { ACHIEVEMENTS } from '@/data/achievements';
import { AchievementCard } from '@/components/progress/AchievementCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { currentStreak, sessionsThisWeek, totalSetsLogged } from '@/lib/stats';
import { useStaggerReveal } from '@/hooks/useReveal';

export function AchievementsPage() {
  const { data } = useApp();
  const gridRef = useStaggerReveal<HTMLUListElement>({ step: 70 });

  const sessions = data.sessions;
  const streak = useMemo(() => currentStreak(sessions), [sessions]);
  const weekSessions = useMemo(() => sessionsThisWeek(sessions), [sessions]);
  const sets = useMemo(() => totalSetsLogged(sessions), [sessions]);

  const progressFor = (id: string): { current: number; goal: number } | undefined => {
    switch (id) {
      case 'first-workout':
        return { current: sessions.length, goal: 1 };
      case 'five-workouts':
        return { current: sessions.length, goal: 5 };
      case 'ten-workouts':
        return { current: sessions.length, goal: 10 };
      case 'streak-7':
        return { current: streak, goal: 7 };
      case 'pr-achieved':
        return { current: data.prEvents.length, goal: 1 };
      case 'weekly-goal':
        return { current: weekSessions, goal: data.prefs.weeklyGoal };
      case 'fifty-sets':
        return { current: sets, goal: 50 };
      default:
        return undefined;
    }
  };

  const unlockedCount = ACHIEVEMENTS.filter((a) =>
    data.achievements.some((u) => u.id === a.id),
  ).length;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-8">
        <div>
          <p className="eyebrow text-lime">Milestones</p>
          <h1 className="display mt-3 text-[clamp(1.9rem,5vw,3rem)] text-fg">Achievements</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">
            Every milestone unlocks through verified events in your logbook — completed workouts,
            streaks and personal records. No milestones are awarded for estimates.
          </p>
        </div>
        <ProgressRing
          value={unlockedCount / ACHIEVEMENTS.length}
          size={116}
          stroke={9}
          center={`${unlockedCount}/${ACHIEVEMENTS.length}`}
          label="Unlocked"
          ariaLabel={`${unlockedCount} of ${ACHIEVEMENTS.length} achievements unlocked`}
        />
      </header>

      {unlockedCount === 0 && (
        <div className="panel flex items-center gap-4 border-l-2 border-l-lime p-5">
          <Award className="size-6 shrink-0 text-lime" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted">
            Your first achievement, <span className="font-bold text-fg">First Rep Forward</span>,
            unlocks the moment you complete a tracked workout.
          </p>
        </div>
      )}

      <ul ref={gridRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((def) => {
          const unlock = data.achievements.find((u) => u.id === def.id);
          const progress = progressFor(def.id);
          return (
            <AchievementCard
              key={def.id}
              def={def}
              unlockedAt={unlock?.unlockedAt}
              current={progress?.current}
              goal={unlock ? undefined : progress?.goal}
            />
          );
        })}
      </ul>
    </div>
  );
}

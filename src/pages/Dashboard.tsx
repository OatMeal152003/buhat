import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  Flame,
  Play,
  RotateCcw,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { WORKOUTS, getWorkout } from '@/data/workouts';
import { ACHIEVEMENTS } from '@/data/achievements';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { SmartImage } from '@/components/ui/SmartImage';
import { StatBlock } from '@/components/ui/StatBlock';
import { Tag } from '@/components/ui/Tag';
import { EmptyState } from '@/components/ui/EmptyState';
import { useReveal, useStaggerReveal } from '@/hooks/useReveal';
import {
  currentStreak,
  estimatedKcalTotal,
  minutesThisWeek,
  sessionsThisWeek,
  totalMinutes,
} from '@/lib/stats';
import { DAY_LABELS, dayKeyOf, greeting, relativeDay } from '@/lib/format';
import { difficultyTone } from '@/lib/tones';

const GOAL_CATEGORY: Record<string, string> = {
  strength: 'strength',
  muscle: 'hypertrophy',
  'fat loss': 'fat loss',
  endurance: 'cardio',
  mobility: 'mobility',
};

export function Dashboard() {
  const { data, activePlan, actions } = useApp();
  const navigate = useNavigate();
  const headerRef = useReveal<HTMLElement>({ variant: 'up' });
  const featureRef = useReveal<HTMLElement>({ variant: 'scale', threshold: 0.1 });
  const statsRef = useStaggerReveal<HTMLDivElement>();
  const lowerRef = useStaggerReveal<HTMLDivElement>();

  const todayKey = dayKeyOf(new Date());
  const todayPlanDay = activePlan?.days[todayKey] ?? null;

  const recommended = useMemo(() => {
    const category = GOAL_CATEGORY[data.profile.goal] ?? 'strength';
    const byGoal = WORKOUTS.filter((w) => w.categories.includes(category as never));
    const levelMatch =
      byGoal.find((w) => w.difficulty === data.profile.level) ?? byGoal[0] ?? WORKOUTS[0];
    return levelMatch;
  }, [data.profile.goal, data.profile.level]);

  const assignedToday =
    todayPlanDay?.type === 'workout' ? getWorkout(todayPlanDay.workoutId ?? '') ?? null : null;
  const todayCustom = todayPlanDay?.type === 'workout' && todayPlanDay.custom?.length
    ? todayPlanDay.custom
    : null;
  const featureWorkout = assignedToday ?? recommended;

  const streak = useMemo(() => currentStreak(data.sessions), [data.sessions]);
  const weekSessions = useMemo(() => sessionsThisWeek(data.sessions), [data.sessions]);
  const weekMinutes = useMemo(() => minutesThisWeek(data.sessions), [data.sessions]);
  const kcal = useMemo(() => estimatedKcalTotal(data.sessions), [data.sessions]);
  const goalPct = Math.min(1, weekSessions / Math.max(1, data.prefs.weeklyGoal));

  /* Days trained this week (Mon..Sun). */
  const weekDays = useMemo(() => {
    const now = new Date();
    const mondayIdx = (now.getDay() + 6) % 7;
    const today = new Date(now).setHours(0, 0, 0, 0);
    const trained = new Set(
      data.sessions.map((s) => new Date(s.startedAt).setHours(0, 0, 0, 0)),
    );
    return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((key, i) => {
      const date = today - (mondayIdx - i) * 86_400_000;
      return {
        key,
        trained: trained.has(date),
        isToday: i === mondayIdx,
        future: i > mondayIdx,
      };
    });
  }, [data.sessions]);

  const recentAchievements = data.achievements
    .slice()
    .sort((a, b) => b.unlockedAt - a.unlockedAt)
    .slice(0, 3);

  const nextPlanned = useMemo(() => {
    if (!activePlan) return null;
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const day = activePlan.days[dayKeyOf(d)];
      if (day?.type === 'workout') {
        const w = getWorkout(day.workoutId ?? '');
        return { key: dayKeyOf(d), day, workout: w ?? null, offset: i };
      }
    }
    return null;
  }, [activePlan]);

  const startFeature = () => {
    if (!assignedToday && todayCustom && todayCustom.length > 0) {
      actions.startFromPlanDay(
        { type: 'workout', custom: todayCustom },
        `${DAY_LABELS[todayKey]} custom session`,
      );
    } else {
      actions.startFromWorkout(featureWorkout);
    }
    navigate('/app/active');
  };

  const lastSession = data.sessions[0];

  return (
    <div className="space-y-12">
      {/* Header */}
      <section ref={headerRef} aria-labelledby="dash-title">
        <p className="eyebrow text-lime">
          {DAY_LABELS[todayKey]} · {activePlan ? activePlan.name : 'No plan selected'}
        </p>
        <h1 id="dash-title" className="display mt-3 text-[clamp(1.9rem,5vw,3rem)] text-fg">
          {greeting(data.profile.name)}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          {todayPlanDay?.type === 'workout'
            ? `Training day: your plan has ${assignedToday?.name ?? 'a custom session'} ready.`
            : todayPlanDay?.type === 'rest'
              ? 'Rest day on the plan. Recovery is part of the program.'
              : 'No workout assigned today — pick any session from the library.'}
        </p>

        {data.activeSession && (
          <div className="panel mt-6 flex flex-wrap items-center justify-between gap-4 border-l-2 border-l-lime p-4">
            <div className="flex items-center gap-3">
              <RotateCcw className="size-5 text-lime" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-fg">
                  Workout in progress: {data.activeSession.workoutName}
                </p>
                <p className="text-xs text-muted">Your session is saved. Jump back in anytime.</p>
              </div>
            </div>
            <ButtonLink to="/app/active" size="sm">
              Resume session{' '}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </ButtonLink>
          </div>
        )}
      </section>

      {/* Today's workout feature area */}
      <section ref={featureRef} aria-labelledby="today-title">
        <div className="panel relative grid overflow-hidden md:grid-cols-[1.1fr_1fr]">
          <div className="relative min-h-64">
            <SmartImage
              src={featureWorkout.image}
              alt={featureWorkout.imageAlt}
              className="absolute inset-0 h-full w-full"
              fallbackLabel={featureWorkout.name}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/30 to-surface" />
            <div className="absolute left-4 top-4 flex gap-2">
              <Tag tone={difficultyTone(featureWorkout.difficulty)}>{featureWorkout.difficulty}</Tag>
              {todayPlanDay?.type === 'workout' && assignedToday && <Tag tone="lime">From your plan</Tag>}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
            <div>
              <p className="eyebrow text-[0.65rem] text-muted">
                {todayPlanDay?.type === 'workout' ? "Today's planned session" : 'Recommended for you'}
              </p>
              <h2 id="today-title" className="display mt-2 text-2xl text-fg md:text-3xl">
                {featureWorkout.name}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted">{featureWorkout.description}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-faint">
              <span>{featureWorkout.durationMin} min</span>
              <span>{featureWorkout.exercises.length} exercises</span>
              <span>≈ {featureWorkout.estKcal} kcal (est.)</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button onClick={startFeature} size="lg">
                <Play className="size-4" aria-hidden="true" /> Start today's workout
              </Button>
              <ButtonLink to={`/app/workouts/${featureWorkout.id}`} variant="secondary">
                View details
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">
          Your training summary
        </h2>
        <div ref={statsRef} className="grid gap-8 border-y border-line py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div data-stagger className="flex items-center gap-5">
            <ProgressRing
              value={goalPct}
              size={92}
              stroke={8}
              center={`${weekSessions}/${data.prefs.weeklyGoal}`}
              ariaLabel={`${weekSessions} of ${data.prefs.weeklyGoal} weekly workouts completed`}
            />
            <div>
              <p className="eyebrow text-[0.6rem] text-muted">Weekly goal</p>
              <p className="display mt-1 text-lg text-fg">
                {goalPct >= 1 ? 'Goal crushed' : 'In progress'}
              </p>
              <p className="mt-1 text-xs text-faint">{weekMinutes} min trained this week</p>
            </div>
          </div>
          <div data-stagger>
            <StatBlock
              label="Workout streak"
              value={streak}
              format={(n) => `${Math.round(n)} ${Math.round(n) === 1 ? 'day' : 'days'}`}
              sub={streak > 0 ? 'Consecutive training days' : 'Start today to open the streak'}
              accent
            />
          </div>
          <div data-stagger>
            <StatBlock
              label="Sessions completed"
              value={data.sessions.length}
              sub={lastSession ? `Last: ${relativeDay(lastSession.startedAt)}` : 'No sessions yet'}
            />
          </div>
          <div data-stagger>
            <StatBlock
              label="Total training time"
              value={totalMinutes(data.sessions)}
              format={(n) => `${Math.round(n)} min`}
              sub={`≈ ${kcal.toLocaleString()} kcal (estimated)`}
            />
          </div>
        </div>
      </section>

      {/* Weekly progress + achievements + upcoming */}
      <div ref={lowerRef} className="grid gap-6 lg:grid-cols-3">
        <section data-stagger aria-labelledby="week-title" className="panel p-6">
          <h2 id="week-title" className="display text-lg text-fg">
            This week
          </h2>
          <ol className="mt-5 flex justify-between gap-1.5" aria-label="Days trained this week">
            {weekDays.map((d) => (
              <li key={d.key} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-faint">
                  {d.key.slice(0, 1).toUpperCase()}
                </span>
                <span
                  aria-hidden="true"
                  className={
                    d.trained
                      ? 'h-10 w-full bg-lime'
                      : d.isToday
                        ? 'h-10 w-full border border-dashed border-lime/70 bg-transparent'
                        : d.future
                          ? 'h-10 w-full bg-line/40'
                          : 'h-10 w-full bg-line'
                  }
                />
                <span className="sr-only">
                  {DAY_LABELS[d.key]}: {d.trained ? 'trained' : d.isToday ? 'today, not trained yet' : 'no session'}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-faint">
            {weekSessions === 0
              ? 'No sessions logged yet this week.'
              : `${weekSessions} session${weekSessions === 1 ? '' : 's'} logged. Keep it moving.`}
          </p>
        </section>

        <section data-stagger aria-labelledby="ach-title" className="panel p-6">
          <div className="flex items-center justify-between">
            <h2 id="ach-title" className="display text-lg text-fg">
              Recent achievements
            </h2>
            <Link
              to="/app/achievements"
              className="focus-ring text-xs font-semibold uppercase tracking-[0.12em] text-lime hover:underline"
            >
              View all
            </Link>
          </div>
          {recentAchievements.length === 0 ? (
            <div className="mt-4 flex flex-col items-start gap-2">
              <Trophy className="size-5 text-faint" aria-hidden="true" />
              <p className="text-sm text-muted">
                Milestones unlock through completed workouts, streaks and personal records.
              </p>
              <p className="text-xs text-faint">
                {ACHIEVEMENTS.length} achievements available.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentAchievements.map((unlock) => {
                const def = ACHIEVEMENTS.find((a) => a.id === unlock.id);
                if (!def) return null;
                return (
                  <li key={unlock.id} className="flex items-start gap-3 border-t border-line pt-3 first:border-t-0 first:pt-0">
                    <Trophy className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold text-fg">{def.title}</p>
                      <p className="text-xs text-muted">{relativeDay(unlock.unlockedAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section data-stagger aria-labelledby="upcoming-title" className="panel p-6">
          <h2 id="upcoming-title" className="display text-lg text-fg">
            Upcoming
          </h2>
          {nextPlanned ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lime">
                {nextPlanned.offset === 1 ? 'Tomorrow' : DAY_LABELS[nextPlanned.key]}
              </p>
              <p className="display mt-2 text-lg text-fg">
                {nextPlanned.workout?.name ?? 'Custom session'}
              </p>
              <p className="mt-2 text-sm text-muted">
                {nextPlanned.workout
                  ? `${nextPlanned.workout.durationMin} min · ${nextPlanned.workout.difficulty}`
                  : 'Built in the planner'}
              </p>
              <div className="mt-4">
                <ButtonLink to="/app/planner" variant="secondary" size="sm">
                  <CalendarClock className="size-4" aria-hidden="true" /> Open planner
                </ButtonLink>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Nothing scheduled next. Assign workouts in the planner or train from the library.
            </p>
          )}

          <div className="mt-6 border-t border-line pt-5">
            <ButtonLink to="/app/progress" variant="ghost" size="sm">
              <Zap className="size-4" aria-hidden="true" /> See progress analytics
            </ButtonLink>
          </div>
        </section>
      </div>

      {/* Quick start */}
      {data.sessions.length === 0 && !data.activeSession && (
        <EmptyState
          icon={Flame}
          title="Your logbook is empty"
          body="Nothing is simulated here — every stat on this dashboard comes from workouts you actually complete. Start your first session and watch this page come alive."
          action={
            <Button onClick={startFeature}>
              <Timer className="size-4" aria-hidden="true" /> Quick start: {featureWorkout.name}
            </Button>
          }
        />
      )}
    </div>
  );
}

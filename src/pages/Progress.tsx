import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Dumbbell, Plus, Scale, Trash2, Trophy, TrendingUp } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { getExercise } from '@/data/exercises';
import { ACHIEVEMENTS } from '@/data/achievements';
import { GOALS_LIST } from '@/lib/constants';
import {
  currentStreak,
  estimatedKcalTotal,
  exerciseHistory,
  minutesThisWeek,
  personalRecords,
  sessionsThisWeek,
  totalMinutes,
  totalSetsLogged,
  weeklyBuckets,
  dailyMinutesLast7,
} from '@/lib/stats';
import { WeeklyChart } from '@/components/progress/WeeklyChart';
import { StrengthChart } from '@/components/progress/StrengthChart';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { StatBlock } from '@/components/ui/StatBlock';
import { Button } from '@/components/ui/Button';
import { SelectField, NumberField } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tag } from '@/components/ui/Tag';
import { useGrowReveal, useStaggerReveal } from '@/hooks/useReveal';
import {
  DAY_SHORT,
  dayKeyOf,
  formatDateShort,
  relativeDay,
  toDisplayWeight,
  toKg,
  weightUnitLabel,
} from '@/lib/format';

export function ProgressPage() {
  const { data, actions, notify } = useApp();
  const statsRef = useStaggerReveal<HTMLDivElement>();
  const panelsRef = useStaggerReveal<HTMLDivElement>({ step: 90 });
  const dailiesRef = useGrowReveal<HTMLOListElement>();

  const units = data.prefs.units;
  const sessions = data.sessions;

  const buckets = useMemo(() => weeklyBuckets(sessions, 8), [sessions]);
  const weekSessions = useMemo(() => sessionsThisWeek(sessions), [sessions]);
  const weekMinutes = useMemo(() => minutesThisWeek(sessions), [sessions]);
  const streak = useMemo(() => currentStreak(sessions), [sessions]);
  const prs = useMemo(() => personalRecords(sessions), [sessions]);

  /* Exercises with recorded history, most data first. */
  const trackedExercises = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of sessions) {
      for (const e of s.exercises) {
        if (e.sets.length === 0) continue;
        counts.set(e.exerciseId, (counts.get(e.exerciseId) ?? 0) + e.sets.length);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [sessions]);

  const [selectedExercise, setSelectedExercise] = useState(
    trackedExercises[0]?.[0] ?? 'bench-press',
  );
  const [metric, setMetric] = useState<'weight' | 'e1rm'>('e1rm');
  const history = useMemo(
    () => exerciseHistory(sessions, selectedExercise),
    [sessions, selectedExercise],
  );

  const [bwInput, setBwInput] = useState('');
  const [goalInput, setGoalInput] = useState(String(data.prefs.weeklyGoal));
  const [profileGoal, setProfileGoal] = useState(data.profile.goal);

  const addWeight = () => {
    const v = parseFloat(bwInput);
    if (!Number.isFinite(v) || v <= 0) return;
    const kg = toKg(v, units);
    if (kg < 20 || kg > 400) return;
    actions.addBodyWeight(Math.round(kg * 10) / 10);
    setBwInput('');
    notify({ kind: 'info', title: 'Weight entry saved' });
  };

  const saveGoals = () => {
    const goal = Math.max(1, Math.min(14, parseInt(goalInput, 10) || 3));
    actions.updatePrefs({ weeklyGoal: goal });
    actions.updateProfile({ goal: profileGoal });
    setGoalInput(String(goal));
    notify({ kind: 'info', title: 'Goals updated', body: `${goal} sessions per week · ${profileGoal}` });
  };

  const last7 = useMemo(() => dailyMinutesLast7(sessions), [sessions]);
  const trainedToday = sessions.some(
    (s) => dayKeyOf(new Date(s.startedAt)) === dayKeyOf(new Date()),
  );
  const nextDayIdx = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(dayKeyOf(new Date())) + 1;

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow text-lime">Analytics</p>
        <h1 className="display mt-3 text-[clamp(1.9rem,5vw,3rem)] text-fg">Progress</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          Every number on this page is calculated from your own completed sessions — nothing here
          is simulated.
        </p>
      </header>

      {/* Headline stats */}
      <section aria-label="Training statistics">
        <div ref={statsRef} className="grid gap-8 border-y border-line py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div data-stagger className="flex items-center gap-5">
            <ProgressRing
              value={Math.min(1, weekSessions / Math.max(1, data.prefs.weeklyGoal))}
              size={92}
              stroke={8}
              center={`${weekSessions}/${data.prefs.weeklyGoal}`}
              ariaLabel={`${weekSessions} of ${data.prefs.weeklyGoal} weekly goal`}
            />
            <div>
              <p className="eyebrow text-[0.6rem] text-muted">Weekly goal</p>
              <p className="display mt-1 text-lg text-fg">{weekMinutes} min this week</p>
              <p className="mt-1 text-xs text-faint">
                {weekSessions >= data.prefs.weeklyGoal
                  ? 'Goal reached — extra work counts double.'
                  : `${data.prefs.weeklyGoal - weekSessions} session(s) to go`}
              </p>
            </div>
          </div>
          <div data-stagger>
            <StatBlock
              label="Current streak"
              value={streak}
              format={(n) => `${Math.round(n)} ${Math.round(n) === 1 ? 'day' : 'days'}`}
              sub={trainedToday ? 'Trained today' : nextDayIdx > 0 ? 'Train today to keep it alive' : ''}
              accent
            />
          </div>
          <div data-stagger>
            <StatBlock
              label="Completed workouts"
              value={sessions.length}
              sub={`${totalSetsLogged(sessions)} sets logged in total`}
            />
          </div>
          <div data-stagger>
            <StatBlock
              label="Total training time"
              value={totalMinutes(sessions)}
              format={(n) => `${Math.round(n)} min`}
              sub={`≈ ${estimatedKcalTotal(sessions).toLocaleString()} kcal (estimated)`}
            />
          </div>
        </div>
      </section>

      {sessions.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No training data yet"
          body="Complete your first tracked workout and this page will fill with weekly frequency, strength progression, personal records and your achievement timeline."
          action={
            <Link
              to="/app/workouts"
              className="focus-ring inline-flex min-h-12 items-center bg-lime px-5 text-sm font-semibold uppercase tracking-[0.12em] text-ink"
            >
              Start your first workout
            </Link>
          }
        />
      ) : (
        <div ref={panelsRef} className="grid gap-6 lg:grid-cols-2">
          {/* Weekly activity */}
          <section data-stagger aria-labelledby="weekly-title" className="panel p-5 md:p-6 lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="weekly-title" className="display text-lg text-fg">
                Weekly activity
              </h2>
              <p className="text-xs text-faint">
                Sessions per week · last {buckets.length} weeks · goal {data.prefs.weeklyGoal}/week
              </p>
            </div>
            <WeeklyChart buckets={buckets} goalPerWeek={data.prefs.weeklyGoal} />
          </section>

          {/* Strength progression */}
          <section data-stagger aria-labelledby="strength-title" className="panel p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="strength-title" className="display text-lg text-fg">
                Strength progression
              </h2>
              <div className="flex gap-2" role="group" aria-label="Metric">
                {(['e1rm', 'weight'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetric(m)}
                    aria-pressed={metric === m}
                    className={`focus-ring min-h-11 border px-3 text-[0.65rem] font-bold uppercase tracking-[0.1em] ${
                      metric === m ? 'border-lime text-lime' : 'border-line2 text-muted'
                    }`}
                  >
                    {m === 'e1rm' ? 'Est. 1RM' : 'Top set'}
                  </button>
                ))}
              </div>
            </div>

            {trackedExercises.length > 0 ? (
              <>
                <SelectField
                  label="Exercise"
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  options={trackedExercises.map(([id, count]) => ({
                    value: id,
                    label: `${getExercise(id)?.name ?? id} (${count} sets)`,
                  }))}
                  className="mb-5"
                />
                {history.length >= 2 ? (
                  <StrengthChart
                    points={history}
                    units={units}
                    exerciseName={getExercise(selectedExercise)?.name ?? selectedExercise}
                    metric={metric}
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-muted">
                    Log this exercise in one more session to see a trend line.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted">No exercises logged yet.</p>
            )}
          </section>

          {/* Personal records */}
          <section data-stagger aria-labelledby="prs-title" className="panel p-5 md:p-6">
            <h2 id="prs-title" className="display flex items-center gap-2 text-lg text-fg">
              <Trophy className="size-5 text-lime" aria-hidden="true" /> Personal records
            </h2>
            {prs.length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Records are based on estimated one-rep max from logged working sets (weight × reps).
                Add weight to your logged sets to set a record.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {prs.slice(0, 6).map((pr) => (
                  <li key={pr.exerciseId} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-fg">
                        {getExercise(pr.exerciseId)?.name ?? pr.exerciseId}
                      </p>
                      <p className="text-xs text-faint">
                        {toDisplayWeight(pr.weightKg, units)} {weightUnitLabel(units)} × {pr.reps} ·{' '}
                        {relativeDay(pr.date)}
                      </p>
                    </div>
                    <p className="num display text-lg text-lime">
                      {toDisplayWeight(Math.round(pr.e1rm), units)}
                      <span className="ml-1 text-xs text-faint">{weightUnitLabel(units)} e1RM</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Last 7 days */}
          <section data-stagger aria-labelledby="dailies-title" className="panel p-5 md:p-6">
            <h2 id="dailies-title" className="display text-lg text-fg">
              Last 7 days
            </h2>
            <ol ref={dailiesRef} className="mt-5 flex h-32 items-end gap-2" aria-label="Minutes trained per day">
              {last7.map((day) => {
                const maxMin = Math.max(60, ...last7.map((d) => d.minutes));
                return (
                  <li key={day.date} className="flex h-full flex-1 flex-col justify-end gap-1">
                    <span className="num text-center text-[0.6rem] text-muted">
                      {day.minutes > 0 ? day.minutes : ''}
                    </span>
                    <div
                      data-grow
                      className={`w-full ${day.minutes > 0 ? 'bg-lime' : 'bg-line'}`}
                      style={{ height: `${Math.max(3, (day.minutes / maxMin) * 100)}%` }}
                    />
                    <span className="text-center text-[0.6rem] uppercase tracking-[0.06em] text-faint">
                      {DAY_SHORT[dayKeyOf(new Date(day.date))].slice(0, 1)}
                    </span>
                  </li>
                );
              })}
            </ol>
            <ul className="sr-only">
              {last7.map((day) => (
                <li key={day.date}>
                  {formatDateShort(day.date)}: {day.minutes} minutes
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-faint">Minutes trained per day, from saved sessions.</p>
          </section>

          {/* Body weight */}
          <section data-stagger aria-labelledby="bw-title" className="panel p-5 md:p-6">
            <h2 id="bw-title" className="display flex items-center gap-2 text-lg text-fg">
              <Scale className="size-5 text-muted" aria-hidden="true" /> Body weight (optional)
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-faint">
              Tracked only if you want it. Entries stay on this device and are never required.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="w-36">
                <NumberField
                  label={`Weight (${weightUnitLabel(units)})`}
                  min={0}
                  step={0.5}
                  value={bwInput}
                  placeholder={String(toDisplayWeight(data.prefs.bodyWeightKg ?? 70, units))}
                  onChange={(e) => setBwInput(e.target.value)}
                />
              </div>
              <Button size="sm" onClick={addWeight} disabled={bwInput.trim() === ''}>
                <Plus className="size-4" aria-hidden="true" /> Log weight
              </Button>
            </div>

            {data.bodyWeight.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No entries yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {data.bodyWeight
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((entry) => (
                    <li key={entry.date} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="text-muted">{formatDateShort(entry.date)}</span>
                      <span className="flex items-center gap-3">
                        <span className="num font-semibold text-fg">
                          {toDisplayWeight(entry.kg, units)} {weightUnitLabel(units)}
                        </span>
                        <button
                          type="button"
                          onClick={() => actions.removeBodyWeight(entry.date)}
                          aria-label={`Delete weight entry from ${formatDateShort(entry.date)}`}
                          className="focus-ring -m-2.5 flex size-11 items-center justify-center text-faint hover:text-danger"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </button>
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          {/* Goals */}
          <section data-stagger aria-labelledby="goals-title" className="panel p-5 md:p-6">
            <h2 id="goals-title" className="display text-lg text-fg">
              Your goals
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Workouts per week"
                min={1}
                max={14}
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
              />
              <SelectField
                label="Fitness goal"
                value={profileGoal}
                onChange={(e) => setProfileGoal(e.target.value as typeof profileGoal)}
                options={GOALS_LIST.map((g) => ({ value: g, label: g }))}
              />
            </div>
            <div className="mt-4">
              <Button size="sm" onClick={saveGoals}>
                Save goals
              </Button>
            </div>
            <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-faint">
              Goal completion is measured in completed sessions against your weekly target. Streaks
              count consecutive calendar days with at least one session.
            </p>
          </section>

          {/* Achievement timeline */}
          <section data-stagger aria-labelledby="timeline-title" className="panel p-5 md:p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="timeline-title" className="display flex items-center gap-2 text-lg text-fg">
                <Award className="size-5 text-lime" aria-hidden="true" /> Achievement timeline
              </h2>
              <Link
                to="/app/achievements"
                className="focus-ring text-xs font-semibold uppercase tracking-[0.12em] text-lime hover:underline"
              >
                All achievements
              </Link>
            </div>
            {data.achievements.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                No milestones yet. Complete workouts to unlock your first achievement.
              </p>
            ) : (
              <ol className="mt-5 space-y-0">
                {data.achievements
                  .slice()
                  .sort((a, b) => b.unlockedAt - a.unlockedAt)
                  .map((unlock, i, list) => {
                    const def = ACHIEVEMENTS.find((a) => a.id === unlock.id);
                    return (
                      <li key={unlock.id} className="relative flex gap-4 pb-6 pl-1 last:pb-0">
                        {i < list.length - 1 && (
                          <span aria-hidden="true" className="absolute left-[7px] top-5 h-full w-px bg-line" />
                        )}
                        <span aria-hidden="true" className="mt-1.5 size-3.5 shrink-0 border-2 border-lime bg-bg" />
                        <div>
                          <p className="text-sm font-bold text-fg">{def?.title ?? unlock.id}</p>
                          <p className="text-xs text-faint">
                            {formatDateShort(unlock.unlockedAt)}
                            {def ? ` · ${def.description}` : ''}
                          </p>
                        </div>
                      </li>
                    );
                  })}
              </ol>
            )}
            <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
              <Tag tone="lime">
                <Dumbbell className="size-3" aria-hidden="true" /> {totalSetsLogged(sessions)} sets logged
              </Tag>
              <Tag tone="neutral">{sessions.length} sessions on record</Tag>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

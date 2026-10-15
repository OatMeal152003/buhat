import type { CompletedSession, PrEvent, SessionExercise } from '@/types';
import { startOfDay, startOfWeek } from '@/lib/format';

/** Epley estimated 1RM from a set. Used only for relative progression tracking. */
export function estimateE1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0) return 0;
  return weightKg * (1 + Math.min(reps, 15) / 30);
}

export function sessionDateKey(ts: number): number {
  return startOfDay(new Date(ts)).getTime();
}

/** Consecutive calendar days (ending today, or yesterday if today is empty) with a session. */
export function currentStreak(sessions: CompletedSession[], now = Date.now()): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => sessionDateKey(s.startedAt)));
  const today = sessionDateKey(now);
  let cursor = days.has(today) ? today : today - 86_400_000;
  if (!days.has(cursor)) return 0;
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 86_400_000;
  }
  return streak;
}

export function sessionsThisWeek(sessions: CompletedSession[], now = Date.now()): number {
  const weekStart = startOfWeek(new Date(now)).getTime();
  return sessions.filter((s) => s.startedAt >= weekStart).length;
}

export function minutesThisWeek(sessions: CompletedSession[], now = Date.now()): number {
  const weekStart = startOfWeek(new Date(now)).getTime();
  return Math.round(
    sessions
      .filter((s) => s.startedAt >= weekStart)
      .reduce((sum, s) => sum + s.durationSec, 0) / 60,
  );
}

export function totalMinutes(sessions: CompletedSession[]): number {
  return Math.round(sessions.reduce((sum, s) => sum + s.durationSec, 0) / 60);
}

export function totalSetsLogged(sessions: CompletedSession[]): number {
  return sessions.reduce((sum, s) => sum + s.totalSets, 0);
}

/** Sum of app-estimated kcal — always labeled EST by the UI. */
export function estimatedKcalTotal(sessions: CompletedSession[]): number {
  return Math.round(sessions.reduce((sum, s) => sum + s.estimatedKcal, 0));
}

export interface WeekBucket {
  weekStart: number;
  sessions: number;
  minutes: number;
}

/** Weekly buckets for the last `n` weeks, oldest first. */
export function weeklyBuckets(
  sessions: CompletedSession[],
  n = 8,
  now = Date.now(),
): WeekBucket[] {
  const current = startOfWeek(new Date(now));
  const buckets: WeekBucket[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(current);
    start.setDate(start.getDate() - i * 7);
    const end = start.getTime() + 7 * 86_400_000;
    const inWeek = sessions.filter(
      (s) => s.startedAt >= start.getTime() && s.startedAt < end,
    );
    buckets.push({
      weekStart: start.getTime(),
      sessions: inWeek.length,
      minutes: Math.round(inWeek.reduce((sum, s) => sum + s.durationSec, 0) / 60),
    });
  }
  return buckets;
}

export function dailyMinutesLast7(
  sessions: CompletedSession[],
  now = Date.now(),
): { date: number; minutes: number }[] {
  const out: { date: number; minutes: number }[] = [];
  const today = startOfDay(new Date(now)).getTime();
  for (let i = 6; i >= 0; i--) {
    const day = today - i * 86_400_000;
    const next = day + 86_400_000;
    const minutes = Math.round(
      sessions
        .filter((s) => s.startedAt >= day && s.startedAt < next)
        .reduce((sum, s) => sum + s.durationSec, 0) / 60,
    );
    out.push({ date: day, minutes });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Personal records                                                    */
/* ------------------------------------------------------------------ */

export interface ExerciseHistoryPoint {
  date: number;
  topWeightKg: number;
  topE1RM: number;
  volume: number;
}

export function exerciseHistory(
  sessions: CompletedSession[],
  exerciseId: string,
): ExerciseHistoryPoint[] {
  return sessions
    .filter((s) => s.exercises.some((e) => e.exerciseId === exerciseId))
    .sort((a, b) => a.startedAt - b.startedAt)
    .map((s) => {
      const ex = s.exercises.find((e) => e.exerciseId === exerciseId);
      const sets = ex?.sets ?? [];
      const topWeightKg = sets.reduce((max, set) => Math.max(max, set.weightKg ?? 0), 0);
      const topE1RM = sets.reduce(
        (max, set) => Math.max(max, estimateE1RM(set.weightKg ?? 0, set.reps)),
        0,
      );
      const volume = sets.reduce((sum, set) => sum + (set.weightKg ?? 0) * set.reps, 0);
      return { date: s.startedAt, topWeightKg, topE1RM, volume };
    });
}

export interface PersonalRecord {
  exerciseId: string;
  weightKg: number;
  reps: number;
  e1rm: number;
  date: number;
}

export function personalRecords(sessions: CompletedSession[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();
  for (const session of sessions) {
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        const e1rm = estimateE1RM(set.weightKg ?? 0, set.reps);
        const current = best.get(ex.exerciseId);
        if (!current || e1rm > current.e1rm) {
          best.set(ex.exerciseId, {
            exerciseId: ex.exerciseId,
            weightKg: set.weightKg ?? 0,
            reps: set.reps,
            e1rm,
            date: set.completedAt,
          });
        }
      }
    }
  }
  return [...best.values()].sort((a, b) => b.date - a.date);
}

/** New PR events produced by a finished session, relative to prior history. */
export function detectPrEvents(
  session: CompletedSession,
  priorSessions: CompletedSession[],
): PrEvent[] {
  const prior = new Map(
    personalRecords(priorSessions).map((pr) => [pr.exerciseId, pr.e1rm] as const),
  );
  const events: PrEvent[] = [];
  for (const ex of session.exercises) {
    for (const set of ex.sets) {
      const e1rm = estimateE1RM(set.weightKg ?? 0, set.reps);
      if (e1rm <= 0) continue;
      const previous = prior.get(ex.exerciseId) ?? 0;
      if (e1rm > previous) {
        prior.set(ex.exerciseId, e1rm);
        events.push({
          id: `pr-${ex.exerciseId}-${set.completedAt}`,
          exerciseId: ex.exerciseId,
          date: set.completedAt,
          weightKg: set.weightKg ?? 0,
          reps: set.reps,
          e1rm,
        });
      }
    }
  }
  return events;
}

export function exerciseNameOf(id: string, fallback: string): string {
  return fallback || id;
}

export function countSessionSets(session: CompletedSession): number {
  return session.exercises.reduce((sum, e) => sum + e.sets.length, 0);
}

export function activeExerciseSets(ex: SessionExercise): number {
  return ex.sets.filter((s) => s.completed).length;
}

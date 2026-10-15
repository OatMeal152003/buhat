import type {
  ActiveSession,
  CompletedSession,
  CompletedSessionExercise,
  NewSessionSource,
  PlanExercise,
  SessionExercise,
  WorkoutExercise,
  WorkoutTemplate,
} from '@/types';
import { getExercise } from '@/data/exercises';
import { uid } from '@/lib/format';

function toSessionExercise(
  item: WorkoutExercise | PlanExercise,
  order: number,
): SessionExercise | null {
  const ex = getExercise(item.exerciseId);
  if (!ex) return null;
  const sets = Array.from({ length: Math.max(1, Math.round(item.sets)) }, () => ({
    completed: false,
  }));
  return {
    exerciseId: ex.id,
    name: ex.name,
    targetSets: sets.length,
    targetReps: String(item.reps),
    weightKg: item.weightKg ?? null,
    restSec: item.restSec ?? ex.restSec,
    note: 'note' in item ? item.note : undefined,
    sets,
    done: false,
  };
}

export function buildSessionExercises(
  items: (WorkoutExercise | PlanExercise)[],
): SessionExercise[] {
  return items
    .map((item, i) => toSessionExercise(item, i))
    .filter((x): x is SessionExercise => x !== null);
}

export function createActiveSession(
  workout: WorkoutTemplate,
  source: NewSessionSource = 'library',
): ActiveSession {
  return {
    id: uid('session'),
    workoutId: workout.id,
    workoutName: workout.name,
    source,
    startedAt: Date.now(),
    status: 'active',
    timing: { accumulatedMs: 0, lastResumedAt: Date.now() },
    exerciseIndex: 0,
    setIndex: 0,
    exercises: buildSessionExercises(workout.exercises),
    rest: null,
  };
}

/** Session built from a planner day (custom exercise list). */
export function createCustomSession(
  name: string,
  items: PlanExercise[],
  workoutId = 'custom',
): ActiveSession {
  return {
    id: uid('session'),
    workoutId,
    workoutName: name,
    source: 'plan',
    startedAt: Date.now(),
    status: 'active',
    timing: { accumulatedMs: 0, lastResumedAt: Date.now() },
    exerciseIndex: 0,
    setIndex: 0,
    exercises: buildSessionExercises(items),
    rest: null,
  };
}

/** Elapsed session time derived from timestamps — accurate even in background tabs. */
export function elapsedMs(session: ActiveSession, now = Date.now()): number {
  const base = session.timing.accumulatedMs;
  const running = session.timing.lastResumedAt ?? 0;
  return base + (running ? Math.max(0, now - running) : 0);
}

export function pauseSession(session: ActiveSession, now = Date.now()): ActiveSession {
  if (session.status === 'paused') return session;
  return {
    ...session,
    status: 'paused',
    timing: {
      accumulatedMs: elapsedMs(session, now),
      lastResumedAt: null,
    },
    rest: session.rest?.running
      ? {
          ...session.rest,
          running: false,
          endAt: null,
          remainingSec: Math.max(0, Math.ceil(((session.rest.endAt ?? now) - now) / 1000)),
        }
      : session.rest,
  };
}

export function resumeSession(session: ActiveSession, now = Date.now()): ActiveSession {
  if (session.status === 'active') return session;
  return {
    ...session,
    status: 'active',
    timing: { accumulatedMs: session.timing.accumulatedMs, lastResumedAt: now },
    rest:
      session.rest && !session.rest.running && session.rest.remainingSec > 0
        ? { ...session.rest, running: true, endAt: now + session.rest.remainingSec * 1000 }
        : session.rest,
  };
}

/** Remaining rest seconds, computed from the end timestamp. */
export function restRemainingSec(session: ActiveSession, now = Date.now()): number {
  const rest = session.rest;
  if (!rest) return 0;
  if (rest.running && rest.endAt) return Math.max(0, Math.ceil((rest.endAt - now) / 1000));
  return Math.max(0, rest.remainingSec);
}

export function totalPlannedSets(session: ActiveSession): number {
  return session.exercises.reduce((sum, ex) => sum + ex.targetSets, 0);
}

export function completedSets(session: ActiveSession): number {
  return session.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0);
}

export interface FinishOptions {
  source: NewSessionSource;
  estKcalPerMin: number;
  partialAllowed: boolean;
}

/**
 * Convert the live session into an accurate completed record.
 * Only sets actually completed by the user are counted.
 */
export function finishSession(
  session: ActiveSession,
  options: FinishOptions,
  now = Date.now(),
): CompletedSession | null {
  const exercises: CompletedSessionExercise[] = session.exercises
    .map((ex) => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      sets: ex.sets
        .filter((s) => s.completed && s.completedAt != null)
        .map((s) => ({
          reps: s.reps ?? (parseInt(ex.targetReps, 10) || 0),
          weightKg: s.weightKg ?? null,
          completedAt: s.completedAt ?? now,
        })),
    }))
    .filter((ex) => ex.sets.length > 0);

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  if (totalSets === 0) return null; // nothing was actually completed — never fabricate a record

  const durationSec = Math.max(1, Math.round(elapsedMs(session, now) / 1000));
  const minutes = durationSec / 60;
  const completedExercises = exercises.length;

  return {
    id: session.id,
    workoutId: session.workoutId,
    workoutName: session.workoutName,
    source: options.source,
    startedAt: session.startedAt,
    endedAt: now,
    durationSec,
    status:
      completedExercises === session.exercises.filter((e) => e.sets.length > 0).length
        ? 'completed'
        : 'partial',
    exercises,
    totalSets,
    completedExercises,
    estimatedKcal: Math.round(minutes * options.estKcalPerMin),
  };
}

/** Estimated kcal/min for a workout, scaled by profile body weight (EST only). */
export function estKcalPerMin(
  template: { estKcal: number; durationMin: number } | undefined,
  bodyWeightKg: number | null,
): number {
  const base = template ? template.estKcal / Math.max(1, template.durationMin) : 7;
  const weightFactor = bodyWeightKg ? bodyWeightKg / 75 : 1;
  const scaled = base * Math.min(1.6, Math.max(0.6, weightFactor));
  return Math.round(scaled * 10) / 10;
}

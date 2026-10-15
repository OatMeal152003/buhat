import type {
  AchievementUnlock,
  AppData,
  BodyWeightEntry,
  CompletedSession,
  Equipment,
  Plan,
  PlanKey,
  PlanExercise,
  Prefs,
  PrEvent,
  Profile,
  ActiveSession,
} from '@/types';
import { getWorkout } from '@/data/workouts';
import { getExercise } from '@/data/exercises';
import { cloneTemplate } from '@/data/plans';
import { PLAN_TEMPLATES } from '@/data/plans';
import { DAY_KEYS } from '@/lib/format';

/**
 * Persistence layer.
 * Currently localStorage; every read goes through sanitization so corrupted or
 * outdated data degrades to safe defaults instead of crashing the UI.
 * Swap this module for an API client later without touching components.
 */

const STORAGE_KEY = 'buhat:data:v1';

export const DEFAULT_PROFILE: Profile = {
  name: '',
  goal: 'strength',
  level: 'beginner',
  location: 'gym',
  equipment: [],
  preferredDays: ['mon', 'wed', 'fri'],
  durationPref: 45,
};

export const DEFAULT_PREFS: Prefs = {
  units: 'kg',
  weeklyGoal: 3,
  reducedMotion: false,
  sound: true,
  bodyWeightKg: null,
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const asString = (v: unknown, fallback: string): string =>
  typeof v === 'string' ? v : fallback;

const asNumber = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;

const asBool = (v: unknown, fallback: boolean): boolean =>
  typeof v === 'boolean' ? v : fallback;

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

const GOALS = ['strength', 'muscle', 'fat loss', 'endurance', 'mobility'] as const;
const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const LOCATIONS = ['home', 'gym', 'outdoor'] as const;

function sanitizeProfile(v: unknown): Profile {
  const raw = isRecord(v) ? v : {};
  return {
    name: typeof raw.name === 'string' ? raw.name.slice(0, 40) : DEFAULT_PROFILE.name,
    goal: GOALS.includes(raw.goal as never) ? (raw.goal as Profile['goal']) : DEFAULT_PROFILE.goal,
    level: LEVELS.includes(raw.level as never)
      ? (raw.level as Profile['level'])
      : DEFAULT_PROFILE.level,
    location: LOCATIONS.includes(raw.location as never)
      ? (raw.location as Profile['location'])
      : DEFAULT_PROFILE.location,
    equipment: asArray(raw.equipment).filter(
      (x): x is Equipment => typeof x === 'string',
    ),
    preferredDays: asArray(raw.preferredDays).filter((x): x is PlanKey =>
      DAY_KEYS.includes(x as PlanKey),
    ),
    durationPref: Math.min(180, Math.max(10, asNumber(raw.durationPref, 45))),
  };
}

function sanitizePrefs(v: unknown): Prefs {
  const raw = isRecord(v) ? v : {};
  return {
    units: raw.units === 'lb' ? 'lb' : 'kg',
    weeklyGoal: Math.min(14, Math.max(1, Math.round(asNumber(raw.weeklyGoal, 3)))),
    reducedMotion: asBool(raw.reducedMotion, DEFAULT_PREFS.reducedMotion),
    sound: asBool(raw.sound, DEFAULT_PREFS.sound),
    bodyWeightKg:
      typeof raw.bodyWeightKg === 'number' && raw.bodyWeightKg > 20 && raw.bodyWeightKg < 400
        ? raw.bodyWeightKg
        : null,
  };
}

function sanitizePlanDay(v: unknown): Plan['days'][PlanKey] {
  if (!isRecord(v)) return { type: 'empty' };
  const type = v.type === 'workout' || v.type === 'rest' ? v.type : 'empty';
  if (type === 'workout' && typeof v.workoutId === 'string' && getWorkout(v.workoutId)) {
    return { type: 'workout', workoutId: v.workoutId };
  }
  if (type === 'workout' && Array.isArray(v.custom)) {
    const custom: PlanExercise[] = v.custom
      .filter(isRecord)
      .filter((item) => typeof item.exerciseId === 'string' && getExercise(item.exerciseId))
      .map((item) => ({
        exerciseId: item.exerciseId as string,
        sets: Math.min(10, Math.max(1, Math.round(asNumber(item.sets, 3)))),
        reps: String(asString(item.reps, '10')).slice(0, 12),
        weightKg: typeof item.weightKg === 'number' ? item.weightKg : null,
        restSec: Math.min(600, Math.max(15, Math.round(asNumber(item.restSec, 60)))),
      }));
    if (custom.length > 0) return { type: 'workout', custom };
  }
  return type === 'rest' ? { type: 'rest' } : { type: 'empty' };
}

function sanitizePlans(v: unknown): Plan[] {
  const plans = asArray(v)
    .filter(isRecord)
    .filter((p) => typeof p.id === 'string' && typeof p.name === 'string')
    .map((p) => {
      const days = {} as Record<PlanKey, Plan['days'][PlanKey]>;
      for (const key of DAY_KEYS) {
        days[key] = sanitizePlanDay(isRecord(p.days) ? p.days[key] : undefined);
      }
      return {
        id: p.id as string,
        name: String(p.name).slice(0, 60),
        level: LEVELS.includes(p.level as never) ? (p.level as Plan['level']) : 'beginner',
        isTemplate: asBool(p.isTemplate, false),
        focus: typeof p.focus === 'string' ? p.focus.slice(0, 120) : undefined,
        days,
        createdAt: asNumber(p.createdAt, Date.now()),
      };
    });
  return plans;
}

function sanitizeSessions(v: unknown): CompletedSession[] {
  return asArray(v)
    .filter(isRecord)
    .filter((s) => typeof s.id === 'string' && typeof s.workoutName === 'string')
    .map((s): CompletedSession => ({
      id: s.id as string,
      workoutId: asString(s.workoutId, 'custom'),
      workoutName: String(s.workoutName).slice(0, 80),
      source:
        s.source === 'plan'
          ? 'plan'
          : s.source === 'quick'
            ? 'quick'
            : 'library',
      startedAt: asNumber(s.startedAt, Date.now()),
      endedAt: asNumber(s.endedAt, asNumber(s.startedAt, Date.now())),
      durationSec: Math.max(1, asNumber(s.durationSec, 1)),
      status: s.status === 'partial' ? 'partial' : 'completed',
      exercises: asArray(s.exercises)
        .filter(isRecord)
        .map((e) => ({
          exerciseId: asString(e.exerciseId, 'unknown'),
          name: asString(e.name, 'Exercise'),
          sets: asArray(e.sets)
            .filter(isRecord)
            .map((set) => ({
              reps: Math.max(0, asNumber(set.reps, 0)),
              weightKg: typeof set.weightKg === 'number' ? set.weightKg : null,
              completedAt: asNumber(set.completedAt, asNumber(s.endedAt, Date.now())),
            })),
        })),
      totalSets: Math.max(0, asNumber(s.totalSets, 0)),
      completedExercises: Math.max(0, asNumber(s.completedExercises, 0)),
      estimatedKcal: Math.max(0, asNumber(s.estimatedKcal, 0)),
    }))
    .sort((a, b) => b.startedAt - a.startedAt);
}

function sanitizeActiveSession(v: unknown): ActiveSession | null {
  if (!isRecord(v)) return null;
  if (typeof v.id !== 'string' || typeof v.workoutName !== 'string') return null;
  const exercises = asArray(v.exercises)
    .filter(isRecord)
    .map((e) => ({
      exerciseId: asString(e.exerciseId, 'unknown'),
      name: asString(e.name, 'Exercise'),
      targetSets: Math.max(1, asNumber(e.targetSets, 1)),
      targetReps: asString(e.targetReps, '10'),
      weightKg: typeof e.weightKg === 'number' ? e.weightKg : null,
      restSec: Math.max(15, asNumber(e.restSec, 60)),
      note: typeof e.note === 'string' ? e.note : undefined,
      sets: asArray(e.sets)
        .filter(isRecord)
        .map((set) => ({
          completed: asBool(set.completed, false),
          completedAt: typeof set.completedAt === 'number' ? set.completedAt : undefined,
          reps: typeof set.reps === 'number' ? set.reps : undefined,
          weightKg: typeof set.weightKg === 'number' ? set.weightKg : undefined,
        })),
      done: asBool(e.done, false),
      skipped: asBool(e.skipped, false),
    }));
  if (exercises.length === 0) return null;
  const timing = isRecord(v.timing) ? v.timing : {};
  return {
    id: v.id as string,
    workoutId: asString(v.workoutId, 'custom'),
    workoutName: String(v.workoutName).slice(0, 80),
    source: v.source === 'plan' || v.source === 'quick' ? v.source : 'library',
    startedAt: asNumber(v.startedAt, Date.now()),
    status: v.status === 'paused' ? 'paused' : 'active',
    timing: {
      accumulatedMs: Math.max(0, asNumber(timing.accumulatedMs, 0)),
      lastResumedAt:
        typeof timing.lastResumedAt === 'number' ? timing.lastResumedAt : Date.now(),
    },
    exerciseIndex: Math.min(
      exercises.length - 1,
      Math.max(0, asNumber(v.exerciseIndex, 0)),
    ),
    setIndex: Math.max(0, asNumber(v.setIndex, 0)),
    exercises,
    rest: isRecord(v.rest)
      ? {
          totalSec: Math.max(0, asNumber(v.rest.totalSec, 0)),
          endAt: typeof v.rest.endAt === 'number' ? v.rest.endAt : null,
          remainingSec: Math.max(0, asNumber(v.rest.remainingSec, 0)),
          running: asBool(v.rest.running, false),
        }
      : null,
  };
}

export function defaultAppData(): AppData {
  // Seed with the beginner starter plan (a copy of the template) so the
  // dashboard and planner are usable on first run.
  const starter = cloneTemplate(PLAN_TEMPLATES[0], '');
  return {
    version: 1,
    profile: DEFAULT_PROFILE,
    prefs: DEFAULT_PREFS,
    plans: [starter],
    activePlanId: starter.id,
    sessions: [],
    achievements: [],
    prEvents: [],
    bodyWeight: [],
    activeSession: null,
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppData();
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return defaultAppData();
    const defaults = defaultAppData();
    const plans = sanitizePlans(parsed.plans);
    const activePlanId =
      typeof parsed.activePlanId === 'string' &&
      plans.some((p) => p.id === parsed.activePlanId)
        ? parsed.activePlanId
        : (plans[0]?.id ?? '');
    return {
      version: 1,
      profile: sanitizeProfile(parsed.profile),
      prefs: sanitizePrefs(parsed.prefs),
      plans: plans.length > 0 ? plans : defaults.plans,
      activePlanId,
      sessions: sanitizeSessions(parsed.sessions),
      achievements: asArray(parsed.achievements)
        .filter(isRecord)
        .filter((a) => typeof a.id === 'string')
        .map((a) => ({
          id: a.id as string,
          unlockedAt: asNumber(a.unlockedAt, Date.now()),
        })) satisfies AchievementUnlock[],
      prEvents: asArray(parsed.prEvents)
        .filter(isRecord)
        .filter((p) => typeof p.exerciseId === 'string')
        .map((p) => ({
          id: asString(p.id, `pr-${Math.random().toString(36).slice(2)}`),
          exerciseId: p.exerciseId as string,
          date: asNumber(p.date, Date.now()),
          weightKg: asNumber(p.weightKg, 0),
          reps: asNumber(p.reps, 0),
          e1rm: asNumber(p.e1rm, 0),
        })) satisfies PrEvent[],
      bodyWeight: asArray(parsed.bodyWeight)
        .filter(isRecord)
        .filter((b) => typeof b.kg === 'number')
        .map((b) => ({ date: asNumber(b.date, Date.now()), kg: asNumber(b.kg, 0) }))
        .filter((b) => b.kg > 20 && b.kg < 400)
        .sort((a, b) => a.date - b.date) satisfies BodyWeightEntry[],
      activeSession: sanitizeActiveSession(parsed.activeSession),
    };
  } catch {
    console.warn('[BUHAT] Stored data was unreadable — starting with a clean slate.');
    return defaultAppData();
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('[BUHAT] Could not persist data:', err);
  }
}

export function resetAppData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  ActiveSession,
  AppData,
  CompletedSession,
  Plan,
  PlanDay,
  PlanKey,
  Prefs,
  Profile,
  WorkoutTemplate,
} from '@/types';
import { getWorkout } from '@/data/workouts';
import { getAchievementDef, ACHIEVEMENTS } from '@/data/achievements';
import {
  createActiveSession,
  createCustomSession,
  estKcalPerMin,
  finishSession,
  pauseSession,
  resumeSession,
} from '@/lib/session';
import {
  currentStreak,
  detectPrEvents,
  sessionsThisWeek,
  totalSetsLogged,
} from '@/lib/stats';
import {
  defaultAppData,
  loadAppData,
  resetAppData,
  saveAppData,
} from '@/lib/storage';
import { syncMotionAttribute } from '@/lib/motion';
import { playCue } from '@/lib/sound';
import { uid, dayKeyOf } from '@/lib/format';
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion';

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  kind: 'achievement' | 'info';
  title: string;
  body?: string;
}

/* ------------------------------------------------------------------ */
/* Achievement evaluation — only from verified events                  */
/* ------------------------------------------------------------------ */

function evaluateUnlocks(data: {
  sessions: CompletedSession[];
  prEvents: AppData['prEvents'];
  achievements: AppData['achievements'];
  weeklyGoal: number;
}): string[] {
  const unlocked = new Set(data.achievements.map((a) => a.id));
  const has = (id: string) => unlocked.has(id);
  const candidates: string[] = [];
  const sessions = data.sessions;

  if (sessions.length >= 1 && !has('first-workout')) candidates.push('first-workout');
  if (sessions.length >= 5 && !has('five-workouts')) candidates.push('five-workouts');
  if (sessions.length >= 10 && !has('ten-workouts')) candidates.push('ten-workouts');
  if (currentStreak(sessions) >= 7 && !has('streak-7')) candidates.push('streak-7');
  if (data.prEvents.length > 0 && !has('pr-achieved')) candidates.push('pr-achieved');
  if (
    sessionsThisWeek(sessions) >= data.weeklyGoal &&
    data.weeklyGoal > 0 &&
    !has('weekly-goal')
  )
    candidates.push('weekly-goal');
  if (totalSetsLogged(sessions) >= 50 && !has('fifty-sets')) candidates.push('fifty-sets');

  return candidates.filter((id) => ACHIEVEMENTS.some((a) => a.id === id));
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

export interface AppContextValue {
  data: AppData;
  activePlan: Plan | null;
  todayPlanDay: PlanDay | null;
  toasts: Toast[];
  dismissToast(id: string): void;
  notify(toast: Omit<Toast, 'id'>): void;
  actions: {
    updateProfile(patch: Partial<Profile>): void;
    updatePrefs(patch: Partial<Prefs>): void;
    startFromWorkout(workout: WorkoutTemplate): void;
    startFromPlanDay(day: PlanDay, name: string): void;
    completeSet(log: { reps: number; weightKg: number | null }): number | null;
    advance(): boolean;
    skipExercise(): void;
    goToExercise(index: number): void;
    startRest(totalSec: number): void;
    clearRest(): void;
    pause(): void;
    resume(): void;
    finish(opts?: { discard?: boolean }): CompletedSession | null;
    setActivePlan(id: string): void;
    savePlan(plan: Plan): void;
    duplicatePlan(id: string): string | null;
    deletePlan(id: string): void;
    addBodyWeight(kg: number): void;
    removeBodyWeight(date: number): void;
    resetAll(): void;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dataRef = useRef(data);
  dataRef.current = data;

  const systemReduced = usePrefersReducedMotion();

  /* Persist every state change. */
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  /* Motion gate: user preference OR system preference. */
  useEffect(() => {
    syncMotionAttribute(data.prefs.reducedMotion);
  }, [data.prefs.reducedMotion, systemReduced]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = uid('toast');
      setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismissToast(id), 5000);
    },
    [dismissToast],
  );

  /* ---------------- profile & preferences ---------------- */

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setData((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }, []);

  const updatePrefs = useCallback((patch: Partial<Prefs>) => {
    setData((prev) => ({ ...prev, prefs: { ...prev.prefs, ...patch } }));
  }, []);

  /* ---------------- active session ---------------- */

  const startFromWorkout = useCallback((workout: WorkoutTemplate) => {
    setData((prev) => ({
      ...prev,
      activeSession: createActiveSession(workout, 'library'),
    }));
  }, []);

  const startFromPlanDay = useCallback((day: PlanDay, name: string) => {
    if (day.type !== 'workout') return;
    if (day.workoutId) {
      const template = getWorkout(day.workoutId);
      if (template) {
        setData((prev) => ({
          ...prev,
          activeSession: createActiveSession(template, 'plan'),
        }));
        return;
      }
    }
    const custom = day.custom;
    if (custom && custom.length > 0) {
      setData((prev) => ({
        ...prev,
        activeSession: createCustomSession(name, custom),
      }));
    }
  }, []);

  const mutateSession = useCallback(
    (fn: (session: ActiveSession) => ActiveSession) => {
      setData((prev) =>
        prev.activeSession
          ? { ...prev, activeSession: fn(prev.activeSession) }
          : prev,
      );
    },
    [],
  );

  const completeSet = useCallback(
    (log: { reps: number; weightKg: number | null }): number | null => {
      const session = dataRef.current.activeSession;
      if (!session || session.status !== 'active') return null;
      const now = Date.now();
      const exIdx = session.exerciseIndex;
      const setIdx = session.setIndex;
      const exercises = session.exercises.map((ex, i) =>
        i !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((set, j) =>
                j !== setIdx
                  ? set
                  : {
                      completed: true,
                      completedAt: now,
                      reps: log.reps,
                      weightKg: log.weightKg,
                    },
              ),
            },
      );
      const restSec = Math.max(15, exercises[exIdx].restSec);
      mutateSession((s) => ({
        ...s,
        exercises,
        rest: {
          totalSec: restSec,
          endAt: now + restSec * 1000,
          remainingSec: restSec,
          running: true,
        },
      }));
      playCue('set', dataRef.current.prefs.sound);
      return restSec;
    },
    [mutateSession],
  );

  const advance = useCallback((): boolean => {
    const session = dataRef.current.activeSession;
    if (!session) return false;
    const exercises = session.exercises.map((ex, i) =>
      i === session.exerciseIndex && ex.sets.every((s) => s.completed)
        ? { ...ex, done: true }
        : ex,
    );
    let exIdx = session.exerciseIndex;
    let setIdx = session.setIndex;
    let found = false;
    for (let i = session.exerciseIndex; i < exercises.length; i++) {
      const start = i === session.exerciseIndex ? session.setIndex + 1 : 0;
      for (let j = start; j < exercises[i].sets.length; j++) {
        if (!exercises[i].sets[j].completed) {
          exIdx = i;
          setIdx = j;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    mutateSession((s) => ({
      ...s,
      exercises,
      exerciseIndex: exIdx,
      setIndex: setIdx,
      rest: null,
    }));
    return found;
  }, [mutateSession]);

  const skipExercise = useCallback(() => {
    const session = dataRef.current.activeSession;
    if (!session) return;
    const exercises = session.exercises.map((ex, i) =>
      i === session.exerciseIndex ? { ...ex, done: true, skipped: true } : ex,
    );
    let exIdx = session.exerciseIndex;
    let setIdx = 0;
    let found = false;
    for (let i = session.exerciseIndex + 1; i < exercises.length; i++) {
      const j = exercises[i].sets.findIndex((s) => !s.completed);
      if (j >= 0) {
        exIdx = i;
        setIdx = j;
        found = true;
        break;
      }
    }
    mutateSession((s) => ({
      ...s,
      exercises,
      exerciseIndex: found ? exIdx : s.exerciseIndex,
      setIndex: found ? setIdx : s.setIndex,
      rest: null,
    }));
  }, [mutateSession]);

  const goToExercise = useCallback(
    (index: number) => {
      const session = dataRef.current.activeSession;
      if (!session) return;
      const clamped = Math.max(0, Math.min(session.exercises.length - 1, index));
      const firstIncomplete = session.exercises[clamped].sets.findIndex((s) => !s.completed);
      mutateSession((s) => ({
        ...s,
        exerciseIndex: clamped,
        setIndex: firstIncomplete >= 0 ? firstIncomplete : 0,
        rest: null,
      }));
    },
    [mutateSession],
  );

  const startRest = useCallback(
    (totalSec: number) => {
      const now = Date.now();
      mutateSession((s) => ({
        ...s,
        rest: {
          totalSec,
          endAt: now + totalSec * 1000,
          remainingSec: totalSec,
          running: true,
        },
      }));
    },
    [mutateSession],
  );

  const clearRest = useCallback(() => {
    mutateSession((s) => ({ ...s, rest: null }));
  }, [mutateSession]);

  const pause = useCallback(() => {
    mutateSession((s) => pauseSession(s));
  }, [mutateSession]);

  const resume = useCallback(() => {
    mutateSession((s) => resumeSession(s));
  }, [mutateSession]);

  const finish = useCallback(
    (opts?: { discard?: boolean }): CompletedSession | null => {
      const current = dataRef.current;
      const session = current.activeSession;
      if (!session) return null;
      if (opts?.discard) {
        setData((prev) => ({ ...prev, activeSession: null }));
        return null;
      }
      const template = getWorkout(session.workoutId);
      const completed = finishSession(session, {
        source: session.source,
        estKcalPerMin: estKcalPerMin(template, current.prefs.bodyWeightKg),
        partialAllowed: true,
      });
      if (!completed) {
        setData((prev) => ({ ...prev, activeSession: null }));
        return null;
      }
      const prs = detectPrEvents(completed, current.sessions);
      const sessions = [completed, ...current.sessions];
      const prEvents = [...prs, ...current.prEvents];
      const unlocks = evaluateUnlocks({
        sessions,
        prEvents,
        achievements: current.achievements,
        weeklyGoal: current.prefs.weeklyGoal,
      });
      const achievements = [
        ...current.achievements,
        ...unlocks.map((id) => ({ id, unlockedAt: Date.now() })),
      ];
      setData((prev) => ({
        ...prev,
        sessions,
        prEvents,
        achievements,
        activeSession: null,
      }));
      for (const id of unlocks) {
        const def = getAchievementDef(id);
        if (def) notify({ kind: 'achievement', title: def.title, body: def.description });
      }
      playCue('unlock', current.prefs.sound);
      return completed;
    },
    [notify],
  );

  /* ---------------- plans ---------------- */

  const setActivePlan = useCallback((id: string) => {
    setData((prev) => (prev.plans.some((p) => p.id === id) ? { ...prev, activePlanId: id } : prev));
  }, []);

  const savePlan = useCallback((plan: Plan) => {
    setData((prev) => {
      const exists = prev.plans.some((p) => p.id === plan.id);
      return {
        ...prev,
        plans: exists ? prev.plans.map((p) => (p.id === plan.id ? plan : p)) : [...prev.plans, plan],
      };
    });
  }, []);

  const duplicatePlan = useCallback((id: string): string | null => {
    const source = dataRef.current.plans.find((p) => p.id === id);
    if (!source) return null;
    const copy: Plan = {
      ...source,
      id: uid('plan'),
      name: `${source.name} (copy)`,
      isTemplate: false,
      createdAt: Date.now(),
      days: { ...source.days },
    };
    setData((prev) => ({ ...prev, plans: [...prev.plans, copy] }));
    return copy.id;
  }, []);

  const deletePlan = useCallback((id: string) => {
    setData((prev) => {
      const plans = prev.plans.filter((p) => p.id !== id);
      return {
        ...prev,
        plans,
        activePlanId:
          prev.activePlanId === id ? (plans[0]?.id ?? '') : prev.activePlanId,
      };
    });
  }, []);

  /* ---------------- body weight ---------------- */

  const addBodyWeight = useCallback((kg: number) => {
    const date = Date.now();
    setData((prev) => ({
      ...prev,
      prefs: { ...prev.prefs, bodyWeightKg: kg },
      bodyWeight: [...prev.bodyWeight.filter((b) => date - b.date > 3_600_000), { date, kg }].sort(
        (a, b) => a.date - b.date,
      ),
    }));
  }, []);

  const removeBodyWeight = useCallback((date: number) => {
    setData((prev) => ({
      ...prev,
      bodyWeight: prev.bodyWeight.filter((b) => b.date !== date),
    }));
  }, []);

  const resetAll = useCallback(() => {
    resetAppData();
    setData(defaultAppData());
    notify({ kind: 'info', title: 'All local data cleared', body: 'BUHAT is back to a clean slate.' });
  }, [notify]);

  /* ---------------- derived ---------------- */

  const activePlan = useMemo(
    () => data.plans.find((p) => p.id === data.activePlanId) ?? null,
    [data.plans, data.activePlanId],
  );

  const todayPlanDay = useMemo(() => {
    if (!activePlan) return null;
    return activePlan.days[dayKeyOf(new Date())] ?? null;
  }, [activePlan]);

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      activePlan,
      todayPlanDay,
      toasts,
      dismissToast,
      notify,
      actions: {
        updateProfile,
        updatePrefs,
        startFromWorkout,
        startFromPlanDay,
        completeSet,
        advance,
        skipExercise,
        goToExercise,
        startRest,
        clearRest,
        pause,
        resume,
        finish,
        setActivePlan,
        savePlan,
        duplicatePlan,
        deletePlan,
        addBodyWeight,
        removeBodyWeight,
        resetAll,
      },
    }),
    [
      data,
      activePlan,
      toasts,
      dismissToast,
      notify,
      updateProfile,
      updatePrefs,
      startFromWorkout,
      startFromPlanDay,
      completeSet,
      advance,
      skipExercise,
      goToExercise,
      startRest,
      clearRest,
      pause,
      resume,
      finish,
      setActivePlan,
      savePlan,
      duplicatePlan,
      deletePlan,
      addBodyWeight,
      removeBodyWeight,
      resetAll,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

/* ==========================================================================
   BUHAT data models
   All weights are stored canonically in kilograms; units are a display concern.
   ========================================================================== */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full body'
  | 'cardio';

export type Equipment =
  | 'none'
  | 'dumbbells'
  | 'barbell'
  | 'kettlebell'
  | 'pull-up bar'
  | 'bench'
  | 'mat'
  | 'resistance band'
  | 'jump rope'
  | 'rack';

export type WorkoutCategory =
  | 'strength'
  | 'hypertrophy'
  | 'fat loss'
  | 'cardio'
  | 'mobility'
  | 'home'
  | 'beginner'
  | 'advanced';

export type PlanKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type FitnessGoal =
  | 'strength'
  | 'muscle'
  | 'fat loss'
  | 'endurance'
  | 'mobility';

export type TrainingLocation = 'home' | 'gym' | 'outdoor';

/* ------------------------------------------------------------------ */
/* Exercises                                                           */
/* ------------------------------------------------------------------ */

export interface Exercise {
  id: string;
  name: string;
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  equipment: Equipment[];
  difficulty: Difficulty;
  instructions: string[];
  recommendedSets: number;
  recommendedReps: string;
  restSec: number;
  mistakes: string[];
  tips: string[];
  /** Static photo demonstration (no fabricated videos). */
  image: string;
  imageAlt: string;
  met: number; // metabolic equivalent for estimated calorie burn
  unilateral?: boolean;
}

/* ------------------------------------------------------------------ */
/* Workout templates (sample content — clearly library content)        */
/* ------------------------------------------------------------------ */

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  weightKg?: number | null;
  restSec: number;
  note?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  categories: WorkoutCategory[];
  difficulty: Difficulty;
  durationMin: number;
  muscles: MuscleGroup[];
  equipment: Equipment[];
  exercises: WorkoutExercise[];
  image: string;
  imageAlt: string;
  featured?: boolean;
  /** Rough session energy cost (kcal) used only for ESTIMATED display. */
  estKcal: number;
}

/* ------------------------------------------------------------------ */
/* Planner                                                             */
/* ------------------------------------------------------------------ */

export interface PlanExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  weightKg: number | null;
  restSec: number;
}

export interface PlanDay {
  type: 'workout' | 'rest' | 'empty';
  /** Assigned library workout, if any. */
  workoutId?: string;
  /** User-built session for this day. */
  custom?: PlanExercise[];
  label?: string;
}

export interface Plan {
  id: string;
  name: string;
  level: Difficulty;
  isTemplate: boolean;
  focus?: string;
  days: Record<PlanKey, PlanDay>;
  createdAt: number;
}

/* ------------------------------------------------------------------ */
/* Active + completed sessions                                         */
/* ------------------------------------------------------------------ */

export interface SessionSet {
  completed: boolean;
  completedAt?: number;
  reps?: number;
  weightKg?: number | null;
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: string;
  weightKg: number | null;
  restSec: number;
  note?: string;
  sets: SessionSet[];
  done: boolean;
  skipped?: boolean;
}

export interface RestState {
  totalSec: number;
  /** Epoch ms when the running rest ends; null while paused. */
  endAt: number | null;
  /** Remaining seconds while paused. */
  remainingSec: number;
  running: boolean;
}

export interface SessionTiming {
  accumulatedMs: number;
  lastResumedAt: number | null;
}

export interface ActiveSession {
  id: string;
  workoutId: string;
  workoutName: string;
  source: NewSessionSource;
  startedAt: number;
  status: 'active' | 'paused';
  timing: SessionTiming;
  exerciseIndex: number;
  setIndex: number;
  exercises: SessionExercise[];
  rest: RestState | null;
}

export interface CompletedSetLog {
  reps: number;
  weightKg: number | null;
  completedAt: number;
}

export interface CompletedSessionExercise {
  exerciseId: string;
  name: string;
  sets: CompletedSetLog[];
}

export interface CompletedSession {
  id: string;
  workoutId: string;
  workoutName: string;
  source: 'library' | 'plan' | 'quick';
  startedAt: number;
  endedAt: number;
  durationSec: number;
  status: 'completed' | 'partial';
  exercises: CompletedSessionExercise[];
  totalSets: number;
  completedExercises: number;
  /** Estimated only — never presented as measured energy expenditure. */
  estimatedKcal: number;
}

/* ------------------------------------------------------------------ */
/* Profile, preferences, records                                       */
/* ------------------------------------------------------------------ */

export interface Profile {
  name: string;
  goal: FitnessGoal;
  level: Difficulty;
  location: TrainingLocation;
  equipment: Equipment[];
  preferredDays: PlanKey[];
  durationPref: number;
}

export interface Prefs {
  units: 'kg' | 'lb';
  weeklyGoal: number;
  reducedMotion: boolean;
  sound: boolean;
  bodyWeightKg: number | null;
}

export interface PrEvent {
  id: string;
  exerciseId: string;
  date: number;
  weightKg: number;
  reps: number;
  e1rm: number;
}

export interface BodyWeightEntry {
  date: number;
  kg: number;
}

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: 'flame' | 'trophy' | 'zap' | 'target' | 'shield' | 'mountain' | 'timer';
}

export interface AchievementUnlock {
  id: string;
  unlockedAt: number;
}

/* ------------------------------------------------------------------ */
/* Store snapshot (localStorage schema)                                */
/* ------------------------------------------------------------------ */

export interface AppData {
  version: 1;
  profile: Profile;
  prefs: Prefs;
  plans: Plan[];
  activePlanId: string;
  sessions: CompletedSession[];
  achievements: AchievementUnlock[];
  prEvents: PrEvent[];
  bodyWeight: BodyWeightEntry[];
  activeSession: ActiveSession | null;
}

export type NewSessionSource = 'library' | 'plan' | 'quick';

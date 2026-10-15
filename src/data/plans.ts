import type { Plan } from '@/types';

/**
 * Starter plan templates. These are clearly labeled templates — users can
 * duplicate one and edit the copy, or build a plan from scratch.
 */
const now = 0; // templates are immutable seeds; createdAt is stamped on duplication

export const PLAN_TEMPLATES: Plan[] = [
  {
    id: 'tpl-beginner',
    name: 'Beginner Foundation 3-Day',
    level: 'beginner',
    isTemplate: true,
    focus: 'Full body strength, three days per week',
    createdAt: now,
    days: {
      mon: { type: 'workout', workoutId: 'full-body-foundation' },
      tue: { type: 'rest' },
      wed: { type: 'workout', workoutId: 'full-body-foundation' },
      thu: { type: 'rest' },
      fri: { type: 'workout', workoutId: 'active-recovery-flow' },
      sat: { type: 'rest' },
      sun: { type: 'rest' },
    },
  },
  {
    id: 'tpl-intermediate',
    name: 'Intermediate Push / Pull / Legs',
    level: 'intermediate',
    isTemplate: true,
    focus: 'Upper and lower splits with hypertrophy volume',
    createdAt: now,
    days: {
      mon: { type: 'workout', workoutId: 'push-day-hypertrophy' },
      tue: { type: 'rest' },
      wed: { type: 'workout', workoutId: 'pull-day-hypertrophy' },
      thu: { type: 'rest' },
      fri: { type: 'workout', workoutId: 'lower-body-force' },
      sat: { type: 'workout', workoutId: 'active-recovery-flow' },
      sun: { type: 'rest' },
    },
  },
  {
    id: 'tpl-advanced',
    name: 'Advanced Engine Builder',
    level: 'advanced',
    isTemplate: true,
    focus: 'High frequency strength plus conditioning',
    createdAt: now,
    days: {
      mon: { type: 'workout', workoutId: 'full-body-athlete' },
      tue: { type: 'workout', workoutId: 'hiit-furnace' },
      wed: { type: 'rest' },
      thu: { type: 'workout', workoutId: 'upper-body-power' },
      fri: { type: 'rest' },
      sat: { type: 'workout', workoutId: 'metabolic-conditioning' },
      sun: { type: 'rest' },
    },
  },
];

export const cloneTemplate = (tpl: Plan, nameSuffix = ' (my copy)'): Plan => ({
  ...tpl,
  id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: tpl.name + nameSuffix,
  isTemplate: false,
  createdAt: Date.now(),
  days: { ...tpl.days },
});

export const createEmptyPlan = (name: string, level: Plan['level']): Plan => ({
  id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name,
  level,
  isTemplate: false,
  createdAt: Date.now(),
  days: {
    mon: { type: 'empty' },
    tue: { type: 'empty' },
    wed: { type: 'empty' },
    thu: { type: 'empty' },
    fri: { type: 'empty' },
    sat: { type: 'empty' },
    sun: { type: 'empty' },
  },
});

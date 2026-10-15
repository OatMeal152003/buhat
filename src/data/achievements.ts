import type { AchievementDef } from '@/types';

/**
 * BUHAT achievement milestones.
 * Every milestone unlocks only through verified application events —
 * never through estimated calorie math.
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-workout',
    title: 'First Rep Forward',
    description: 'Complete your first tracked workout with BUHAT.',
    icon: 'flame',
  },
  {
    id: 'five-workouts',
    title: 'Five Strong',
    description: 'Complete five tracked workouts.',
    icon: 'zap',
  },
  {
    id: 'ten-workouts',
    title: 'Double Digits',
    description: 'Complete ten tracked workouts.',
    icon: 'mountain',
  },
  {
    id: 'streak-7',
    title: 'Seven-Day Discipline',
    description: 'Train on seven consecutive days.',
    icon: 'shield',
  },
  {
    id: 'pr-achieved',
    title: 'Personal Record',
    description: 'Set a personal record on any lift.',
    icon: 'trophy',
  },
  {
    id: 'weekly-goal',
    title: 'Goal Crushed',
    description: 'Hit your weekly training goal.',
    icon: 'target',
  },
  {
    id: 'fifty-sets',
    title: 'Fifty Sets Logged',
    description: 'Log fifty completed working sets.',
    icon: 'timer',
  },
];

export const getAchievementDef = (id: string): AchievementDef | undefined =>
  ACHIEVEMENTS.find((a) => a.id === id);

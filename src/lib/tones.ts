import type { Difficulty } from '@/types';

export function difficultyTone(difficulty: Difficulty): 'lime' | 'flame' | 'neutral' {
  if (difficulty === 'advanced') return 'flame';
  if (difficulty === 'intermediate') return 'lime';
  return 'neutral';
}

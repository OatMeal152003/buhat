import type { WorkoutTemplate } from '@/types';

/**
 * BUHAT workout library — sample programming content shipped with the app.
 * Users can run any of these as a tracked session; their own results are stored
 * separately from this library content.
 */
export const WORKOUTS: WorkoutTemplate[] = [
  {
    id: 'full-body-foundation',
    name: 'Full Body Foundation',
    tagline: 'Own the basics. Every rep, every session.',
    description:
      'A beginner-friendly full body session built on the movement patterns that carry every program: squat, push, hinge, brace and carry light cardio. Perfect first workout or an active recovery day.',
    categories: ['strength', 'home', 'beginner'],
    difficulty: 'beginner',
    durationMin: 35,
    muscles: ['quads', 'chest', 'glutes', 'core', 'cardio'],
    equipment: ['none', 'mat'],
    featured: true,
    estKcal: 260,
    image:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Group training session in a modern studio',
    exercises: [
      { exerciseId: 'jumping-jack', sets: 2, reps: '45 sec', restSec: 30, note: 'General warm-up' },
      { exerciseId: 'squat', sets: 3, reps: '10', restSec: 75, note: 'Bodyweight or light bar' },
      { exerciseId: 'push-up', sets: 3, reps: '8-12', restSec: 60 },
      { exerciseId: 'glute-bridge', sets: 3, reps: '12-15', restSec: 45 },
      { exerciseId: 'dumbbell-row', sets: 3, reps: '10 per arm', restSec: 75 },
      { exerciseId: 'plank', sets: 3, reps: '30-45 sec', restSec: 45 },
    ],
  },
  {
    id: 'upper-body-power',
    name: 'Upper Body Power',
    tagline: 'Push, pull, press — build a stronger upper half.',
    description:
      'A strength-focused upper body session pairing heavy compounds with strict accessory work. Train it twice a week with at least one rest day between sessions.',
    categories: ['strength', 'hypertrophy'],
    difficulty: 'intermediate',
    durationMin: 50,
    muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    equipment: ['barbell', 'bench', 'rack', 'pull-up bar', 'dumbbells'],
    estKcal: 340,
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Athlete performing a barbell press in the gym',
    exercises: [
      { exerciseId: 'bench-press', sets: 4, reps: '6-8', restSec: 150 },
      { exerciseId: 'pull-up', sets: 4, reps: '6-10', restSec: 120 },
      { exerciseId: 'shoulder-press', sets: 3, reps: '8-10', restSec: 90 },
      { exerciseId: 'triceps-dip', sets: 3, reps: '10-12', restSec: 75 },
      { exerciseId: 'bicep-curl', sets: 3, reps: '12', restSec: 60 },
    ],
  },
  {
    id: 'lower-body-force',
    name: 'Lower Body Force',
    tagline: 'Strong legs build strong people.',
    description:
      'A strength and hypertrophy session for the entire lower body. Heavy hinge and squat patterns first, then unilateral and posterior-chain accessory work.',
    categories: ['strength', 'hypertrophy'],
    difficulty: 'intermediate',
    durationMin: 55,
    muscles: ['quads', 'hamstrings', 'glutes', 'core'],
    equipment: ['barbell', 'rack', 'mat'],
    estKcal: 420,
    image:
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Barbell loaded with plates for a lower body session',
    exercises: [
      { exerciseId: 'deadlift', sets: 4, reps: '5', restSec: 180 },
      { exerciseId: 'squat', sets: 4, reps: '8', restSec: 150 },
      { exerciseId: 'lunge', sets: 3, reps: '10 per leg', restSec: 75 },
      { exerciseId: 'glute-bridge', sets: 3, reps: '12-15', restSec: 45 },
      { exerciseId: 'plank', sets: 3, reps: '45-60 sec', restSec: 45 },
    ],
  },
  {
    id: 'hiit-furnace',
    name: 'HIIT Furnace',
    tagline: 'Short session. Full intensity.',
    description:
      'A metabolic conditioning circuit that keeps your heart rate high from the first block to the last. Move quickly between exercises, rest only at the end of each round.',
    categories: ['fat loss', 'cardio', 'home'],
    difficulty: 'intermediate',
    durationMin: 28,
    muscles: ['full body', 'cardio', 'core'],
    equipment: ['none', 'kettlebell'],
    estKcal: 380,
    image:
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'High intensity conditioning training session',
    exercises: [
      { exerciseId: 'jumping-jack', sets: 2, reps: '45 sec', restSec: 30, note: 'Warm-up' },
      { exerciseId: 'burpee', sets: 4, reps: '12', restSec: 45 },
      { exerciseId: 'kettlebell-swing', sets: 4, reps: '15', restSec: 45 },
      { exerciseId: 'mountain-climber', sets: 4, reps: '40 sec', restSec: 30 },
      { exerciseId: 'lunge', sets: 3, reps: '12 per leg', restSec: 45 },
      { exerciseId: 'plank', sets: 3, reps: '45 sec', restSec: 30 },
    ],
  },
  {
    id: 'push-day-hypertrophy',
    name: 'Push Day Hypertrophy',
    tagline: 'Chest, shoulders, triceps — volume with intent.',
    description:
      'A classic hypertrophy push day. Moderate loads, controlled tempos and full range of motion to accumulate quality volume.',
    categories: ['hypertrophy', 'advanced'],
    difficulty: 'intermediate',
    durationMin: 55,
    muscles: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench', 'rack', 'dumbbells'],
    estKcal: 330,
    image:
      'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Athlete training chest and shoulders with weights',
    exercises: [
      { exerciseId: 'bench-press', sets: 4, reps: '8-10', restSec: 120 },
      { exerciseId: 'shoulder-press', sets: 4, reps: '10', restSec: 90 },
      { exerciseId: 'triceps-dip', sets: 3, reps: '10-12', restSec: 75 },
      { exerciseId: 'push-up', sets: 3, reps: 'to failure', restSec: 60, note: 'Finisher' },
    ],
  },
  {
    id: 'pull-day-hypertrophy',
    name: 'Pull Day Hypertrophy',
    tagline: 'Build the back that carries everything.',
    description:
      'Vertical and horizontal pulling paired with direct arm work. Aim to beat your logbook by one rep or a small weight jump each week.',
    categories: ['hypertrophy'],
    difficulty: 'intermediate',
    durationMin: 50,
    muscles: ['back', 'biceps', 'core'],
    equipment: ['pull-up bar', 'dumbbells', 'bench'],
    estKcal: 310,
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Athlete performing back training with a bar',
    exercises: [
      { exerciseId: 'pull-up', sets: 4, reps: '6-10', restSec: 120 },
      { exerciseId: 'dumbbell-row', sets: 4, reps: '10 per arm', restSec: 90 },
      { exerciseId: 'kettlebell-swing', sets: 3, reps: '15', restSec: 60 },
      { exerciseId: 'bicep-curl', sets: 3, reps: '12-15', restSec: 60 },
      { exerciseId: 'plank', sets: 3, reps: '45 sec', restSec: 45 },
    ],
  },
  {
    id: 'metabolic-conditioning',
    name: 'Metabolic Conditioning',
    tagline: 'Engine work for advanced athletes.',
    description:
      'A demanding conditioning block for trained users. Long work intervals, short rest, and high output. Scale the rest before scaling the work.',
    categories: ['fat loss', 'cardio', 'advanced'],
    difficulty: 'advanced',
    durationMin: 35,
    muscles: ['full body', 'cardio'],
    equipment: ['kettlebell', 'none', 'mat'],
    estKcal: 460,
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Advanced athlete mid conditioning workout',
    exercises: [
      { exerciseId: 'kettlebell-swing', sets: 5, reps: '20', restSec: 45 },
      { exerciseId: 'burpee', sets: 5, reps: '15', restSec: 45 },
      { exerciseId: 'mountain-climber', sets: 4, reps: '45 sec', restSec: 30 },
      { exerciseId: 'jumping-jack', sets: 4, reps: '60 sec', restSec: 30 },
      { exerciseId: 'plank', sets: 3, reps: '60 sec', restSec: 30 },
    ],
  },
  {
    id: 'kettlebell-driver',
    name: 'Kettlebell Driver',
    tagline: 'One bell. Full body output.',
    description:
      'A kettlebell-led full body session that blends strength and conditioning. Great for gym floors and home setups alike.',
    categories: ['strength', 'cardio', 'home'],
    difficulty: 'intermediate',
    durationMin: 40,
    muscles: ['hamstrings', 'glutes', 'back', 'quads', 'cardio'],
    equipment: ['kettlebell', 'dumbbells', 'bench'],
    estKcal: 370,
    image:
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Kettlebell training session',
    exercises: [
      { exerciseId: 'kettlebell-swing', sets: 4, reps: '15-20', restSec: 60 },
      { exerciseId: 'squat', sets: 3, reps: '10', restSec: 90, note: 'Goblet style with the bell' },
      { exerciseId: 'dumbbell-row', sets: 3, reps: '10 per arm', restSec: 75 },
      { exerciseId: 'lunge', sets: 3, reps: '10 per leg', restSec: 60 },
      { exerciseId: 'jumping-jack', sets: 3, reps: '45 sec', restSec: 30 },
    ],
  },
  {
    id: 'active-recovery-flow',
    name: 'Active Recovery Flow',
    tagline: 'Rest days are training days too.',
    description:
      'A gentle full body flow to restore position and blood flow between hard sessions. Move slowly, breathe deeply, and stop well before fatigue.',
    categories: ['mobility', 'home', 'beginner'],
    difficulty: 'beginner',
    durationMin: 25,
    muscles: ['core', 'glutes', 'quads', 'full body'],
    equipment: ['mat'],
    featured: true,
    estKcal: 140,
    image:
      'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Mobility and stretching session on a mat',
    exercises: [
      { exerciseId: 'jumping-jack', sets: 2, reps: '30 sec', restSec: 30, note: 'Easy pace' },
      { exerciseId: 'glute-bridge', sets: 2, reps: '12', restSec: 30, note: 'Slow and controlled' },
      { exerciseId: 'lunge', sets: 2, reps: '8 per leg', restSec: 45, note: 'Pause at the bottom' },
      { exerciseId: 'plank', sets: 2, reps: '30 sec', restSec: 30 },
      { exerciseId: 'dumbbell-row', sets: 2, reps: '10 per arm', restSec: 45, note: 'Light weight, full stretch' },
    ],
  },
  {
    id: 'full-body-athlete',
    name: 'Full Body Athlete',
    tagline: 'Strength, power and grit in one session.',
    description:
      'An advanced full body session combining heavy compounds with explosive conditioning blocks. Schedule a recovery day after this one.',
    categories: ['strength', 'advanced', 'fat loss'],
    difficulty: 'advanced',
    durationMin: 60,
    muscles: ['full body', 'hamstrings', 'chest', 'back', 'cardio'],
    equipment: ['barbell', 'pull-up bar', 'kettlebell', 'bench'],
    estKcal: 520,
    image:
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Athlete training outdoors with intensity',
    exercises: [
      { exerciseId: 'deadlift', sets: 4, reps: '5', restSec: 180 },
      { exerciseId: 'bench-press', sets: 4, reps: '6', restSec: 150 },
      { exerciseId: 'pull-up', sets: 3, reps: '8', restSec: 120 },
      { exerciseId: 'kettlebell-swing', sets: 4, reps: '15', restSec: 60 },
      { exerciseId: 'burpee', sets: 3, reps: '12', restSec: 45 },
      { exerciseId: 'plank', sets: 3, reps: '60 sec', restSec: 45 },
    ],
  },
];

export const getWorkout = (id: string): WorkoutTemplate | undefined =>
  WORKOUTS.find((w) => w.id === id);

export const WORKOUT_CATEGORIES = [
  'strength',
  'hypertrophy',
  'fat loss',
  'cardio',
  'mobility',
  'home',
  'beginner',
  'advanced',
] as const;

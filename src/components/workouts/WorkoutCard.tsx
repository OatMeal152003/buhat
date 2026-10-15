import { Link } from 'react-router-dom';
import { Clock, Dumbbell } from 'lucide-react';
import type { WorkoutTemplate } from '@/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { Tag } from '@/components/ui/Tag';
import { difficultyTone } from '@/lib/tones';

interface WorkoutCardProps {
  workout: WorkoutTemplate;
  /** Reveal index for staggered grids. */
  index?: number;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <article data-stagger className="group">
      <Link
        to={`/app/workouts/${workout.id}`}
        className="focus-ring panel flex h-full flex-col transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-line2 active:translate-y-0"
      >
        <div className="relative h-44 overflow-hidden">
          <SmartImage
            src={workout.image}
            alt={workout.imageAlt}
            className="h-full w-full"
            imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            fallbackLabel={workout.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <div className="absolute left-3 top-3 flex gap-2">
            <Tag tone={difficultyTone(workout.difficulty)}>{workout.difficulty}</Tag>
            {workout.categories.includes('home') && <Tag tone="neutral">Home</Tag>}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="display text-lg leading-tight text-fg transition-colors group-hover:text-lime">
            {workout.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{workout.tagline}</p>
          <div className="mt-auto flex items-center gap-4 border-t border-line pt-3 text-xs text-faint">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" /> {workout.durationMin} min
            </span>
            <span className="flex items-center gap-1.5">
              <Dumbbell className="size-3.5" aria-hidden="true" /> {workout.exercises.length} exercises
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {workout.muscles.slice(0, 3).map((m) => (
              <span key={m} className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-faint">
                {m}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}

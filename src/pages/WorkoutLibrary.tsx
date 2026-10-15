import { useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { WORKOUTS, WORKOUT_CATEGORIES } from '@/data/workouts';
import { MUSCLE_GROUPS, EQUIPMENT_OPTIONS } from '@/data/exercises';
import { WorkoutCard } from '@/components/workouts/WorkoutCard';
import { TextField, SelectField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tag } from '@/components/ui/Tag';
import { useStaggerReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/cn';

export function WorkoutLibrary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [muscle, setMuscle] = useState('all');
  const [equipment, setEquipment] = useState('all');
  const gridRef = useStaggerReveal<HTMLDivElement>({
    step: 60,
    refreshKey: `${query}|${category}|${difficulty}|${muscle}|${equipment}`,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORKOUTS.filter((w) => {
      if (category !== 'all' && !w.categories.includes(category as never)) return false;
      if (difficulty !== 'all' && w.difficulty !== difficulty) return false;
      if (muscle !== 'all' && !w.muscles.includes(muscle as never)) return false;
      if (equipment !== 'all' && !w.equipment.includes(equipment as never)) return false;
      if (!q) return true;
      return [w.name, w.tagline, w.description, ...w.muscles]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [query, category, difficulty, muscle, equipment]);

  const resetFilters = () => {
    setQuery('');
    setCategory('all');
    setDifficulty('all');
    setMuscle('all');
    setEquipment('all');
  };

  const hasFilters =
    query !== '' || category !== 'all' || difficulty !== 'all' || muscle !== 'all' || equipment !== 'all';

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow text-lime">Library</p>
        <h1 className="display mt-3 text-[clamp(1.9rem,5vw,3rem)] text-fg">Workout library</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          {WORKOUTS.length} programmed sessions across strength, hypertrophy, fat loss, cardio,
          mobility and home training. Open any workout to inspect every set, then start a real
          tracked session.
        </p>
      </header>

      {/* Search + filters */}
      <section aria-label="Filter workouts" className="panel space-y-5 p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <TextField
              label="Search workouts"
              placeholder="e.g. HIIT, beginner, full body…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
            />
          </div>
          <SelectField
            label="Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            options={[
              { value: 'all', label: 'All levels' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />
          <SelectField
            label="Target muscles"
            value={muscle}
            onChange={(e) => setMuscle(e.target.value)}
            options={[
              { value: 'all', label: 'All muscles' },
              ...MUSCLE_GROUPS.map((m) => ({ value: m, label: m })),
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Categories">
          <Tag tone="neutral" className="mr-1">Category</Tag>
          {(['all', ...WORKOUT_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                'focus-ring min-h-11 border px-3 text-[0.65rem] font-bold uppercase tracking-[0.12em] transition-colors duration-150',
                category === c
                  ? 'border-lime bg-lime text-ink'
                  : 'border-line2 text-muted hover:border-lime hover:text-lime',
              )}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
          <div className="ml-auto">
            <SelectField
              label="Equipment"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              options={[
                { value: 'all', label: 'Any equipment' },
                ...EQUIPMENT_OPTIONS.map((eq) => ({ value: eq, label: eq })),
              ]}
              className="min-h-11 py-1 text-xs"
            />
          </div>
        </div>
      </section>

      <p aria-live="polite" className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
        {filtered.length} workout{filtered.length === 1 ? '' : 's'} found
        {hasFilters && ' (filtered)'}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No workouts match those filters"
          body="Try a different category, muscle group or difficulty — or clear the filters to see the full library."
          action={
            <Button variant="secondary" onClick={resetFilters}>
              Clear all filters
            </Button>
          }
        />
      ) : (
        <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      )}
    </div>
  );
}

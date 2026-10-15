import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { EXERCISES, EQUIPMENT_OPTIONS, MUSCLE_GROUPS } from '@/data/exercises';
import { TextField, SelectField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SmartImage } from '@/components/ui/SmartImage';
import { Tag } from '@/components/ui/Tag';
import { useStaggerReveal } from '@/hooks/useReveal';
import { difficultyTone } from '@/lib/tones';

export function ExerciseLibrary() {
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('all');
  const [equipment, setEquipment] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const gridRef = useStaggerReveal<HTMLDivElement>({
    step: 55,
    refreshKey: `${query}|${muscle}|${equipment}|${difficulty}`,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (muscle !== 'all' && e.primary !== muscle && !e.secondary.includes(muscle as never))
        return false;
      if (equipment !== 'all' && !e.equipment.includes(equipment as never)) return false;
      if (difficulty !== 'all' && e.difficulty !== difficulty) return false;
      if (!q) return true;
      return [e.name, e.primary, ...e.secondary].join(' ').toLowerCase().includes(q);
    });
  }, [query, muscle, equipment, difficulty]);

  const reset = () => {
    setQuery('');
    setMuscle('all');
    setEquipment('all');
    setDifficulty('all');
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow text-lime">Reference</p>
        <h1 className="display mt-3 text-[clamp(1.9rem,5vw,3rem)] text-fg">Exercise library</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          {EXERCISES.length} movements with instructions, target muscles, common mistakes and
          safety cues. Demonstration photos are static references — always follow the written
          steps.
        </p>
      </header>

      <section aria-label="Filter exercises" className="panel grid gap-4 p-5 md:grid-cols-2 md:p-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <TextField
            label="Search exercises"
            placeholder="e.g. squat, core, pull…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
          />
        </div>
        <SelectField
          label="Primary muscle"
          value={muscle}
          onChange={(e) => setMuscle(e.target.value)}
          options={[
            { value: 'all', label: 'All muscles' },
            ...MUSCLE_GROUPS.map((m) => ({ value: m, label: m })),
          ]}
        />
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
        <div className="md:col-span-2 lg:col-span-4">
          <SelectField
            label="Equipment"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            options={[
              { value: 'all', label: 'Any equipment' },
              ...EQUIPMENT_OPTIONS.map((eq) => ({ value: eq, label: eq })),
            ]}
          />
        </div>
      </section>

      <p aria-live="polite" className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
        {filtered.length} exercise{filtered.length === 1 ? '' : 's'} found
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No exercises match those filters"
          body="Broaden the muscle or equipment filters, or clear everything to browse the full movement library."
          action={
            <Button variant="secondary" onClick={reset}>
              Clear all filters
            </Button>
          }
        />
      ) : (
        <div ref={gridRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ex) => (
            <article key={ex.id} data-stagger className="group">
              <Link
                to={`/app/exercises/${ex.id}`}
                className="focus-ring panel flex h-full flex-col transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-line2 active:translate-y-0"
              >
                <SmartImage
                  src={ex.image}
                  alt={ex.imageAlt}
                  className="h-36 w-full"
                  imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  fallbackLabel={ex.name}
                />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="display text-base text-fg transition-colors group-hover:text-lime">
                      {ex.name}
                    </h2>
                    <Tag tone={difficultyTone(ex.difficulty)}>{ex.difficulty}</Tag>
                  </div>
                  <p className="text-xs text-muted">
                    <span className="font-semibold text-fg">{ex.primary}</span>
                    {ex.secondary.length > 0 && ` · ${ex.secondary.join(', ')}`}
                  </p>
                  <p className="mt-auto pt-2 text-xs text-faint">
                    {ex.equipment.join(' · ')} · {ex.recommendedSets} × {ex.recommendedReps}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

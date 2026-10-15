import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  Copy,
  Play,
  Trash2,
  Pencil,
  Plus,
  X,
} from 'lucide-react';
import type { Plan, PlanDay, PlanExercise, PlanKey } from '@/types';
import { useApp } from '@/store/AppStore';
import { WORKOUTS, getWorkout } from '@/data/workouts';
import { EXERCISES, getExercise } from '@/data/exercises';
import { PLAN_TEMPLATES, cloneTemplate, createEmptyPlan } from '@/data/plans';
import { Button } from '@/components/ui/Button';
import { SelectField, TextField, NumberField } from '@/components/ui/Field';
import { Tag } from '@/components/ui/Tag';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStaggerReveal } from '@/hooks/useReveal';
import { DAY_KEYS, DAY_LABELS, DAY_SHORT, toDisplayWeight, toKg, weightUnitLabel } from '@/lib/format';
import { cn } from '@/lib/cn';

export function Planner() {
  const { data, activePlan, actions, notify } = useApp();
  const navigate = useNavigate();
  const calendarRef = useStaggerReveal<HTMLDivElement>({ step: 55 });

  const [selectedDay, setSelectedDay] = useState<PlanKey | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('My training week');
  const [newPlanLevel, setNewPlanLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const units = data.prefs.units;
  const plan = activePlan;

  const overview = useMemo(() => {
    if (!plan) return { sessions: 0, minutes: 0, muscles: [] as string[] };
    let sessions = 0;
    let minutes = 0;
    const muscles = new Set<string>();
    for (const key of DAY_KEYS) {
      const day = plan.days[key];
      if (day?.type !== 'workout') continue;
      sessions += 1;
      if (day.workoutId) {
        const w = getWorkout(day.workoutId);
        if (w) {
          minutes += w.durationMin;
          w.muscles.forEach((m) => muscles.add(m));
        }
      } else if (day.custom) {
        minutes += Math.round(day.custom.reduce((sum, e) => sum + e.sets * 1.5, 0));
        day.custom.forEach((e) => {
          const ex = getExercise(e.exerciseId);
          if (ex) muscles.add(ex.primary);
        });
      }
    }
    return { sessions, minutes, muscles: [...muscles] };
  }, [plan]);

  const setDay = (key: PlanKey, day: PlanDay) => {
    if (!plan) return;
    actions.savePlan({ ...plan, days: { ...plan.days, [key]: day } });
  };

  const useTemplate = (tpl: Plan) => {
    const copy = cloneTemplate(tpl);
    actions.savePlan(copy);
    actions.setActivePlan(copy.id);
    notify({ kind: 'info', title: 'Template applied', body: `${copy.name} is now your active plan.` });
  };

  const createPlan = () => {
    const name = newPlanName.trim();
    if (name.length < 2) return;
    const created = createEmptyPlan(name, newPlanLevel);
    actions.savePlan(created);
    actions.setActivePlan(created.id);
    setNewPlanOpen(false);
    notify({ kind: 'info', title: 'Plan created', body: 'Assign workouts to your days below.' });
  };

  if (!plan) {
    return (
      <div className="space-y-8">
        <PageHeader />
        <EmptyState
          icon={CalendarPlus}
          title="No plan selected"
          body="Start from one of the BUHAT templates or create a blank weekly plan."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              {PLAN_TEMPLATES.map((tpl) => (
                <Button key={tpl.id} variant="secondary" size="sm" onClick={() => useTemplate(tpl)}>
                  {tpl.name}
                </Button>
              ))}
            </div>
          }
        />
      </div>
    );
  }

  const editorDay = selectedDay ? plan.days[selectedDay] : null;

  return (
    <div className="space-y-8">
      <PageHeader />

      {/* Plan management */}
      <section aria-label="Plan management" className="panel flex flex-wrap items-end gap-4 p-5">
        <div className="min-w-56 flex-1">
          <SelectField
            label="Active plan"
            value={plan.id}
            onChange={(e) => actions.setActivePlan(e.target.value)}
            options={data.plans.map((p) => ({ value: p.id, label: p.name }))}
          />
        </div>
        <Button variant="secondary" onClick={() => actions.duplicatePlan(plan.id)}>
          <Copy className="size-4" aria-hidden="true" /> Duplicate
        </Button>
        <Button variant="secondary" onClick={() => setNewPlanOpen(true)}>
          <CalendarPlus className="size-4" aria-hidden="true" /> New plan
        </Button>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-4" aria-hidden="true" /> Delete
        </Button>
      </section>

      {/* Weekly overview */}
      <section aria-label="Weekly overview" className="grid gap-4 border-y border-line py-6 sm:grid-cols-3">
        <div>
          <p className="eyebrow text-[0.6rem] text-faint">Training days</p>
          <p className="num display mt-1 text-3xl text-lime">{overview.sessions}</p>
        </div>
        <div>
          <p className="eyebrow text-[0.6rem] text-faint">Estimated weekly time</p>
          <p className="num display mt-1 text-3xl text-fg">~{overview.minutes} min</p>
        </div>
        <div>
          <p className="eyebrow text-[0.6rem] text-faint">Muscles targeted</p>
          <p className="mt-2 text-sm text-muted">
            {overview.muscles.length > 0 ? overview.muscles.join(' · ') : 'Assign workouts to see coverage'}
          </p>
        </div>
      </section>

      {/* Weekly calendar */}
      <section aria-labelledby="calendar-title" className="space-y-4">
        <h2 id="calendar-title" className="display text-xl text-fg">
          Your week
        </h2>
        <div ref={calendarRef} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {DAY_KEYS.map((key) => {
            const day = plan.days[key];
            const workout = day?.type === 'workout' ? getWorkout(day.workoutId ?? '') : null;
            const isEditing = selectedDay === key;
            return (
              <div
                key={key}
                data-stagger
                className={cn(
                  'panel flex flex-col gap-2 p-4',
                  isEditing && 'border-lime',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-[0.6rem] text-faint">{DAY_SHORT[key]}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(isEditing ? null : key)}
                    aria-label={`Edit ${DAY_LABELS[key]}`}
                    aria-expanded={isEditing}
                    className="focus-ring -m-2.5 flex size-11 items-center justify-center text-faint transition-colors hover:text-lime"
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </button>
                </div>

                {day?.type === 'rest' ? (
                  <>
                    <Tag tone="neutral">Rest</Tag>
                    <p className="text-xs leading-relaxed text-faint">Recovery day.</p>
                  </>
                ) : day?.type === 'workout' ? (
                  <>
                    <Tag tone="lime">{workout ? workout.difficulty : 'Custom'}</Tag>
                    <p className="display text-sm leading-tight text-fg">
                      {workout?.name ?? 'Custom session'}
                    </p>
                    <p className="text-xs text-faint">
                      {workout
                        ? `${workout.durationMin} min`
                        : `${day.custom?.length ?? 0} exercises`}
                    </p>
                    <Button
                      size="sm"
                      className="mt-auto w-full"
                      onClick={() => {
                        actions.startFromPlanDay(day, `${DAY_LABELS[key]} session`);
                        navigate('/app/active');
                      }}
                    >
                      <Play className="size-3.5" aria-hidden="true" /> Start
                    </Button>
                  </>
                ) : (
                  <>
                    <Tag tone="neutral">Empty</Tag>
                    <p className="text-xs leading-relaxed text-faint">Nothing assigned.</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Day editor */}
      {selectedDay && editorDay && (
        <DayEditor
          dayKey={selectedDay}
          day={editorDay}
          units={units}
          onSave={(day) => {
            setDay(selectedDay, day);
            setSelectedDay(null);
          }}
          onClose={() => setSelectedDay(null)}
        />
      )}

      {/* Templates */}
      <section aria-labelledby="templates-title" className="space-y-4">
        <h2 id="templates-title" className="display text-xl text-fg">
          Starter templates
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Templates are sample programming shipped with BUHAT. Using one creates an editable copy
          — your changes never alter the original template.
        </p>
        <ul className="grid gap-4 md:grid-cols-3">
          {PLAN_TEMPLATES.map((tpl) => (
            <li key={tpl.id} className="panel flex flex-col gap-3 p-5">
              <Tag tone="neutral">Template</Tag>
              <h3 className="display text-base text-fg">{tpl.name}</h3>
              <p className="text-xs leading-relaxed text-muted">{tpl.focus}</p>
              <p className="text-xs text-faint">
                {DAY_KEYS.filter((k) => tpl.days[k].type === 'workout').length} training days ·{' '}
                {tpl.level}
              </p>
              <Button variant="secondary" size="sm" className="mt-auto" onClick={() => useTemplate(tpl)}>
                Use template
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <ConfirmationDialog
        open={deleteOpen}
        title={`Delete "${plan.name}"?`}
        body="The plan and its weekly schedule will be removed. Completed workout sessions are not affected."
        confirmLabel="Delete plan"
        destructive
        onConfirm={() => {
          actions.deletePlan(plan.id);
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
      />

      {newPlanOpen && (
        <div className="panel space-y-4 p-5">
          <h2 className="display text-lg text-fg">New weekly plan</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Plan name"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              error={newPlanName.trim().length > 0 && newPlanName.trim().length < 2 ? 'Use at least 2 characters.' : undefined}
              maxLength={60}
            />
            <SelectField
              label="Level"
              value={newPlanLevel}
              onChange={(e) => setNewPlanLevel(e.target.value as typeof newPlanLevel)}
              options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ]}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={createPlan} disabled={newPlanName.trim().length < 2}>
              Create plan
            </Button>
            <Button variant="ghost" onClick={() => setNewPlanOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <header>
      <p className="eyebrow text-lime">Planner</p>
      <h1 className="display mt-3 text-[clamp(1.9rem,5vw,3rem)] text-fg">Workout planner</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">
        Build the week you can actually repeat. Assign library workouts or custom sessions, mark
        rest days, and start any planned day with one tap.
      </p>
    </header>
  );
}

interface DayEditorProps {
  dayKey: PlanKey;
  day: PlanDay;
  units: 'kg' | 'lb';
  onSave(day: PlanDay): void;
  onClose(): void;
}

function DayEditor({ dayKey, day, units, onSave, onClose }: DayEditorProps) {
  const [type, setType] = useState<'workout' | 'rest' | 'empty'>(
    day.type === 'workout' ? 'workout' : day.type,
  );
  const [workoutId, setWorkoutId] = useState(day.workoutId ?? WORKOUTS[0].id);
  const [custom, setCustom] = useState<PlanExercise[]>(day.custom ?? []);
  const [mode, setMode] = useState<'library' | 'custom'>(day.custom?.length ? 'custom' : 'library');
  const [addId, setAddId] = useState(EXERCISES[0].id);

  const addExercise = () => {
    const ex = getExercise(addId);
    if (!ex) return;
    setCustom((prev) => [
      ...prev,
      { exerciseId: ex.id, sets: ex.recommendedSets, reps: ex.recommendedReps, weightKg: null, restSec: ex.restSec },
    ]);
  };

  const updateExercise = (index: number, patch: Partial<PlanExercise>) => {
    setCustom((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const save = () => {
    if (type === 'rest') onSave({ type: 'rest' });
    else if (type === 'empty') onSave({ type: 'empty' });
    else if (mode === 'custom' && custom.length > 0) onSave({ type: 'workout', custom });
    else onSave({ type: 'workout', workoutId });
  };

  return (
    <section aria-label={`Edit ${DAY_LABELS[dayKey]}`} className="panel space-y-5 p-5 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="display text-lg text-fg">Edit {DAY_LABELS[dayKey]}</h2>
        <button type="button" onClick={onClose} aria-label="Close editor" className="focus-ring -m-2.5 flex size-11 items-center justify-center text-faint hover:text-fg">
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Day type">
        {(['workout', 'rest', 'empty'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={cn(
              'focus-ring min-h-11 border px-4 text-xs font-bold uppercase tracking-[0.12em] transition-colors',
              type === t ? 'border-lime bg-lime text-ink' : 'border-line2 text-muted hover:text-fg',
            )}
          >
            {t === 'empty' ? 'Unassigned' : t}
          </button>
        ))}
      </div>

      {type === 'workout' && (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Workout source">
            <button
              type="button"
              onClick={() => setMode('library')}
              aria-pressed={mode === 'library'}
              className={cn(
                'focus-ring min-h-11 border px-4 text-xs font-bold uppercase tracking-[0.12em]',
                mode === 'library' ? 'border-lime text-lime' : 'border-line2 text-muted',
              )}
            >
              Library workout
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              aria-pressed={mode === 'custom'}
              className={cn(
                'focus-ring min-h-11 border px-4 text-xs font-bold uppercase tracking-[0.12em]',
                mode === 'custom' ? 'border-lime text-lime' : 'border-line2 text-muted',
              )}
            >
              Custom exercises
            </button>
          </div>

          {mode === 'library' ? (
            <SelectField
              label="Workout"
              value={workoutId}
              onChange={(e) => setWorkoutId(e.target.value)}
              options={WORKOUTS.map((w) => ({
                value: w.id,
                label: `${w.name} · ${w.durationMin} min · ${w.difficulty}`,
              }))}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-56 flex-1">
                  <SelectField
                    label="Add exercise"
                    value={addId}
                    onChange={(e) => setAddId(e.target.value)}
                    options={EXERCISES.map((ex) => ({ value: ex.id, label: ex.name }))}
                  />
                </div>
                <Button variant="secondary" onClick={addExercise}>
                  <Plus className="size-4" aria-hidden="true" /> Add
                </Button>
              </div>

              {custom.length === 0 ? (
                <p className="text-sm text-faint">No exercises yet — add your first one above.</p>
              ) : (
                <ul className="space-y-3">
                  {custom.map((item, i) => {
                    const ex = getExercise(item.exerciseId);
                    return (
                      <li key={`${item.exerciseId}-${i}`} className="grid gap-3 border-t border-line pt-3 md:grid-cols-[1fr_repeat(4,auto)] md:items-end">
                        <div>
                          <p className="text-sm font-bold text-fg">{ex?.name ?? item.exerciseId}</p>
                          <button
                            type="button"
                            onClick={() => setCustom((prev) => prev.filter((_, idx) => idx !== i))}
                            className="focus-ring mt-1 inline-flex items-center gap-1 text-xs text-danger hover:underline"
                          >
                            <Trash2 className="size-3" aria-hidden="true" /> Remove
                          </button>
                        </div>
                        <NumberField
                          label="Sets"
                          min={1}
                          max={10}
                          value={item.sets}
                          onChange={(e) => updateExercise(i, { sets: Math.max(1, Number(e.target.value) || 1) })}
                          className="w-20"
                        />
                        <TextField
                          label="Reps"
                          value={item.reps}
                          onChange={(e) => updateExercise(i, { reps: e.target.value.slice(0, 12) })}
                          maxLength={12}
                          className="w-24"
                        />
                        <NumberField
                          label={`Weight (${weightUnitLabel(units)})`}
                          min={0}
                          step={units === 'lb' ? 5 : 2.5}
                          value={item.weightKg != null ? toDisplayWeight(item.weightKg, units) : ''}
                          placeholder="BW"
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            updateExercise(i, { weightKg: Number.isFinite(v) && v > 0 ? toKg(v, units) : null });
                          }}
                          className="w-28"
                        />
                        <SelectField
                          label="Rest (sec)"
                          value={String(item.restSec)}
                          onChange={(e) => updateExercise(i, { restSec: Number(e.target.value) })}
                          options={[30, 45, 60, 90, 120, 180].map((s) => ({ value: String(s), label: String(s) }))}
                          className="w-24"
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex gap-3 border-t border-line pt-4">
        <Button onClick={save}>Save day</Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

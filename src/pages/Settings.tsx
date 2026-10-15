import { useState } from 'react';
import { Settings2, Trash2 } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { EQUIPMENT_OPTIONS } from '@/data/exercises';
import { GOALS_LIST, LEVELS_LIST, LOCATIONS_LIST, DAYS_LIST } from '@/lib/constants';
import type { Equipment, FitnessGoal, PlanKey, TrainingLocation } from '@/types';
import { TextField, SelectField, NumberField, ToggleField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Tag } from '@/components/ui/Tag';
import { DAY_LABELS, weightUnitLabel } from '@/lib/format';
import { cn } from '@/lib/cn';

export function SettingsPage() {
  const { data, actions, notify } = useApp();

  const [name, setName] = useState(data.profile.name);
  const [goal, setGoal] = useState<FitnessGoal>(data.profile.goal);
  const [level, setLevel] = useState(data.profile.level);
  const [location, setLocation] = useState<TrainingLocation>(data.profile.location);
  const [equipment, setEquipment] = useState<Equipment[]>(data.profile.equipment);
  const [days, setDays] = useState<PlanKey[]>(data.profile.preferredDays);
  const [duration, setDuration] = useState(String(data.profile.durationPref));
  const [units, setUnits] = useState(data.prefs.units);
  const [weeklyGoal, setWeeklyGoal] = useState(String(data.prefs.weeklyGoal));
  const [reducedMotion, setReducedMotion] = useState(data.prefs.reducedMotion);
  const [sound, setSound] = useState(data.prefs.sound);
  const [resetOpen, setResetOpen] = useState(false);

  const nameError =
    name.trim().length > 0 && name.trim().length < 2 ? 'Display names need at least 2 characters.' : undefined;
  const durationNum = Math.min(180, Math.max(10, parseInt(duration, 10) || 45));
  const weeklyNum = Math.min(14, Math.max(1, parseInt(weeklyGoal, 10) || 3));

  const toggleEquipment = (eq: Equipment) => {
    setEquipment((prev) => (prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]));
  };

  const toggleDay = (day: PlanKey) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const save = () => {
    if (nameError) return;
    actions.updateProfile({
      name: name.trim(),
      goal,
      level,
      location,
      equipment,
      preferredDays: days,
      durationPref: durationNum,
    });
    actions.updatePrefs({ units, weeklyGoal: weeklyNum, reducedMotion, sound });
    notify({
      kind: 'info',
      title: 'Settings saved',
      body: `Training as ${name.trim() || 'Athlete'} · ${units === 'kg' ? 'Kilograms' : 'Pounds'}`,
    });
  };

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow text-lime">Profile</p>
        <h1 className="display mt-3 text-[clamp(1.9rem,5vw,3rem)] text-fg">Settings</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          Shape BUHAT around how you actually train. Everything stays on this device — no account,
          no cloud, no unnecessary data collection.
        </p>
      </header>

      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        {/* Profile */}
        <section aria-labelledby="profile-title" className="panel space-y-5 p-5 md:p-6">
          <h2 id="profile-title" className="display text-lg text-fg">
            About you
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Display name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Athlete"
              error={nameError}
              hint="Used for greetings only."
            />
            <SelectField
              label="Fitness goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value as FitnessGoal)}
              options={GOALS_LIST.map((g) => ({ value: g, label: g }))}
              hint="Steers workout recommendations."
            />
            <SelectField
              label="Experience level"
              value={level}
              onChange={(e) => setLevel(e.target.value as typeof level)}
              options={LEVELS_LIST.map((l) => ({ value: l, label: l }))}
            />
            <SelectField
              label="Training location"
              value={location}
              onChange={(e) => setLocation(e.target.value as TrainingLocation)}
              options={LOCATIONS_LIST.map((l) => ({ value: l, label: l }))}
            />
            <NumberField
              label="Preferred session length"
              min={10}
              max={180}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              suffix="min"
            />
            <SelectField
              label="Units"
              value={units}
              onChange={(e) => setUnits(e.target.value as typeof units)}
              options={[
                { value: 'kg', label: `Kilograms (${weightUnitLabel('kg')})` },
                { value: 'lb', label: `Pounds (${weightUnitLabel('lb')})` },
              ]}
              hint="Applies to all weights you enter."
            />
          </div>
        </section>

        {/* Training preferences */}
        <section aria-labelledby="prefs-title" className="panel space-y-5 p-5 md:p-6">
          <h2 id="prefs-title" className="display text-lg text-fg">
            Training preferences
          </h2>

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Available equipment
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Available equipment">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => toggleEquipment(eq)}
                  aria-pressed={equipment.includes(eq)}
                  className={cn(
                    'focus-ring min-h-11 border px-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors',
                    equipment.includes(eq)
                      ? 'border-lime bg-lime text-ink'
                      : 'border-line2 text-muted hover:border-lime hover:text-lime',
                  )}
                >
                  {eq}
                </button>
              ))}
            </div>
            {equipment.length === 0 && (
              <p className="mt-2 text-xs text-faint">Nothing selected — home/no-equipment workouts will lead the library.</p>
            )}
          </div>

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Preferred training days
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Preferred training days">
              {DAYS_LIST.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  aria-pressed={days.includes(day)}
                  className={cn(
                    'focus-ring min-h-11 border px-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors',
                    days.includes(day)
                      ? 'border-lime bg-lime text-ink'
                      : 'border-line2 text-muted hover:border-lime hover:text-lime',
                  )}
                >
                  {DAY_LABELS[day].slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 border-t border-line pt-5 md:grid-cols-2">
            <NumberField
              label="Weekly workout goal"
              min={1}
              max={14}
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(e.target.value)}
              suffix="sessions"
            />
            <div className="flex items-end">
              <div className="w-full space-y-2">
                <ToggleField
                  label="Reduced motion"
                  description="Disables entrance animations throughout BUHAT."
                  checked={reducedMotion}
                  onChange={setReducedMotion}
                />
                <ToggleField
                  label="Sound cues"
                  description="Short tones for set completion, rest end and unlocks."
                  checked={sound}
                  onChange={setSound}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg">
            <Settings2 className="size-4" aria-hidden="true" /> Save changes
          </Button>
          <Button variant="danger" onClick={() => setResetOpen(true)}>
            <Trash2 className="size-4" aria-hidden="true" /> Reset all data
          </Button>
          <p className="text-xs text-faint">Stored locally in this browser.</p>
        </div>
      </form>

      <section aria-labelledby="data-title" className="border-t border-line pt-8">
        <h2 id="data-title" className="display text-lg text-fg">
          Your data
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag tone="neutral">{data.sessions.length} sessions</Tag>
          <Tag tone="neutral">{data.plans.length} plans</Tag>
          <Tag tone="neutral">{data.achievements.length} achievements</Tag>
          <Tag tone="neutral">{data.prEvents.length} PRs</Tag>
          <Tag tone="neutral">{data.bodyWeight.length} weight entries</Tag>
        </div>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-faint">
          BUHAT stores your training data in this browser's local storage. There is no cloud sync
          and no account system. Clearing your browser data or using the reset button will remove
          it permanently.
        </p>
      </section>

      <ConfirmationDialog
        open={resetOpen}
        title="Reset all BUHAT data?"
        body="This permanently deletes your sessions, plans, achievements and settings from this browser. It cannot be undone."
        confirmLabel="Delete everything"
        cancelLabel="Keep my data"
        destructive
        onConfirm={() => {
          actions.resetAll();
          setResetOpen(false);
        }}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}

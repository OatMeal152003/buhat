import type { Prefs } from '@/types';

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export const DAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export const DAY_SHORT: Record<string, string> = {
  mon: 'MON',
  tue: 'TUE',
  wed: 'WED',
  thu: 'THU',
  fri: 'FRI',
  sat: 'SAT',
  sun: 'SUN',
};

/** Monday-based day key for a given date. */
export function dayKeyOf(date: Date): (typeof DAY_KEYS)[number] {
  const idx = (date.getDay() + 6) % 7;
  return DAY_KEYS[idx];
}

/** Monday 00:00 of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function greeting(name: string, now = new Date()): string {
  const h = now.getHours();
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return `${part}, ${name.trim() || 'Athlete'}`;
}

/** mm:ss (or h:mm:ss) clock from seconds. */
export function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Human duration for session lengths. */
export function formatDuration(totalSec: number): string {
  const min = Math.round(totalSec / 60);
  if (min < 1) return '<1 min';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function relativeDay(ts: number, now = Date.now()): string {
  const dayDiff = Math.round(
    (startOfDay(new Date(ts)).getTime() - startOfDay(new Date(now)).getTime()) / 86_400_000,
  );
  if (dayDiff === 0) return 'Today';
  if (dayDiff === -1) return 'Yesterday';
  if (dayDiff === -7) return 'Last week';
  return formatDateShort(ts);
}

/* ------------------------------------------------------------------ */
/* Units — canonical kg storage, display conversion                    */
/* ------------------------------------------------------------------ */

export const KG_TO_LB = 2.2046226218;

export function toDisplayWeight(kg: number | null | undefined, units: Prefs['units']): number {
  if (kg == null) return 0;
  return units === 'lb' ? Math.round(kg * KG_TO_LB) : Math.round(kg * 10) / 10;
}

export function toKg(value: number, units: Prefs['units']): number {
  return units === 'lb' ? value / KG_TO_LB : value;
}

export function weightUnitLabel(units: Prefs['units']): string {
  return units === 'lb' ? 'lb' : 'kg';
}

/** Display a weight compactly, e.g. 60 kg / 132 lb. */
export function formatWeight(kg: number | null | undefined, units: Prefs['units']): string {
  if (kg == null || kg === 0) return 'BW';
  return `${toDisplayWeight(kg, units)} ${weightUnitLabel(units)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

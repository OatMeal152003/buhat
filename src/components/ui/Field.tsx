import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const inputBase =
  'min-h-12 w-full border border-line bg-surface2 px-3.5 py-2.5 text-sm text-fg placeholder:text-faint focus:border-lime focus:outline-none disabled:opacity-50';

const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted';

interface TextFieldProps extends Omit<ComponentPropsWithoutRef<'input'>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
  id?: string;
}

export function TextField({ label, error, hint, id, className, ...rest }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="w-full">
      <label htmlFor={inputId} className={labelCls}>
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(inputBase, error && 'border-danger', className)}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" className="field-error mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-faint">
          {hint}
        </p>
      )}
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<ComponentPropsWithoutRef<'select'>, 'id'> {
  label: string;
  options: SelectOption[];
  hint?: string;
  id?: string;
}

export function SelectField({ label, options, hint, id, className, ...rest }: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="w-full">
      <label htmlFor={selectId} className={labelCls}>
        {label}
      </label>
      <select
        id={selectId}
        aria-describedby={hint ? `${selectId}-hint` : undefined}
        className={cn(inputBase, 'appearance-none pr-8', className)}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface2 text-fg">
            {opt.label}
          </option>
        ))}
      </select>
      {hint && (
        <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-faint">
          {hint}
        </p>
      )}
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange(checked: boolean): void;
}

export function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-sm font-semibold text-fg">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-faint">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'focus-ring relative h-7 w-12 shrink-0 border transition-colors duration-150',
          checked ? 'border-lime bg-lime/20' : 'border-line2 bg-surface2',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 transition-all duration-150',
            checked ? 'left-6 bg-lime' : 'left-0.5 bg-faint',
          )}
        />
      </button>
    </div>
  );
}

interface NumberFieldProps extends Omit<ComponentPropsWithoutRef<'input'>, 'id' | 'type'> {
  label: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
  id?: string;
}

export function NumberField({ label, error, hint, suffix, id, className, ...rest }: NumberFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="w-full">
      <label htmlFor={inputId} className={labelCls}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(inputBase, 'num pr-12', error && 'border-danger', className)}
          {...rest}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="field-error mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-faint">
          {hint}
        </p>
      )}
    </div>
  );
}

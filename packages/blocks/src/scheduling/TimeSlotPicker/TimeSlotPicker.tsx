import { useId, useState } from 'react';
import { cn } from '@gntik-ai/ui';
import { sampleTimeSlots } from './fixtures';

export interface TimeSlot {
  /** Submitted value, e.g. "09:30". */
  value: string;
  /** Visible label. Defaults to `value`. */
  label?: string;
  /** Taken slots render struck through and disabled. Default true. */
  available?: boolean;
}

export interface TimeSlotPickerProps {
  slots?: TimeSlot[];
  /** Controlled value. */
  value?: string | null;
  /** Uncontrolled initial value. */
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** Group label (the fieldset legend). */
  legend?: string;
  /** Secondary line under the legend, e.g. the chosen date. */
  description?: string;
  /** Form field name. */
  name?: string;
  /** Slot columns from the `sm` breakpoint (two on small screens). */
  columns?: 2 | 3 | 4 | 6;
  /** Max height of the scrolling slot list in px. */
  maxHeight?: number;
  className?: string;
}

const COLS: Record<NonNullable<TimeSlotPickerProps['columns']>, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  6: 'sm:grid-cols-6',
};

/**
 * Pick one time slot. Native radio semantics: Tab enters the group, arrow keys move and select,
 * taken slots are disabled.
 */
export function TimeSlotPicker({
  slots = sampleTimeSlots,
  value,
  defaultValue = null,
  onValueChange,
  legend = 'Available times',
  description,
  name,
  columns = 4,
  maxHeight = 244,
  className,
}: TimeSlotPickerProps) {
  const autoName = useId();
  const descId = useId();
  const [inner, setInner] = useState<string | null>(defaultValue);
  const current = value !== undefined ? value : inner;

  const choose = (next: string) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  return (
    <fieldset aria-describedby={description ? descId : undefined} className={cn('min-w-0', className)}>
      <legend className="text-[12.5px] font-medium text-foreground">{legend}</legend>
      {description && (
        <p id={descId} className="mt-0.5 text-[12px] text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-2.5 overflow-y-auto p-0.5" style={{ maxHeight }}>
        <div className={cn('grid grid-cols-2 gap-1.5', COLS[columns])}>
          {slots.map((slot) => {
            const available = slot.available !== false;
            return (
              <label key={slot.value} className={cn('relative block', available ? 'cursor-pointer' : 'cursor-not-allowed')}>
                <input
                  type="radio"
                  name={name ?? autoName}
                  value={slot.value}
                  checked={current === slot.value}
                  disabled={!available}
                  onChange={() => choose(slot.value)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    'flex h-8 items-center justify-center rounded-md border font-mono text-[12px] font-medium tabular-nums transition-colors motion-reduce:transition-none',
                    'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring',
                    'peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:shadow-sm',
                    available
                      ? 'border-border bg-background text-foreground hover:border-muted-foreground/40 hover:bg-secondary/60'
                      : 'border-border/50 bg-secondary/20 text-muted-foreground line-through',
                  )}
                >
                  {slot.label ?? slot.value}
                  {!available && <span className="sr-only"> (unavailable)</span>}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}

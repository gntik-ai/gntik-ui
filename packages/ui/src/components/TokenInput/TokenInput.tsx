import { Field } from '@base-ui/react/field';
import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent, type MouseEvent, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { TokenInputChip } from './TokenInputChip';
import { tokenInputVariants, type TokenInputVariantProps } from './token-input.variants';

export interface TokenInputProps extends TokenInputVariantProps {
  /** Committed entries (controlled). */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tokens: string[]) => void;
  /** Returns an error message for an invalid entry; the chip is kept and marked invalid. */
  validate?: (token: string) => string | null | undefined;
  /** Maximum number of entries; further commits are ignored. */
  maxItems?: number;
  /** Characters that commit the current text (Enter and Tab always do). */
  separators?: string[];
  /** Keep exact duplicates (case-insensitive) instead of ignoring them. */
  allowDuplicates?: boolean;
  /** Normalises an entry before it is committed (default: trim). */
  transform?: (raw: string) => string;
  /** Commit the pending text when the input loses focus. */
  commitOnBlur?: boolean;
  placeholder?: string;
  /** Submitted as one comma-separated value through a hidden input. */
  name?: string;
  id?: string;
  disabled?: boolean;
  /** Marks the field invalid. Any invalid chip does this too. */
  invalid?: boolean;
  className?: string;
  inputClassName?: string;
  ref?: Ref<HTMLInputElement>;
  removeLabel?: (token: string) => string;
  /** Accessible name of the chip list. */
  listLabel?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const defaultTransform = (raw: string) => raw.trim();

/**
 * Free-entry chips (emails, labels, hosts): Enter, Tab or a separator commits the text,
 * Backspace on an empty input removes the last chip, pasted lists are split, `validate`
 * marks bad entries. The text input is a Base UI Field control, so Field labels it.
 */
export function TokenInput({
  value,
  defaultValue,
  onValueChange,
  validate,
  maxItems,
  separators = [',', ';'],
  allowDuplicates = false,
  transform = defaultTransform,
  commitOnBlur = true,
  placeholder,
  name,
  id,
  disabled,
  invalid,
  size = 'md',
  className,
  inputClassName,
  ref,
  removeLabel = (t) => `Remove ${t}`,
  listLabel = 'Entries',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: TokenInputProps) {
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const [draft, setDraft] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const statusId = useId();
  const tokens = value ?? inner;
  const errors = tokens.map((t) => validate?.(t) ?? null);
  const hasInvalid = !!invalid || errors.some(Boolean);
  const full = maxItems != null && tokens.length >= maxItems;
  const s = tokenInputVariants({ size });
  const splitRe = new RegExp(`[${separators.map(escapeRe).join('')}\\n\\t]+`);

  const update = (next: string[], message: string) => {
    setInner(next);
    onValueChange?.(next);
    setAnnouncement(message);
  };

  /** Commits raw entries; returns whether anything was consumed. */
  const commit = (raws: string[]) => {
    const next = [...tokens];
    const added: string[] = [];
    let limited = false;
    for (const raw of raws) {
      const t = transform(raw);
      if (!t) continue;
      if (!allowDuplicates && next.some((x) => x.toLowerCase() === t.toLowerCase())) continue;
      if (maxItems != null && next.length >= maxItems) {
        limited = true;
        break;
      }
      next.push(t);
      added.push(t);
    }
    setDraft('');
    if (added.length) update(next, `Added ${added.join(', ')}.${limited ? ` Limit of ${maxItems} reached.` : ''}`);
    else if (limited) setAnnouncement(`Limit of ${maxItems} reached.`);
  };

  const remove = (index: number) => {
    const t = tokens[index];
    if (t === undefined) return;
    update(tokens.filter((_, i) => i !== index), `Removed ${t}.`);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const hasText = draft.trim() !== '';
    if ((e.key === 'Enter' || e.key === 'Tab') && hasText && !e.shiftKey) {
      e.preventDefault();
      commit([draft]);
    } else if (separators.includes(e.key)) {
      e.preventDefault();
      if (hasText) commit([draft]);
    } else if (e.key === 'Backspace' && draft === '' && tokens.length > 0) {
      e.preventDefault();
      remove(tokens.length - 1);
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (!splitRe.test(text)) return;
    e.preventDefault();
    commit((draft + text).split(splitRe));
  };

  const onRootMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    inputRef.current?.focus();
  };

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <div
      className={cn(s.root(), className)}
      data-invalid={hasInvalid || undefined}
      data-disabled={disabled || undefined}
      data-full={full || undefined}
      onMouseDown={onRootMouseDown}
    >
      {tokens.length > 0 && (
        <span role="list" aria-label={listLabel} className={s.list()}>
          {tokens.map((t, i) => (
            <TokenInputChip
              key={`${t}-${i}`}
              size={size}
              error={errors[i]}
              disabled={disabled}
              removeLabel={removeLabel(t)}
              onRemove={() => remove(i)}
            >
              {t}
            </TokenInputChip>
          ))}
        </span>
      )}
      <Field.Control
        ref={setRefs}
        id={id}
        disabled={disabled}
        value={draft}
        onValueChange={(v) => setDraft(v)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={() => {
          if (commitOnBlur && draft.trim()) commit([draft]);
        }}
        placeholder={full ? undefined : placeholder}
        autoComplete="off"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={cn(ariaDescribedBy, statusId)}
        aria-invalid={hasInvalid || undefined}
        className={cn(s.input(), inputClassName)}
      />
      {maxItems != null && (
        <span aria-hidden className={s.counter()}>
          {tokens.length}/{maxItems}
        </span>
      )}
      <span id={statusId} className="sr-only">
        {maxItems != null ? `${tokens.length} of ${maxItems} entries.` : ''}
        {errors.some(Boolean) ? ` ${errors.filter(Boolean).length} invalid.` : ''}
      </span>
      <span role="status" className="sr-only">
        {announcement}
      </span>
      {name && <input type="hidden" name={name} value={tokens.join(',')} />}
    </div>
  );
}

import { Search } from '@gntik-ai/icons';
import { IconButton, SearchField, useI18n } from '@gntik-ai/ui';
import { useEffect, useRef, useState } from 'react';
import type { DataTableLabels } from './labels';

/**
 * The toolbar search of a DataTable: a SearchField that reports its text once typing pauses, on Enter and on
 * clear, and a polite status with the match count after a term applies. `collapsible` starts as a button.
 */
export function QuickFilter({
  mode,
  caption,
  term,
  count,
  debounceMs,
  onApply,
  labels,
}: {
  mode: true | 'collapsible';
  caption: string;
  /** The applied term. */
  term: string;
  /** Rows matching the applied term. */
  count: number;
  debounceMs: number;
  onApply: (value: string) => void;
  labels?: Pick<DataTableLabels, 'quickFilter' | 'quickFilterResults'>;
}) {
  const { t } = useI18n();
  const name = labels?.quickFilter ? labels.quickFilter(caption) : t('table.quickFilter', { caption });
  const [draft, setDraft] = useState(term);
  const [sync, setSync] = useState({ seen: term, applied: term });
  // A term changed from outside replaces the draft; one this field applied itself must not clobber later typing.
  if (term !== sync.seen) {
    setSync({ seen: term, applied: sync.applied });
    if (term !== sync.applied) setDraft(term);
  }

  const [open, setOpen] = useState(term !== '');
  // An active term keeps the field visible, so an applied search is never hidden.
  if (term !== '' && !open) setOpen(true);
  const focusAfter = useRef<'field' | 'button' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const target = focusAfter.current;
    focusAfter.current = null;
    (target === 'field' ? inputRef : target === 'button' ? buttonRef : null)?.current?.focus();
  });

  const collapsed = mode === 'collapsible' && !open;
  return (
    <>
      {collapsed ? (
        <IconButton
          ref={buttonRef}
          icon={Search}
          label={name}
          size="sm"
          variant="secondary"
          aria-expanded={false}
          onClick={() => {
            setOpen(true);
            focusAfter.current = 'field';
          }}
        />
      ) : (
        <SearchField
          ref={inputRef}
          aria-label={name}
          size="sm"
          value={draft}
          debounceMs={debounceMs}
          onValueChange={setDraft}
          onSearch={(value) => {
            setSync((current) => ({ ...current, applied: value }));
            onApply(value);
          }}
          onKeyDown={(event) => {
            if (mode === 'collapsible' && event.key === 'Escape' && event.currentTarget.value === '') {
              event.stopPropagation();
              setOpen(false);
              focusAfter.current = 'button';
            }
          }}
          onBlur={(event) => {
            if (mode === 'collapsible' && event.currentTarget.value === '' && term === '') setOpen(false);
          }}
          className="w-full sm:w-64"
        />
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {term.trim() === ''
          ? null
          : labels?.quickFilterResults
            ? labels.quickFilterResults(count)
            : t('table.quickFilterResults', { count })}
      </span>
    </>
  );
}

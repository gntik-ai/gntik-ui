import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { ListFilter, X } from 'lucide-react';
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../../utils/cn';
import { PowerSearchChip } from './PowerSearchChip';
import {
  coerceValue,
  defaultOperatorLabels,
  emptyPowerSearchQuery,
  findField,
  formatPowerSearch,
  operatorsFor,
  valueOptions,
  type PowerSearchField,
  type PowerSearchFilter,
  type PowerSearchOperator,
  type PowerSearchQuery,
  type PowerSearchTerm,
} from './power-search-query';
import { powerSearchVariants } from './power-search.variants';

export interface PowerSearchLabels {
  input: string;
  terms: string;
  clear: string;
  freeText: (text: string) => string;
  remove: (description: string) => string;
  editHint: string;
  added: (description: string) => string;
  removed: (description: string) => string;
  invalidValue: (field: string) => string;
  typeValue: string;
}

const defaultLabels: PowerSearchLabels = {
  input: 'Search and filter',
  terms: 'Active filters',
  clear: 'Clear all filters',
  freeText: (t) => `Search for “${t}”`,
  remove: (d) => `Remove ${d}`,
  editHint: 'Enter to edit, Delete to remove',
  added: (d) => `Added ${d}.`,
  removed: (d) => `Removed ${d}.`,
  invalidValue: (f) => `Not a valid ${f} value.`,
  typeValue: 'Type a value and press Enter.',
};

interface Suggestion {
  id: string;
  label: string;
  kind: 'field' | 'operator' | 'value' | 'text';
  key: string;
  code?: string;
  hint?: string;
}

interface Draft<K extends string> {
  field?: K;
  operator?: PowerSearchOperator;
}

export interface PowerSearchProps<K extends string = string> {
  fields: PowerSearchField<K>[];
  value?: PowerSearchQuery<K>;
  defaultValue?: PowerSearchQuery<K>;
  onValueChange?: (query: PowerSearchQuery<K>) => void;
  /** Enter on an empty input. */
  onSubmit?: (query: PowerSearchQuery<K>) => void;
  /** Allow free-text terms besides field filters. */
  allowFreeText?: boolean;
  placeholder?: string;
  /** Submitted as the formatted query string through a hidden input. */
  name?: string;
  disabled?: boolean;
  labels?: Partial<PowerSearchLabels>;
  operatorLabels?: Partial<Record<PowerSearchOperator, string>>;
  className?: string;
  'aria-label'?: string;
}

const TYPED = /^([\w.-]+)\s*(!=|>=|<=|!~|=|~|:|>|<)(.*)$/s;

/**
 * Structured filter input: field → operator → value suggestions (Base UI Combobox), typed
 * shortcuts (`status=failed`, `cost>100`), free text, and keyboard editing of the committed
 * terms. Emits a typed query AST (`{ type: 'and', terms }`); see `matchPowerSearch`.
 */
export function PowerSearch<K extends string = string>({
  fields,
  value,
  defaultValue,
  onValueChange,
  onSubmit,
  allowFreeText = true,
  placeholder = 'Filter by field or search…',
  name,
  disabled,
  labels: labelsProp,
  operatorLabels: opLabelsProp,
  className,
  'aria-label': ariaLabel,
}: PowerSearchProps<K>) {
  const labels = { ...defaultLabels, ...labelsProp };
  const opLabels = { ...defaultOperatorLabels, ...opLabelsProp };
  const [inner, setInner] = useState<PowerSearchQuery<K>>(defaultValue ?? emptyPowerSearchQuery<K>());
  const query = value ?? inner;
  const [draft, setDraft] = useState<Draft<K>>({});
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const focusChip = useRef<number | null>(null);
  const draftId = useId();
  const s = powerSearchVariants();

  const field = draft.field ? fields.find((f) => f.key === draft.field) : undefined;
  const stage = !field ? 'field' : !draft.operator ? 'operator' : 'value';
  const fieldLabel = (f?: PowerSearchField<K>) => f?.label ?? f?.key ?? '';
  const describe = (t: PowerSearchTerm<K>) => {
    if (t.type === 'text') return `“${t.value}”`;
    const f = fields.find((x) => x.key === t.field);
    const opt = f ? valueOptions(f).find((o) => o.value === t.value) : undefined;
    return `${fieldLabel(f) || t.field} ${opLabels[t.operator]} ${opt?.label ?? t.value}`;
  };

  useLayoutEffect(() => {
    if (focusChip.current === null) return;
    const i = focusChip.current;
    focusChip.current = null;
    const el = i < 0 ? inputRef.current : rootRef.current?.querySelector<HTMLElement>(`[data-chip-index="${i}"]`);
    (el ?? inputRef.current)?.focus();
  });

  const setTerms = (terms: PowerSearchTerm<K>[], message: string) => {
    const next: PowerSearchQuery<K> = { type: 'and', terms };
    setInner(next);
    onValueChange?.(next);
    setAnnouncement(message);
  };

  const commitFilter = (f: PowerSearchField<K>, op: PowerSearchOperator, raw: string) => {
    const v = coerceValue(f, raw);
    if (v === null) {
      setAnnouncement(labels.invalidValue(fieldLabel(f)));
      return;
    }
    const term: PowerSearchFilter<K> = { type: 'filter', field: f.key, operator: op, value: v };
    setTerms([...query.terms, term], labels.added(describe(term)));
    setDraft({});
    setInput('');
    setOpen(false);
  };

  const commitText = (text: string) => {
    const t = text.trim();
    if (!t || !allowFreeText) return;
    setTerms([...query.terms, { type: 'text', value: t }], labels.added(`“${t}”`));
    setInput('');
    setOpen(false);
  };

  const removeTerm = (i: number, focusAfter: number) => {
    const t = query.terms[i];
    if (!t) return;
    setTerms(query.terms.filter((_, j) => j !== i), labels.removed(describe(t)));
    focusChip.current = focusAfter;
  };

  const editTerm = (i: number) => {
    const t = query.terms[i];
    if (!t) return;
    setTerms(query.terms.filter((_, j) => j !== i), '');
    if (t.type === 'text') {
      setDraft({});
      setInput(t.value);
    } else {
      setDraft({ field: t.field, operator: t.operator });
      setInput(String(t.value));
    }
    focusChip.current = -1;
  };

  /** Typed shortcuts: `status=` jumps to the value, an exact operator jumps past it. */
  const onInputChange = (v: string) => {
    if (stage === 'field') {
      const m = v.match(TYPED);
      const f = m ? findField(fields, m[1] ?? '') : undefined;
      const op = (m?.[2] === ':' ? '=' : m?.[2]) as PowerSearchOperator | undefined;
      const rest = m?.[3] ?? '';
      if (f && op && operatorsFor(f).includes(op) && !((op === '>' || op === '<') && rest === '')) {
        setDraft({ field: f.key, operator: op });
        setInput(rest.trimStart());
        setOpen(true);
        return;
      }
    } else if (stage === 'operator' && field) {
      const ops = operatorsFor(field);
      const typed = v.trim() === ':' ? '=' : v.trim();
      if (ops.includes(typed as PowerSearchOperator) && !ops.some((o) => o !== typed && o.startsWith(typed))) {
        setDraft({ ...draft, operator: typed as PowerSearchOperator });
        setInput('');
        return;
      }
    }
    setInput(v);
    if (!open) setOpen(true);
  };

  const q = input.trim().toLowerCase();
  let suggestions: Suggestion[] = [];
  if (stage === 'field') {
    suggestions = fields
      .filter((f) => !q || f.key.toLowerCase().includes(q) || f.label?.toLowerCase().includes(q))
      .map((f) => ({ id: `field:${f.key}`, label: fieldLabel(f), kind: 'field' as const, key: f.key, hint: f.description }));
    if (q && allowFreeText) suggestions.push({ id: `text:${q}`, label: labels.freeText(input.trim()), kind: 'text', key: input.trim() });
  } else if (stage === 'operator' && field) {
    suggestions = operatorsFor(field)
      .filter((o) => !q || o.startsWith(q) || opLabels[o].toLowerCase().includes(q))
      .map((o) => ({ id: `op:${o}`, label: opLabels[o], kind: 'operator' as const, key: o, code: o }));
  } else if (field) {
    suggestions = valueOptions(field)
      .filter((o) => !q || o.value.toLowerCase().includes(q) || o.label?.toLowerCase().includes(q))
      .map((o) => ({ id: `value:${o.value}`, label: o.label ?? o.value, kind: 'value' as const, key: o.value }));
  }

  const onSelect = (item: Suggestion | null) => {
    if (!item) return;
    if (item.kind === 'field') {
      setDraft({ field: item.key as K });
      setInput('');
      setOpen(true);
    } else if (item.kind === 'operator') {
      setDraft({ ...draft, operator: item.key as PowerSearchOperator });
      setInput('');
      setOpen(true);
    } else if (item.kind === 'value' && field && draft.operator) commitFilter(field, draft.operator, item.key);
    else if (item.kind === 'text') commitText(item.key);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement> & { preventBaseUIHandler?: () => void }) => {
    const el = e.currentTarget;
    const atStart = el.selectionStart === 0 && el.selectionEnd === 0;
    const activeId = el.getAttribute('aria-activedescendant');
    const hasHighlight = open && !!activeId && !!document.getElementById(activeId);
    if (e.key === 'Enter' && !hasHighlight) {
      e.preventDefault();
      e.preventBaseUIHandler?.();
      if (stage === 'value' && field && draft.operator) {
        if (input.trim()) commitFilter(field, draft.operator, input);
      } else if (stage === 'field' && input.trim()) commitText(input);
      else if (stage === 'field' && !input.trim()) onSubmit?.(query);
    } else if (e.key === 'Backspace' && input === '') {
      e.preventDefault();
      if (draft.operator) setDraft({ field: draft.field });
      else if (draft.field) setDraft({});
      else if (query.terms.length) editTerm(query.terms.length - 1);
    } else if (e.key === 'ArrowLeft' && atStart && !draft.field && query.terms.length) {
      e.preventDefault();
      setOpen(false);
      rootRef.current?.querySelector<HTMLElement>(`[data-chip-index="${query.terms.length - 1}"]`)?.focus();
    } else if (e.key === 'Escape' && !open && (draft.field || input)) {
      e.preventBaseUIHandler?.();
      setDraft({});
      setInput('');
    }
  };

  const onChipKeyDown = (i: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = query.terms.length;
    const moves: Record<string, number> = { ArrowLeft: Math.max(i - 1, 0), ArrowRight: i + 1 >= n ? -1 : i + 1, Home: 0, End: -1, Escape: -1 };
    if (e.key in moves) {
      e.preventDefault();
      focusChip.current = moves[e.key] ?? -1;
      setAnnouncement((a) => a + '​'.slice(0, 0));
      const el = focusChip.current < 0 ? inputRef.current : rootRef.current?.querySelector<HTMLElement>(`[data-chip-index="${focusChip.current}"]`);
      focusChip.current = null;
      el?.focus();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      removeTerm(i, n - 1 <= 0 ? -1 : e.key === 'Backspace' ? Math.max(i - 1, 0) : i >= n - 1 ? -1 : i);
    }
  };

  const draftField = fieldLabel(field);
  return (
    <div ref={rootRef} className={cn(s.root(), className)} data-disabled={disabled || undefined} onMouseDown={(e) => {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }}>
      <ListFilter size={15} aria-hidden className={s.icon()} />
      {query.terms.length > 0 && (
        <span role="list" aria-label={labels.terms} className={s.terms()}>
          {query.terms.map((t, i) => {
            const f = t.type === 'filter' ? fields.find((x) => x.key === t.field) : undefined;
            const opt = f && t.type === 'filter' ? valueOptions(f).find((o) => o.value === t.value) : undefined;
            const d = describe(t);
            return (
              <PowerSearchChip
                key={`${i}-${t.type === 'text' ? t.value : `${t.field}${t.operator}${t.value}`}`}
                index={i}
                field={t.type === 'filter' ? fieldLabel(f) || t.field : undefined}
                operator={t.type === 'filter' ? t.operator : undefined}
                value={t.type === 'filter' ? (opt?.label ?? String(t.value)) : t.value}
                description={d}
                removeLabel={labels.remove(d)}
                editHint={labels.editHint}
                disabled={disabled}
                onKeyDown={onChipKeyDown(i)}
                onEdit={() => editTerm(i)}
                onRemove={() => removeTerm(i, -1)}
              />
            );
          })}
        </span>
      )}
      {field && (
        <span className={s.draft()}>
          <span aria-hidden>{draftField}</span>
          {draft.operator && <span aria-hidden className="opacity-75">{draft.operator}</span>}
          <span id={draftId} className="sr-only">
            {`${draftField} ${draft.operator ? opLabels[draft.operator] : ''}`.trim()}
          </span>
        </span>
      )}
      <BaseCombobox.Root<Suggestion>
        items={suggestions}
        filter={null}
        value={null}
        onValueChange={(item) => onSelect(item as Suggestion | null)}
        inputValue={input}
        onInputValueChange={(v, details) => {
          // Only typing edits the text: Base UI also clears or fills it on focus and selection.
          if (details.reason === 'input-change') onInputChange(v);
        }}
        open={open && !disabled}
        onOpenChange={(next, details) => {
          if (!next && details.reason === 'item-press') return;
          setOpen(next);
        }}
        itemToStringLabel={(item) => (item as Suggestion).label}
        disabled={disabled}
      >
        <BaseCombobox.Input
          ref={inputRef}
          aria-label={ariaLabel ?? labels.input}
          aria-describedby={field ? draftId : undefined}
          placeholder={query.terms.length || field ? undefined : placeholder}
          className={s.input()}
          onKeyDown={onKeyDown}
        />
        <BaseCombobox.Portal>
          <BaseCombobox.Positioner className={s.positioner()} side="bottom" align="start" sideOffset={8} anchor={rootRef}>
            <BaseCombobox.Popup className={s.popup()}>
              <BaseCombobox.Empty className={s.empty()}>{stage === 'value' ? labels.typeValue : null}</BaseCombobox.Empty>
              <BaseCombobox.List className="outline-none data-empty:hidden">
                {(item: Suggestion) => (
                  <BaseCombobox.Item key={item.id} value={item} className={s.item()}>
                    <span className={s.itemMain()}>
                      {item.code && <span className={s.itemCode()}>{item.code}</span>}
                      <span className="truncate">{item.label}</span>
                      {item.hint && <span className={s.itemHint()}>{item.hint}</span>}
                    </span>
                  </BaseCombobox.Item>
                )}
              </BaseCombobox.List>
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
      {query.terms.length > 0 && (
        <button type="button" aria-label={labels.clear} className={s.clear()} disabled={disabled} onClick={() => {
          setTerms([], labels.clear + '.');
          inputRef.current?.focus();
        }}>
          <X size={14} aria-hidden />
        </button>
      )}
      <span role="status" data-announcer="" className="sr-only">
        {announcement}
      </span>
      {name && <input type="hidden" name={name} value={formatPowerSearch(query)} />}
    </div>
  );
}

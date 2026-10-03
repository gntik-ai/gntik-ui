import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { Check, ChevronDown, X } from 'lucide-react';
import { useId, useRef, useState, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { comboboxVariants } from '../Combobox/combobox.variants';
import { multiSelectVariants, type MultiSelectVariantProps } from './multi-select.variants';

const cb = comboboxVariants();

export interface MultiSelectOption {
  value: string;
  label: string;
  /** Secondary line under the label. */
  description?: string;
  disabled?: boolean;
}

export interface MultiSelectProps extends MultiSelectVariantProps {
  options: MultiSelectOption[];
  /** Selected option values (controlled). */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
  /** Visible label bound to the input. Inside a Field, use FieldLabel instead. */
  label?: ReactNode;
  placeholder?: string;
  /** Chips shown before collapsing the rest into "+N". */
  maxVisibleChips?: number;
  /** Adds a "Select all" row (while the search is empty). */
  showSelectAll?: boolean;
  selectAllLabel?: string;
  /** Label of the same row once every option is selected. */
  deselectAllLabel?: string;
  clearLabel?: string;
  triggerLabel?: string;
  emptyText?: ReactNode;
  removeLabel?: (label: string) => string;
  /** Custom row content. */
  renderOption?: (option: MultiSelectOption) => ReactNode;
  name?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  ref?: Ref<HTMLInputElement>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const SELECT_ALL: MultiSelectOption = { value: '\u0000select-all', label: '' };
const matches = (o: MultiSelectOption, q: string) =>
  o === SELECT_ALL ? q.trim() === '' : `${o.label} ${o.description ?? ''}`.toLowerCase().includes(q.trim().toLowerCase());

/**
 * Searchable multi-select on Base UI Combobox (multiple): selected options as removable chips
 * (extra ones collapse into "+N"), an optional "Select all" row and a clear button.
 */
export function MultiSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder = 'Search…',
  maxVisibleChips = 3,
  showSelectAll = true,
  selectAllLabel = 'Select all',
  deselectAllLabel = 'Deselect all',
  clearLabel = 'Clear all',
  triggerLabel = 'Show options',
  emptyText = 'No matches.',
  removeLabel = (l) => `Remove ${l}`,
  renderOption,
  name,
  id,
  disabled,
  invalid,
  size = 'md',
  className,
  ref,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: MultiSelectProps) {
  const autoId = useId();
  const inputId = id ?? (label ? autoId : undefined);
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const values = value ?? inner;
  // While the popup is open Base UI aria-hides outside nodes, <label> included; aria-labelledby
  // still resolves through hidden elements, so a Field label's id is mirrored onto the input.
  const [fieldLabelId, setFieldLabelId] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const selected = values.map((v) => options.find((o) => o.value === v)).filter((o): o is MultiSelectOption => !!o);
  const enabled = options.filter((o) => !o.disabled);
  const allSelected = enabled.length > 0 && enabled.every((o) => values.includes(o.value));
  const items = showSelectAll ? [SELECT_ALL, ...options] : options;
  const s = multiSelectVariants({ size });
  const v = comboboxVariants({ size });

  const commit = (next: string[]) => {
    setInner(next);
    onValueChange?.(next);
  };

  const handleChange = (next: MultiSelectOption[]) => {
    if (next.includes(SELECT_ALL)) {
      const enabledValues = enabled.map((o) => o.value);
      commit(allSelected ? values.filter((x) => !enabledValues.includes(x)) : [...values, ...enabledValues.filter((x) => !values.includes(x))]);
      return;
    }
    commit(next.map((o) => o.value));
  };

  const visible = selected.slice(0, maxVisibleChips);
  const hidden = selected.length - visible.length;

  return (
    <BaseCombobox.Root
      items={items}
      multiple
      value={selected}
      onValueChange={handleChange}
      filter={matches}
      isItemEqualToValue={(a: MultiSelectOption, b: MultiSelectOption) => a.value === b.value}
      itemToStringLabel={(o: MultiSelectOption) => o.label}
      itemToStringValue={(o: MultiSelectOption) => o.value}
      name={name}
      disabled={disabled}
      onOpenChange={(open) => {
        if (open && !label) setFieldLabelId(inputRef.current?.labels?.[0]?.id || undefined);
      }}
    >
      {label && (
        <label id={`${inputId}-label`} htmlFor={inputId} className={cb.label()}>
          {label}
        </label>
      )}
      <BaseCombobox.InputGroup className={cn(cb.chipsGroup(), s.group(), className)} data-invalid={invalid || undefined}>
        <BaseCombobox.Chips className={cb.chips()}>
          {visible.map((o) => (
            <BaseCombobox.Chip key={o.value} className={cb.chip()} aria-label={o.label}>
              {o.label}
              <BaseCombobox.ChipRemove aria-label={removeLabel(o.label)} className={cb.chipRemove()}>
                <X size={11} strokeWidth={2.4} aria-hidden />
              </BaseCombobox.ChipRemove>
            </BaseCombobox.Chip>
          ))}
          {hidden > 0 && (
            <span className={s.more()}>
              +{hidden}
              <span className="sr-only"> more selected</span>
            </span>
          )}
          <BaseCombobox.Input
            ref={setRefs}
            id={inputId}
            aria-labelledby={label ? `${inputId}-label` : ariaLabel ? undefined : fieldLabelId}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-invalid={invalid || undefined}
            placeholder={selected.length ? undefined : placeholder}
            className={cb.chipsInput()}
          />
        </BaseCombobox.Chips>
        {selected.length > 0 && (
          <BaseCombobox.Clear aria-label={clearLabel} className={v.iconButton()}>
            <X size={14} aria-hidden />
          </BaseCombobox.Clear>
        )}
        <BaseCombobox.Trigger aria-label={triggerLabel} className={cn('group', v.iconButton())}>
          <ChevronDown size={15} aria-hidden className={cb.chevron()} />
        </BaseCombobox.Trigger>
      </BaseCombobox.InputGroup>
      <BaseCombobox.Portal>
        <BaseCombobox.Positioner className={cb.positioner()} side="bottom" align="start" sideOffset={6}>
          <BaseCombobox.Popup className={cb.popup()}>
            <BaseCombobox.Empty className={cb.empty()}>{emptyText}</BaseCombobox.Empty>
            <BaseCombobox.List className={cb.list()}>
              {(o: MultiSelectOption) =>
                o === SELECT_ALL ? (
                  <BaseCombobox.Item key={o.value} value={o} className={cn(cb.item(), s.selectAll())}>
                    <span className={cb.itemContent()}>{allSelected ? deselectAllLabel : selectAllLabel}</span>
                    <span className={s.check()}>{allSelected && <Check size={15} strokeWidth={2.4} aria-hidden />}</span>
                  </BaseCombobox.Item>
                ) : (
                  <BaseCombobox.Item key={o.value} value={o} disabled={o.disabled} className={cb.item()}>
                    <span className={cb.itemContent()}>
                      {renderOption ? (
                        renderOption(o)
                      ) : (
                        <span className="min-w-0">
                          <span className="block truncate">{o.label}</span>
                          {o.description && <span className={s.description()}>{o.description}</span>}
                        </span>
                      )}
                    </span>
                    <BaseCombobox.ItemIndicator className={cb.indicator()}>
                      <Check size={15} strokeWidth={2.4} aria-hidden />
                    </BaseCombobox.ItemIndicator>
                  </BaseCombobox.Item>
                )
              }
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}

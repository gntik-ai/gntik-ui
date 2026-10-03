import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { Check, ChevronDown, X } from 'lucide-react';
import { useId, useRef, useState, type ReactNode, type Ref } from 'react';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { ComboboxSpecialItem } from '../Combobox/Combobox';
import { comboboxVariants } from '../Combobox/combobox.variants';
import { createItem, hasExactLabel, isSpecialItem, retryItem, type SpecialItem } from '../Combobox/specialItems';
import { useAsyncOptions, type LoadOptions } from '../Combobox/useAsyncOptions';
import { Spinner } from '../Spinner';
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
  /**
   * Async options, loaded (debounced) for the typed query with an `AbortSignal` for stale requests.
   * Loaded options replace `options` in the list; selected ones keep their labels. No "Select all".
   */
  loadOptions?: LoadOptions<MultiSelectOption>;
  /** Debounce for `loadOptions`, in ms. Default 250. */
  debounceMs?: number;
  /** Creatable: adds a "Create “…”" row; return the new option (or a promise of it) to select it. */
  onCreate?: (input: string) => MultiSelectOption | void | Promise<MultiSelectOption | void>;
  /** Text of the create row. Default: "Create “{input}”". */
  createLabel?: (input: string) => ReactNode;
  /** Shown while options load. Default: "Loading…". */
  loadingText?: ReactNode;
  /** Shown when `loadOptions` rejects. Default: "Couldn’t load options." */
  errorText?: ReactNode;
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
  placeholder: placeholderProp,
  maxVisibleChips = 3,
  showSelectAll = true,
  selectAllLabel: selectAllLabelProp,
  deselectAllLabel: deselectAllLabelProp,
  clearLabel: clearLabelProp,
  triggerLabel: triggerLabelProp,
  emptyText: emptyTextProp,
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
  loadOptions,
  debounceMs,
  onCreate,
  createLabel,
  loadingText,
  errorText,
}: MultiSelectProps) {
  const { t } = useI18n();
  const placeholder = placeholderProp ?? t('common.searchPlaceholder');
  const selectAllLabel = selectAllLabelProp ?? t('common.selectAll');
  const deselectAllLabel = deselectAllLabelProp ?? t('common.deselectAll');
  const clearLabel = clearLabelProp ?? t('common.clearAll');
  const triggerLabel = triggerLabelProp ?? t('common.showOptions');
  const emptyText = emptyTextProp ?? t('common.noMatches');
  const dir = usePortalDir();
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
  // Async / creatable: options seen in results or created keep resolving after the list changes.
  const [known, setKnown] = useState<MultiSelectOption[]>([]);
  const remember = (more: readonly MultiSelectOption[]) =>
    setKnown((prev) => [...prev.filter((p) => !more.some((m) => m.value === p.value)), ...more]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const query = input.trim();
  const remote = useAsyncOptions(loadOptions, query, { debounceMs, enabled: open, onResult: remember });
  const listed: MultiSelectOption[] = loadOptions ? (remote.error ? [] : [...remote.items]) : options;
  const pool = [...listed, ...known, ...options];
  const selected = values.map((v) => pool.find((o) => o.value === v)).filter((o): o is MultiSelectOption => !!o);
  const enabled = listed.filter((o) => !o.disabled);
  const allSelected = enabled.length > 0 && enabled.every((o) => values.includes(o.value));
  const specials: SpecialItem[] = [];
  if (onCreate && query !== '' && !hasExactLabel(listed, query, (o) => o.label)) specials.push(createItem(query));
  if (loadOptions && remote.error && !remote.loading) specials.push(retryItem(input));
  const items: Array<MultiSelectOption | SpecialItem> = [...(showSelectAll && !loadOptions ? [SELECT_ALL] : []), ...listed, ...specials];
  const busy = !!loadOptions && (remote.loading || !!remote.error);
  const s = multiSelectVariants({ size });
  const v = comboboxVariants({ size });

  const commit = (next: string[]) => {
    setInner(next);
    onValueChange?.(next);
  };

  const create = async (text: string) => {
    const created = await onCreate?.(text);
    if (!created) return;
    remember([created]);
    commit([...values.filter((x) => x !== created.value), created.value]);
  };

  const handleChange = (next: Array<MultiSelectOption | SpecialItem>) => {
    const special = next.find(isSpecialItem);
    if (special) {
      if (special.__gntikSpecial === 'retry') remote.reload();
      else void create(special.value);
      return;
    }
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
      filter={(o: MultiSelectOption | SpecialItem, q: string) => isSpecialItem(o) || !!loadOptions || matches(o, q)}
      isItemEqualToValue={(a: MultiSelectOption | SpecialItem, b: MultiSelectOption | SpecialItem) =>
        isSpecialItem(a) || isSpecialItem(b) ? a === b : a.value === b.value
      }
      itemToStringLabel={(o: MultiSelectOption | SpecialItem) => o.label}
      itemToStringValue={(o: MultiSelectOption | SpecialItem) => o.value}
      name={name}
      disabled={disabled}
      onInputValueChange={setInput}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && !label) setFieldLabelId(inputRef.current?.labels?.[0]?.id || undefined);
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
              <span className="sr-only"> {t('multiSelect.moreSelected')}</span>
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
        <BaseCombobox.Positioner dir={dir} className={cb.positioner()} side="bottom" align="start" sideOffset={6}>
          <BaseCombobox.Popup className={cb.popup()}>
            {(loadOptions || onCreate) && (
              <BaseCombobox.Status className={cn(cb.status(), !!remote.error && !remote.loading && cb.statusError())}>
                {remote.loading ? (
                  <>
                    <Spinner size={13} />
                    {loadingText ?? t('common.loading')}
                  </>
                ) : remote.error ? (
                  (errorText ?? t('combobox.loadFailed'))
                ) : null}
              </BaseCombobox.Status>
            )}
            <BaseCombobox.Empty className={cb.empty()}>{busy ? null : emptyText}</BaseCombobox.Empty>
            <BaseCombobox.List className={cb.list()} aria-busy={remote.loading || undefined}>
              {(o: MultiSelectOption | SpecialItem) =>
                isSpecialItem(o) ? (
                  <ComboboxSpecialItem key={`${o.__gntikSpecial}:${o.value}`} item={o} createLabel={createLabel} />
                ) : o === SELECT_ALL ? (
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

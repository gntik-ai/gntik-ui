import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import { RotateCw, X } from 'lucide-react';
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { usePortalContainer } from '../../utils/portal';
import { useI18n, usePortalDir } from '../../i18n/I18nProvider';
import { useFieldVariant } from '../../field-variant/field-variant-context';
import { cn } from '../../utils/cn';
import { Spinner } from '../Spinner';
import { selectVariants } from '../Select/select.variants';
import { comboboxVariants } from '../Combobox/combobox.variants';
import { defaultItemLabel, isSpecialItem, retryItem, type SpecialItem } from '../Combobox/specialItems';
import { useAsyncOptions, type LoadOptions } from '../Combobox/useAsyncOptions';
import { autocompleteVariants } from './autocomplete.variants';

/** A labelled group of suggestions. */
export interface AutocompleteGroup<Item> {
  label: string;
  items: readonly Item[];
}

export interface AutocompleteProps<Item = string> {
  /** The input text (controlled). */
  value?: string;
  /** The initial input text (uncontrolled). Default ''. */
  defaultValue?: string;
  /** Called with the text whenever it changes: typing, picking a suggestion, clearing. */
  onValueChange?: (value: string) => void;
  /** Field name for native forms: the form value is the input text. */
  name?: string;
  /**
   * Suggestions, filtered by the typed text. Flat, or groups `{ label, items }` (groups with no
   * match are hidden). Give the item type explicitly when passing groups: `<Autocomplete<string> …/>`.
   */
  items?: readonly Item[] | readonly AutocompleteGroup<Item>[];
  /** Text of an item, shown in the input when it is picked. Default `item.label`, else `String(item)`. */
  itemToString?: (item: Item) => string;
  /** Custom row content. Default: the item text. */
  renderItem?: (item: Item) => ReactNode;
  /** Called once with the full item when a suggestion is picked (Enter, click or press-drag-release). */
  onItemSelect?: (item: Item) => void;
  /**
   * Async suggestions: called (debounced) with the typed text and an `AbortSignal` that fires when
   * the request goes stale. The returned items are shown as-is (no client filter).
   */
  loadOptions?: LoadOptions<Item>;
  /** Debounce for `loadOptions`, in ms. Default 250. */
  debounceMs?: number;
  /** Show at most this many suggestions; a status line says how many more match. */
  limit?: number;
  /** `both` fills the rest of the first match as selected text while typing. Default `list`. */
  mode?: 'list' | 'both';
  /** Show a clear button while the field is not empty. */
  clearable?: boolean;
  /** Visible label bound to the input. Without it, pass `aria-label` (or use `Field`). */
  label?: ReactNode;
  placeholder?: string;
  size?: 'auto' | 'sm' | 'md';
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

const isGroupOf = <Item,>(entry: unknown): entry is AutocompleteGroup<Item> =>
  !!entry &&
  typeof entry === 'object' &&
  Array.isArray((entry as { items?: unknown }).items) &&
  typeof (entry as { label?: unknown }).label === 'string';

const startsWithText = (full: string, typed: string) => full.toLocaleLowerCase().startsWith(typed.toLocaleLowerCase());

/** Base UI's grouped collection shape. */
interface BaseGroup<Item> {
  value: string;
  items: readonly Item[];
}

interface Suggestions<Item> {
  grouped: boolean;
  groups: BaseGroup<Item>[];
  flat: Item[];
  /** Options rendered, after the cap. */
  shown: number;
  /** Options that match, before the cap. */
  total: number;
}

/** Filters flat or grouped suggestions, then caps them: the cap must not hide the total. */
function selectSuggestions<Item>(
  source: readonly (Item | AutocompleteGroup<Item>)[],
  matches: (item: Item) => boolean,
  limit: number | undefined,
  allowGroups: boolean,
): Suggestions<Item> {
  const grouped = allowGroups && source.some((entry) => isGroupOf<Item>(entry));
  let remaining = limit !== undefined && limit >= 0 ? limit : Infinity;
  let total = 0;
  const take = (list: readonly Item[]): Item[] => {
    const found = list.filter(matches);
    total += found.length;
    const kept = found.slice(0, remaining);
    remaining -= kept.length;
    return kept;
  };
  const groups: BaseGroup<Item>[] = [];
  let flat: Item[] = [];
  if (grouped) {
    for (const entry of source) {
      if (!isGroupOf<Item>(entry)) continue;
      const kept = take(entry.items);
      if (kept.length) groups.push({ value: entry.label, items: kept });
    }
  } else {
    flat = take(source as readonly Item[]);
  }
  const shown = grouped ? groups.reduce((n, g) => n + g.items.length, 0) : flat.length;
  return { grouped, groups, flat, shown, total };
}

/**
 * Free-text field with suggestions. The value is whatever is typed: blur, Tab and Enter never
 * replace it, and picking a suggestion only fills the input and reports the item. Use Combobox
 * when the value must be a listed item.
 */
export function Autocomplete<Item = string>({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  name,
  items,
  itemToString,
  renderItem,
  onItemSelect,
  loadOptions,
  debounceMs,
  limit,
  mode = 'list',
  clearable = false,
  label,
  placeholder,
  size,
  disabled,
  invalid,
  id,
  className,
  'aria-label': ariaLabel,
}: AutocompleteProps<Item>) {
  const { t, locale } = useI18n();
  const portalContainer = usePortalContainer();
  const dir = usePortalDir();
  const fieldVariant = useFieldVariant();
  const core = BaseAutocomplete.useFilter({ locale });
  const autoId = useId();
  const inputId = id ?? autoId;
  const v = comboboxVariants({ size, variant: fieldVariant });
  const extra = autocompleteVariants();
  const s = comboboxVariants();
  const groupStyles = selectVariants();

  const [inner, setInner] = useState(defaultValue);
  const value = valueProp ?? inner;
  const [open, setOpen] = useState(false);
  // The typed text a completion may be shown for: set by an inserted character, cleared by any other edit.
  const [completeFor, setCompleteFor] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightedRef = useRef<unknown>(undefined);
  const keepOpen = useRef(false);
  const rows = useRef(new WeakMap<Element, unknown>());

  const toText = (item: Item | SpecialItem): string =>
    isSpecialItem(item) ? item.label : itemToString ? itemToString(item as Item) : defaultItemLabel(item);

  const query = value.trim();
  const remote = useAsyncOptions<Item>(loadOptions, query, { debounceMs, enabled: open });

  // Matches first, then the cap: the cap must not hide the total.
  const source: readonly (Item | AutocompleteGroup<Item>)[] = loadOptions
    ? remote.error
      ? []
      : remote.items
    : ((items as readonly (Item | AutocompleteGroup<Item>)[] | undefined) ?? []);
  const matches = (item: Item) => !!loadOptions || query === '' || core.contains(item, query, (i) => toText(i as Item));
  const { grouped, groups, flat, shown, total } = selectSuggestions(source, matches, limit, !loadOptions);
  const failed = !!remote.error && !remote.loading;
  const retry: SpecialItem[] = loadOptions && failed ? [retryItem(value)] : [];
  const entries: readonly unknown[] = grouped ? groups : [...flat, ...retry];

  // Inline completion: only for the first match of the current query, only right after an inserted character.
  const first = grouped ? groups[0]?.items[0] : flat[0];
  const firstText = first === undefined ? '' : toText(first);
  const current = !loadOptions || (!remote.loading && !remote.error);
  const completing =
    mode === 'both' &&
    open &&
    current &&
    completeFor !== null &&
    completeFor === value &&
    firstText.length > value.length &&
    startsWithText(firstText, value);
  const completion = completing ? value + firstText.slice(value.length) : null;

  useLayoutEffect(() => {
    if (completion !== null) inputRef.current?.setSelectionRange(value.length, completion.length);
  }, [completion, value.length]);

  const commit = (next: string) => {
    if (valueProp === undefined) setInner(next);
    if (next !== value) onValueChange?.(next);
  };

  const pick = (item: Item) => {
    setCompleteFor(null);
    commit(toText(item));
    onItemSelect?.(item);
  };

  const itemOfPress = (event: Event | undefined, text: string): Item | SpecialItem | undefined => {
    const option = event?.target instanceof Element ? event.target.closest('[role="option"]') : null;
    const fromRow = option ? rows.current.get(option) : undefined;
    if (fromRow !== undefined) return fromRow as Item | SpecialItem;
    if (highlightedRef.current !== undefined) return highlightedRef.current as Item | SpecialItem;
    return [...flat, ...groups.flatMap((g) => g.items)].find((item) => toText(item) === text);
  };

  const handleValueChange = (next: string, details: BaseAutocomplete.Root.ChangeEventDetails) => {
    // Base clears the input on Escape; a free-text field keeps what was typed.
    if (details.reason === 'escape-key') return;
    if (details.reason === 'item-press') {
      const item = itemOfPress(details.event, next);
      if (item !== undefined && isSpecialItem(item)) {
        keepOpen.current = true;
        remote.reload();
      } else if (item !== undefined) pick(item);
      else commit(next);
      return;
    }
    const event = details.event as InputEvent | undefined;
    const input = inputRef.current;
    const inserted =
      details.reason === 'input-change' &&
      event?.type === 'input' &&
      event.inputType === 'insertText' &&
      !event.isComposing &&
      !!input &&
      input.selectionStart === input.value.length &&
      input.selectionEnd === input.value.length;
    setCompleteFor(inserted ? next : null);
    commit(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || completion === null || highlightedRef.current !== undefined || first === undefined)
      return;
    if (event.nativeEvent.isComposing) return;
    event.preventDefault();
    pick(first);
    setOpen(false);
    const input = event.currentTarget;
    input.setSelectionRange(input.value.length, input.value.length);
  };

  const loading = remote.loading;
  const refine = shown < total;
  const busy = loading || failed;

  const renderRow = (item: Item | SpecialItem) =>
    isSpecialItem(item) ? (
      <BaseAutocomplete.Item
        key="retry"
        value={item}
        ref={(el) => {
          if (el) rows.current.set(el, item);
        }}
        className={cn(s.item(), s.specialItem())}
      >
        <span className={s.itemContent()}>
          <RotateCw size={14} aria-hidden className={s.specialIcon()} />
          <span className="truncate">{t('common.retry')}</span>
        </span>
      </BaseAutocomplete.Item>
    ) : (
      <BaseAutocomplete.Item
        key={toText(item)}
        value={item}
        ref={(el) => {
          if (el) rows.current.set(el, item);
        }}
        className={s.item()}
      >
        <span className={s.itemContent()}>{renderItem ? renderItem(item) : toText(item)}</span>
      </BaseAutocomplete.Item>
    );

  return (
    <>
      {label && (
        <label id={`${inputId}-label`} htmlFor={inputId} className={s.label()}>
          {label}
        </label>
      )}
      <BaseAutocomplete.Root
        items={entries}
        filter={null}
        value={value}
        onValueChange={handleValueChange}
        itemToStringValue={(item: unknown) => toText(item as Item)}
        onItemHighlighted={(item: unknown) => {
          highlightedRef.current = item ?? undefined;
        }}
        // Inline completion is built in the wrapper; Base's own `both` would replace the text on highlight.
        mode="list"
        name={name}
        open={open}
        onOpenChange={(next) => {
          if (!next && keepOpen.current) {
            keepOpen.current = false;
            return;
          }
          setOpen(next);
        }}
        disabled={disabled}
      >
        <BaseAutocomplete.InputGroup className={cn(v.inputGroup(), extra.invalidGroup(), className)}>
          <BaseAutocomplete.Input
            ref={inputRef}
            id={label || id ? inputId : undefined}
            aria-label={ariaLabel}
            aria-labelledby={label ? `${inputId}-label` : undefined}
            aria-invalid={invalid || undefined}
            aria-autocomplete={mode}
            placeholder={placeholder}
            className={cn(v.input(), extra.input())}
            onKeyDown={onKeyDown}
            // Base keeps the typed text (so Field validation and onValueChange see it); only the DOM input shows the
            // inline completion, and the native form value is the typed text on a hidden input, as Base names the
            // visible one after the enclosing Field or the name prop.
            render={(inputProps) => {
              const { name: formName, ...rest } = inputProps as ComponentPropsWithRef<'input'>;
              return (
                <>
                  <input {...rest} value={completion !== null && rest.value === value ? completion : rest.value} />
                  {formName && <input type="hidden" name={formName} value={value} disabled={rest.disabled} />}
                </>
              );
            }}
            onBlur={() => setCompleteFor(null)}
          />
          {clearable && value !== '' && (
            <BaseAutocomplete.Clear aria-label={t('common.clear')} className={v.iconButton()}>
              <X size={14} aria-hidden />
            </BaseAutocomplete.Clear>
          )}
        </BaseAutocomplete.InputGroup>
        <BaseAutocomplete.Portal container={portalContainer}>
          <BaseAutocomplete.Positioner dir={dir} className={s.positioner()} side="bottom" align="start" sideOffset={6}>
            <BaseAutocomplete.Popup className={s.popup()}>
              <BaseAutocomplete.Status className={cn(s.status(), failed && s.statusError())}>
                {loading ? (
                  <>
                    <Spinner size={13} />
                    {t('common.loading')}
                  </>
                ) : failed ? (
                  t('combobox.loadFailed')
                ) : refine ? (
                  t('autocomplete.refine', { shown, total })
                ) : null}
              </BaseAutocomplete.Status>
              <BaseAutocomplete.Empty className={s.empty()}>
                {busy ? null : t('common.noMatches')}
              </BaseAutocomplete.Empty>
              <BaseAutocomplete.List className={s.list()} aria-busy={loading || undefined}>
                {grouped
                  ? (group: BaseGroup<Item>) => (
                      <BaseAutocomplete.Group key={group.value} items={group.items}>
                        <BaseAutocomplete.GroupLabel className={groupStyles.groupLabel()}>
                          {group.value}
                        </BaseAutocomplete.GroupLabel>
                        <BaseAutocomplete.Collection>{(item: Item) => renderRow(item)}</BaseAutocomplete.Collection>
                      </BaseAutocomplete.Group>
                    )
                  : (item: Item | SpecialItem) => renderRow(item)}
              </BaseAutocomplete.List>
            </BaseAutocomplete.Popup>
          </BaseAutocomplete.Positioner>
        </BaseAutocomplete.Portal>
      </BaseAutocomplete.Root>
    </>
  );
}

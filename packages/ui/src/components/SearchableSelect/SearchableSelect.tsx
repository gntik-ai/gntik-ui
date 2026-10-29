import { useContext, useId, useMemo, useState, type ComponentType, type ReactElement, type ReactNode } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import {
  Combobox,
  ComboboxContent,
  ComboboxCollection,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxPopupInput,
  ComboboxTrigger,
  useComboboxFilter,
} from '../Combobox';
import { SearchableSelectPresentation } from './SearchableSelectPresentation';
import { searchableSelectVariants } from './searchable-select.variants';

export interface SearchableSelectOption<Value> {
  value: Value;
  label: string;
  description?: string;
  icon?: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  keywords?: string[];
  disabled?: boolean;
}

export interface SearchableSelectGroup<Value> {
  label: string;
  options: SearchableSelectOption<Value>[];
}

function isGroup<Value>(
  item: SearchableSelectOption<Value> | SearchableSelectGroup<Value>,
): item is SearchableSelectGroup<Value> {
  return 'options' in item;
}

export interface SearchableSelectAction {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  onSelect: () => void;
}

interface ActionRow {
  __searchableSelectAction: true;
  action: SearchableSelectAction;
}
type Row<Value> = SearchableSelectOption<Value> | ActionRow;
function isAction<Value>(row: Row<Value>): row is ActionRow {
  return '__searchableSelectAction' in row;
}
interface Group<Value> {
  value: string;
  label?: string;
  items: Row<Value>[];
}

export type SearchableSelectValue<Value, Multiple extends boolean> = Multiple extends true ? Value[] : Value | null;

export interface SearchableSelectProps<Value, Multiple extends boolean = false> {
  options: ReadonlyArray<SearchableSelectOption<Value> | SearchableSelectGroup<Value>>;
  virtualized?: boolean;
  itemHeight?: number;
  overscan?: number;
  actions?: readonly SearchableSelectAction[];
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  trigger?: ReactElement;
  className?: string;
  getOptionKey?: (value: Value) => string;
  multiple?: Multiple;
  value?: SearchableSelectValue<Value, Multiple>;
  defaultValue?: SearchableSelectValue<Value, Multiple>;
  onValueChange?: (value: SearchableSelectValue<Value, Multiple>) => void;
  label?: ReactNode;
  'aria-label'?: string;
  placeholder?: ReactNode;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  filter?: (option: SearchableSelectOption<Value>, query: string) => boolean;
  onSearchChange?: (query: string) => void;
  size?: 'auto' | 'sm' | 'md' | 'lg';
}

const s = searchableSelectVariants();

/** A field or button trigger with search inside its popup. */
export function SearchableSelect<Value, Multiple extends boolean = false>({
  options,
  getOptionKey = String,
  value,
  defaultValue,
  onValueChange,
  label,
  'aria-label': ariaLabel,
  placeholder,
  size,
  multiple,
  searchPlaceholder,
  emptyText,
  filter,
  onSearchChange,
  actions,
  name,
  required,
  disabled,
  readOnly,
  trigger,
  className,
  virtualized,
  itemHeight,
  overscan,
}: SearchableSelectProps<Value, Multiple>) {
  const presentation = useContext(SearchableSelectPresentation);
  const { t, locale } = useI18n();
  const { contains } = useComboboxFilter({ locale });
  const id = useId();
  const [inner, setInner] = useState<Value | Value[] | null>(defaultValue ?? (multiple ? [] : null));
  const current = value !== undefined ? value : inner;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const flat = useMemo(() => options.flatMap((item) => (isGroup(item) ? item.options : [item])), [options]);
  const grouped = options.some(isGroup);
  const items = useMemo(() => {
    const actionRows: ActionRow[] = (actions ?? []).map((action) => ({ __searchableSelectAction: true, action }));
    return grouped
      ? [
          ...options.map((item, index) =>
            isGroup(item)
              ? { value: `group:${index}`, label: item.label, items: item.options }
              : { value: `option:${index}`, items: [item] },
          ),
          { value: 'actions', items: actionRows },
        ]
      : [...flat, ...actionRows];
  }, [options, flat, grouped, actions]);
  const selectedValues: Value[] = multiple ? (current as Value[]) : current === null ? [] : [current as Value];
  const selected = selectedValues
    .map((v) => flat.find((option) => getOptionKey(option.value) === getOptionKey(v)))
    .filter((option) => option !== undefined);
  const Icon = !multiple ? selected[0]?.icon : undefined;
  const renderOption = (option: Row<Value>) => {
    if (isAction(option)) {
      const ActionIcon = option.action.icon;
      return (
        <ComboboxItem key={`action:${option.action.id}`} value={option} className={presentation?.optionClassName}>
          {presentation?.renderAction ? (
            presentation.renderAction(option.action.id)
          ) : (
            <>
              {ActionIcon && <ActionIcon size={15} aria-hidden />}
              {option.action.label}
            </>
          )}
        </ComboboxItem>
      );
    }
    const OptionIcon = option.icon;
    return (
      <ComboboxItem
        key={`option:${getOptionKey(option.value)}`}
        value={option}
        disabled={option.disabled}
        className={presentation?.optionClassName}
      >
        {presentation?.renderOption ? (
          presentation.renderOption(getOptionKey(option.value))
        ) : (
          <>
            {OptionIcon && <OptionIcon size={15} aria-hidden />}
            <span className={s.optionText()}>
              <span>{option.label}</span>
              {option.description && <span className={s.description()}>{option.description}</span>}
            </span>
          </>
        )}
      </ComboboxItem>
    );
  };
  return (
    <Combobox<Row<Value>, boolean>
      virtualized={virtualized && !grouped}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      name={selectedValues.length ? name : undefined}
      open={open}
      multiple={multiple}
      items={items}
      value={multiple ? selected : (selected[0] ?? null)}
      inputValue={query}
      onInputValueChange={(next, details) => {
        if (details.reason === 'input-change' || (details.reason === 'input-clear' && !details.isItemPress)) {
          setQuery(next);
          onSearchChange?.(next);
        }
      }}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
      onValueChange={(next, details) => {
        const action = Array.isArray(next) ? next.find(isAction) : next && isAction(next) ? next : undefined;
        if (action && isAction(action)) {
          details.cancel();
          setOpen(false);
          setQuery('');
          action.action.onSelect();
          return;
        }
        const result = Array.isArray(next)
          ? next
              .filter((option): option is SearchableSelectOption<Value> => !isAction(option))
              .map((option) => option.value)
          : next && !isAction(next)
            ? next.value
            : null;
        setInner(result);
        onValueChange?.(result as SearchableSelectValue<Value, Multiple>);
      }}
      itemToStringLabel={(option) => (isAction(option) ? option.action.label : option.label)}
      itemToStringValue={(option) => (isAction(option) ? '' : getOptionKey(option.value))}
      isItemEqualToValue={(a, b) =>
        isAction(a) || isAction(b) ? a === b : getOptionKey(a.value) === getOptionKey(b.value)
      }
      filter={(option, text) =>
        isAction(option) ||
        (filter
          ? filter(option, text)
          : contains([option.label, option.description, ...(option.keywords ?? [])].filter(Boolean).join(' '), text))
      }
      autoHighlight
    >
      {label && (
        <label id={`${id}-label`} htmlFor={id} className={s.label()}>
          {label}
        </label>
      )}
      <ComboboxTrigger
        render={trigger}
        className={className}
        id={id}
        size={size}
        aria-label={ariaLabel}
        aria-labelledby={label ? `${id}-label` : undefined}
      >
        {trigger ? undefined : (
          <>
            {Icon && <Icon size={15} aria-hidden />}
            {selected.length
              ? multiple
                ? t('searchableSelect.selectedCount', { count: selected.length })
                : selected[0]?.label
              : (placeholder ?? t('common.selectPlaceholder'))}
          </>
        )}
      </ComboboxTrigger>
      <ComboboxContent
        className={presentation?.popupClassName}
        listClassName={presentation?.listClassName}
        emptyClassName={presentation?.emptyClassName}
        sideOffset={presentation?.sideOffset}
        itemHeight={itemHeight}
        overscan={overscan}
        aria-label={presentation?.popupLabel ?? ariaLabel}
        aria-labelledby={label ? `${id}-label` : undefined}
        emptyText={emptyText}
        header={<ComboboxPopupInput placeholder={searchPlaceholder} />}
      >
        {(item: Row<Value> | Group<Value>) =>
          'items' in item ? (
            <ComboboxGroup key={item.value} items={item.items}>
              {item.label && <ComboboxGroupLabel>{item.label}</ComboboxGroupLabel>}
              <ComboboxCollection>{(option: Row<Value>) => renderOption(option)}</ComboboxCollection>
            </ComboboxGroup>
          ) : (
            renderOption(item)
          )
        }
      </ComboboxContent>
    </Combobox>
  );
}

import { Select as BaseSelect } from '@base-ui/react/select';
import { useRender } from '@base-ui/react/use-render';
import { Check, ChevronDown, RotateCw } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
} from 'react';
import { usePortalContainer } from '../../utils/portal';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { ClearControlButton, clearChangeDetails, type ClearableProps } from '../../utils/clear-control';
import { cn } from '../../utils/cn';
import { useAsyncOptions, type LoadOptions } from '../Combobox/useAsyncOptions';
import { Spinner } from '../Spinner';
import { selectVariants, type SelectVariantProps } from './select.variants';

const s = selectVariants();

const SelectTriggerContext = createContext<{
  trigger: HTMLButtonElement | null;
  setTrigger: (trigger: HTMLButtonElement | null) => void;
} | null>(null);

/** Select state container (value, defaultValue, onValueChange, items, multiple, open…). Renders no element. */
export function Select<Value, Multiple extends boolean | undefined = false>(
  props: BaseSelect.Root.Props<Value, Multiple>,
) {
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  return (
    <SelectTriggerContext.Provider value={{ trigger, setTrigger }}>
      <BaseSelect.Root {...props} />
    </SelectTriggerContext.Provider>
  );
}

// Read the resolved trigger attribute, including labels supplied by Base UI Field.
// Observe attribute changes so caller updates also reach an already open listbox.
function useTriggerAttribute(trigger: HTMLButtonElement | null, attribute: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!trigger) return () => {};
      const observer = new MutationObserver(onChange);
      observer.observe(trigger, { attributes: true, attributeFilter: [attribute] });
      return () => observer.disconnect();
    },
    [trigger, attribute],
  );
  return useSyncExternalStore(
    subscribe,
    () => trigger?.getAttribute(attribute) ?? undefined,
    () => undefined,
  );
}

/** Visible label; automatically labels the trigger. */
export function SelectLabel({
  className,
  ...props
}: Omit<BaseSelect.Label.Props, 'className'> & { className?: string }) {
  return <BaseSelect.Label className={cn(s.label(), className)} {...props} />;
}

export interface SelectTriggerProps
  extends Omit<BaseSelect.Trigger.Props, 'className' | 'children'>, SelectVariantProps {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  /** Shown while nothing is selected. */
  placeholder?: ReactNode;
  /** Custom value rendering; defaults to the selected item's label (pass `items` to Select). */
  children?: BaseSelect.Value.Props['children'];
}

/** The button that shows the current value and a chevron, and opens the popup. */
export function SelectTrigger({ size, className, placeholder, children, ref, ...props }: SelectTriggerProps) {
  const v = selectVariants({ size });
  const context = useContext(SelectTriggerContext);
  return useRender({
    ref: [ref ?? null, context?.setTrigger ?? null],
    render: (
      <BaseSelect.Trigger className={cn(v.trigger(), className)} {...props}>
        <BaseSelect.Value className={v.value()} placeholder={placeholder}>
          {children}
        </BaseSelect.Value>
        <BaseSelect.Icon className={v.icon()}>
          <ChevronDown size={15} aria-hidden />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
    ),
  });
}

export interface SelectContentProps extends Omit<BaseSelect.Popup.Props, 'className'> {
  className?: string;
  /** Overlap the trigger so the selected item lines up with the value (native-like). Default false. */
  alignItemWithTrigger?: boolean;
  side?: BaseSelect.Positioner.Props['side'];
  align?: BaseSelect.Positioner.Props['align'];
  sideOffset?: number;
  /** Portal container; defaults to the nearest ThemeScope, otherwise document.body. */
  container?: BaseSelect.Portal.Props['container'];
  /** Rendered above the list, e.g. a loading or error message (SimpleSelect uses it for `loadOptions`). */
  status?: ReactNode;
  children?: ReactNode;
}

/** The popup: portal, positioner, popup surface and listbox. */
export function SelectContent({
  className,
  alignItemWithTrigger = false,
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  container,
  status,
  children,
  ...props
}: SelectContentProps) {
  const portalContainer = usePortalContainer();
  const dir = usePortalDir();
  const context = useContext(SelectTriggerContext);
  const labelledBy = useTriggerAttribute(context?.trigger ?? null, 'aria-labelledby');
  const ariaLabel = useTriggerAttribute(context?.trigger ?? null, 'aria-label');
  const explicitName = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;
  return (
    <BaseSelect.Portal container={container ?? portalContainer}>
      <BaseSelect.Positioner
        dir={dir}
        className={s.positioner()}
        alignItemWithTrigger={alignItemWithTrigger}
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <BaseSelect.Popup className={cn(s.popup(), className)} {...props}>
          {status}
          <BaseSelect.List
            className={s.list()}
            aria-labelledby={explicitName ? props['aria-labelledby'] : labelledBy}
            aria-label={explicitName ? props['aria-label'] : ariaLabel}
          >
            {children}
          </BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export interface SelectItemProps extends Omit<BaseSelect.Item.Props, 'className'> {
  className?: string;
}

/** One option. Shows a check when selected. */
export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <BaseSelect.Item className={cn(s.item(), className)} {...props}>
      <BaseSelect.ItemText className={s.itemText()}>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className={s.indicator()}>
        <Check size={15} strokeWidth={2.4} aria-hidden />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

export const SelectGroup = BaseSelect.Group;

export function SelectGroupLabel({
  className,
  ...props
}: Omit<BaseSelect.GroupLabel.Props, 'className'> & { className?: string }) {
  return <BaseSelect.GroupLabel className={cn(s.groupLabel(), className)} {...props} />;
}

export function SelectSeparator({
  className,
  ...props
}: Omit<BaseSelect.Separator.Props, 'className'> & { className?: string }) {
  return <BaseSelect.Separator className={cn(s.separator(), className)} {...props} />;
}

export interface SimpleSelectItem<V extends string = string> {
  value: V;
  label: string;
  disabled?: boolean;
}

export interface SimpleSelectProps<V extends string = string>
  extends Omit<BaseSelect.Root.Props<V, false>, 'items' | 'multiple' | 'children'>, SelectVariantProps, ClearableProps {
  /** The options. With `loadOptions`, the ones known up front (e.g. the selected value's label). */
  items?: ReadonlyArray<SimpleSelectItem<V>>;
  /**
   * Async options, loaded the first time the popup opens (`query` is always `''`; the signal
   * aborts if the popup closes or the select unmounts). After an error, reopening retries.
   */
  loadOptions?: LoadOptions<SimpleSelectItem<V>>;
  /** Shown (and announced) while `loadOptions` runs. Default: "Loading…". */
  loadingText?: ReactNode;
  /** Shown (and announced) when `loadOptions` rejects. Default: "Couldn’t load options." */
  errorText?: ReactNode;
  /** Shown when there are no options. Default: "No results". */
  emptyText?: ReactNode;
  /** Visible label. Without it, pass `aria-label`. */
  label?: ReactNode;
  'aria-label'?: string;
  placeholder?: ReactNode;
  /** Class for the trigger. */
  className?: string;
  /** Ref to the trigger button (e.g. so a form library can focus it). */
  triggerRef?: Ref<HTMLButtonElement>;
  /** Alias of triggerRef; both refs receive the same trigger. */
  ref?: Ref<HTMLButtonElement>;
}

/** One-line select from a flat `{ value, label }` list, or from `loadOptions`. */
export function SimpleSelect<V extends string = string>({
  items: itemsProp,
  loadOptions,
  loadingText,
  errorText,
  emptyText,
  label,
  placeholder: placeholderProp,
  size,
  className,
  'aria-label': ariaLabel,
  onOpenChange,
  triggerRef,
  ref,
  clearable,
  clearLabel,
  onClear,
  value,
  defaultValue,
  onValueChange,
  ...props
}: SimpleSelectProps<V>) {
  const { t } = useI18n();
  const placeholder = placeholderProp ?? t('common.selectPlaceholder');
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  const remote = useAsyncOptions(loadOptions, '', { enabled: props.open ?? open, debounceMs: 0 });
  const known = itemsProp ?? [];
  const items = loadOptions
    ? [...known.filter((k) => !remote.items.some((r) => r.value === k.value)), ...remote.items]
    : known;
  const sv = selectVariants();
  const [control, setControl] = useState<HTMLButtonElement | null>(null);
  const [inner, setInner] = useState<V | null>(defaultValue ?? null);
  const current = value !== undefined ? value : inner;
  const canClear = clearable && current !== null && !props.disabled && !props.readOnly;
  const clear = (event: Event) => {
    if (!canClear || control?.matches(':disabled, [data-disabled]')) return;
    const details = clearChangeDetails(event, control ?? undefined);
    onValueChange?.(null, details);
    if (details.isCanceled) return;
    setInner(null);
    onClear?.();
    control?.focus();
  };

  const trigger = useRender({
    ref: [ref ?? null, triggerRef ?? null, setControl],
    render: (
      <SelectTrigger
        size={size}
        className={cn(className, canClear && 'pe-14')}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onKeyDown={(event) => {
          if (canClear && (event.key === 'Delete' || event.key === 'Backspace')) {
            event.preventDefault();
            clear(event.nativeEvent);
          }
        }}
      />
    ),
  });

  let status: ReactNode = null;
  if (loadOptions && remote.loading) {
    status = (
      <div role="status" className={sv.status()}>
        <Spinner size={13} />
        {loadingText ?? t('common.loading')}
      </div>
    );
  } else if (loadOptions && remote.error) {
    status = (
      <div className={cn(sv.status(), sv.statusError())}>
        <span role="alert">{errorText ?? t('combobox.loadFailed')}</span>
        <button type="button" className={sv.retry()} onClick={remote.reload}>
          <RotateCw size={12} aria-hidden />
          {t('common.retry')}
        </button>
      </div>
    );
  } else if (loadOptions && items.length === 0) {
    status = (
      <div role="status" className={sv.status()}>
        {emptyText ?? t('common.noResults')}
      </div>
    );
  }

  return (
    <Select<V>
      items={items.map(({ value, label: l }) => ({ value, label: l }))}
      onOpenChange={(next, details) => {
        setOpen(next);
        if (next && remote.error) remote.reload();
        onOpenChange?.(next, details);
      }}
      {...props}
      value={clearable ? current : value}
      defaultValue={defaultValue}
      onValueChange={(next, details) => {
        onValueChange?.(next, details);
        if (!details.isCanceled) setInner(next);
      }}
    >
      {label && <SelectLabel>{label}</SelectLabel>}
      {clearable ? (
        <div className="relative">
          {trigger}
          {canClear && (
            <ClearControlButton
              control={control}
              clearLabel={clearLabel}
              className="absolute end-7 top-1/2 -translate-y-1/2"
              onClick={(event) => clear(event.nativeEvent)}
            />
          )}
        </div>
      ) : (
        trigger
      )}
      <SelectContent status={status} aria-busy={(loadOptions && remote.loading) || undefined}>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

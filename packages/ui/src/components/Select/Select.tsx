import { Select as BaseSelect } from '@base-ui/react/select';
import { Check, ChevronDown, RotateCw } from 'lucide-react';
import { useState, type ReactNode, type Ref } from 'react';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { useAsyncOptions, type LoadOptions } from '../Combobox/useAsyncOptions';
import { Spinner } from '../Spinner';
import { selectVariants, type SelectVariantProps } from './select.variants';

const s = selectVariants();

/** Select state container (value, defaultValue, onValueChange, items, multiple, open…). Renders no element. */
export const Select = BaseSelect.Root;

/** Visible label; automatically labels the trigger. */
export function SelectLabel({ className, ...props }: Omit<BaseSelect.Label.Props, 'className'> & { className?: string }) {
  return <BaseSelect.Label className={cn(s.label(), className)} {...props} />;
}

export interface SelectTriggerProps extends Omit<BaseSelect.Trigger.Props, 'className' | 'children'>, SelectVariantProps {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  /** Shown while nothing is selected. */
  placeholder?: ReactNode;
  /** Custom value rendering; defaults to the selected item's label (pass `items` to Select). */
  children?: BaseSelect.Value.Props['children'];
}

/** The button that shows the current value and a chevron, and opens the popup. */
export function SelectTrigger({ size, className, placeholder, children, ...props }: SelectTriggerProps) {
  const v = selectVariants({ size });
  return (
    <BaseSelect.Trigger className={cn(v.trigger(), className)} {...props}>
      <BaseSelect.Value className={v.value()} placeholder={placeholder}>
        {children}
      </BaseSelect.Value>
      <BaseSelect.Icon className={v.icon()}>
        <ChevronDown size={15} aria-hidden />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export interface SelectContentProps extends Omit<BaseSelect.Popup.Props, 'className'> {
  className?: string;
  /** Overlap the trigger so the selected item lines up with the value (native-like). Default false. */
  alignItemWithTrigger?: boolean;
  side?: BaseSelect.Positioner.Props['side'];
  align?: BaseSelect.Positioner.Props['align'];
  sideOffset?: number;
  /** Portal container; defaults to document.body. */
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
  const dir = usePortalDir();
  return (
    <BaseSelect.Portal container={container}>
      <BaseSelect.Positioner dir={dir}
        className={s.positioner()}
        alignItemWithTrigger={alignItemWithTrigger}
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <BaseSelect.Popup className={cn(s.popup(), className)} {...props}>
          {status}
          <BaseSelect.List className={s.list()}>{children}</BaseSelect.List>
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

export function SelectGroupLabel({ className, ...props }: Omit<BaseSelect.GroupLabel.Props, 'className'> & { className?: string }) {
  return <BaseSelect.GroupLabel className={cn(s.groupLabel(), className)} {...props} />;
}

export function SelectSeparator({ className, ...props }: Omit<BaseSelect.Separator.Props, 'className'> & { className?: string }) {
  return <BaseSelect.Separator className={cn(s.separator(), className)} {...props} />;
}

export interface SimpleSelectItem<V extends string = string> {
  value: V;
  label: string;
  disabled?: boolean;
}

export interface SimpleSelectProps<V extends string = string>
  extends Omit<BaseSelect.Root.Props<V, false>, 'items' | 'multiple' | 'children'>,
    SelectVariantProps {
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
  ...props
}: SimpleSelectProps<V>) {
  const { t } = useI18n();
  const placeholder = placeholderProp ?? t('common.selectPlaceholder');
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  const remote = useAsyncOptions(loadOptions, '', { enabled: props.open ?? open, debounceMs: 0 });
  const known = itemsProp ?? [];
  const items = loadOptions ? [...known.filter((k) => !remote.items.some((r) => r.value === k.value)), ...remote.items] : known;
  const sv = selectVariants();

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
    >
      {label && <SelectLabel>{label}</SelectLabel>}
      <SelectTrigger ref={triggerRef} size={size} className={className} placeholder={placeholder} aria-label={ariaLabel} />
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

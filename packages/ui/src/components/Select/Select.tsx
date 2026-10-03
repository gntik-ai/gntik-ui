import { Select as BaseSelect } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
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
  items: ReadonlyArray<SimpleSelectItem<V>>;
  /** Visible label. Without it, pass `aria-label`. */
  label?: ReactNode;
  'aria-label'?: string;
  placeholder?: ReactNode;
  /** Class for the trigger. */
  className?: string;
}

/** One-line select from a flat `{ value, label }` list. */
export function SimpleSelect<V extends string = string>({
  items,
  label,
  placeholder: placeholderProp,
  size,
  className,
  'aria-label': ariaLabel,
  ...props
}: SimpleSelectProps<V>) {
  const { t } = useI18n();
  const placeholder = placeholderProp ?? t('common.selectPlaceholder');
  return (
    <Select<V> items={items.map(({ value, label: l }) => ({ value, label: l }))} {...props}>
      {label && <SelectLabel>{label}</SelectLabel>}
      <SelectTrigger size={size} className={className} placeholder={placeholder} aria-label={ariaLabel} />
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

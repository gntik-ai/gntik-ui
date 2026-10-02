import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useId, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { comboboxVariants, type ComboboxVariantProps } from './combobox.variants';

const s = comboboxVariants();

/**
 * Combobox state container: `items` (filtered by the input), `value` / `defaultValue` /
 * `onValueChange`, `multiple`. Items shaped `{ value, label }` need no extra config.
 */
export const Combobox = BaseCombobox.Root;

// Inputs also use aria-labelledby: while the popup is open Base UI aria-hides outside nodes
// (including the <label>), and aria-labelledby still resolves through hidden elements.
type InputBaseProps = Omit<BaseCombobox.Input.Props, 'className' | 'size'> & {
  className?: string;
  ref?: Ref<HTMLInputElement>;
  /** Visible label rendered above the field and bound to the input. Without it, pass `aria-label`. */
  label?: ReactNode;
};

export interface ComboboxInputProps extends InputBaseProps, ComboboxVariantProps {
  /** Show a clear button while a value is selected. */
  showClear?: boolean;
  clearLabel?: string;
  /** Accessible name of the chevron button. */
  triggerLabel?: string;
}

/** Single-select field: search icon, text input, optional clear, chevron trigger. */
export function ComboboxInput({
  size,
  label,
  className,
  showClear = false,
  clearLabel = 'Clear selection',
  triggerLabel = 'Show options',
  id,
  ...props
}: ComboboxInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const v = comboboxVariants({ size });
  return (
    <>
      {label && (
        <label id={`${inputId}-label`} htmlFor={inputId} className={s.label()}>
          {label}
        </label>
      )}
      <BaseCombobox.InputGroup className={cn(v.inputGroup(), className)}>
        <Search size={15} aria-hidden className={v.searchIcon()} />
        <BaseCombobox.Input id={inputId} aria-labelledby={label ? `${inputId}-label` : undefined} className={v.input()} {...props} />
        {showClear && (
          <BaseCombobox.Clear aria-label={clearLabel} className={v.iconButton()}>
            <X size={14} aria-hidden />
          </BaseCombobox.Clear>
        )}
        <BaseCombobox.Trigger aria-label={triggerLabel} className={cn('group', v.iconButton())}>
          <ChevronDown size={15} aria-hidden className={v.chevron()} />
        </BaseCombobox.Trigger>
      </BaseCombobox.InputGroup>
    </>
  );
}

export interface ComboboxChipsInputProps<Item> extends InputBaseProps {
  /** Chip text for a selected item. Defaults to `item.label`, else `String(item)`. */
  getLabel?: (item: Item) => string;
  /** Accessible name of each chip's remove button. */
  removeLabel?: (label: string) => string;
}

function defaultLabel(item: unknown): string {
  if (item && typeof item === 'object' && 'label' in item) return String((item as { label: unknown }).label);
  return String(item);
}

/** Multi-select field: selected items as removable chips followed by the text input. Use with `<Combobox multiple>`. */
export function ComboboxChipsInput<Item = unknown>({
  label,
  className,
  placeholder,
  getLabel = defaultLabel,
  removeLabel = (l) => `Remove ${l}`,
  id,
  ...props
}: ComboboxChipsInputProps<Item>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <>
      {label && (
        <label id={`${inputId}-label`} htmlFor={inputId} className={s.label()}>
          {label}
        </label>
      )}
      <BaseCombobox.InputGroup className={cn(s.chipsGroup(), className)}>
        <BaseCombobox.Value>
          {(values: Item[]) => (
            <BaseCombobox.Chips className={s.chips()}>
              {values.map((item, i) => {
                const text = getLabel(item);
                return (
                  <BaseCombobox.Chip key={`${text}-${i}`} className={s.chip()} aria-label={text}>
                    {text}
                    <BaseCombobox.ChipRemove aria-label={removeLabel(text)} className={s.chipRemove()}>
                      <X size={11} strokeWidth={2.4} aria-hidden />
                    </BaseCombobox.ChipRemove>
                  </BaseCombobox.Chip>
                );
              })}
              <BaseCombobox.Input
                id={inputId}
                aria-labelledby={label ? `${inputId}-label` : undefined}
                placeholder={values.length ? undefined : placeholder}
                className={s.chipsInput()}
                {...props}
              />
            </BaseCombobox.Chips>
          )}
        </BaseCombobox.Value>
      </BaseCombobox.InputGroup>
    </>
  );
}

export interface ComboboxContentProps extends Omit<BaseCombobox.Popup.Props, 'className' | 'children'> {
  className?: string;
  /** Shown (and announced) when no item matches the query. */
  emptyText?: ReactNode;
  side?: BaseCombobox.Positioner.Props['side'];
  align?: BaseCombobox.Positioner.Props['align'];
  sideOffset?: number;
  container?: BaseCombobox.Portal.Props['container'];
  /** List children: a render function `(item) => <ComboboxItem …/>`, or static items. */
  children?: BaseCombobox.List.Props['children'];
}

/** The popup: portal, positioner, popup surface, empty state and listbox. */
export function ComboboxContent({
  className,
  emptyText = 'No matches.',
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  container,
  children,
  ...props
}: ComboboxContentProps) {
  return (
    <BaseCombobox.Portal container={container}>
      <BaseCombobox.Positioner className={s.positioner()} side={side} align={align} sideOffset={sideOffset}>
        <BaseCombobox.Popup className={cn(s.popup(), className)} {...props}>
          <BaseCombobox.Empty className={s.empty()}>{emptyText}</BaseCombobox.Empty>
          <BaseCombobox.List className={s.list()}>{children}</BaseCombobox.List>
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

export interface ComboboxItemProps extends Omit<BaseCombobox.Item.Props, 'className'> {
  className?: string;
}

/** One option. Shows a check when selected. */
export function ComboboxItem({ className, children, ...props }: ComboboxItemProps) {
  return (
    <BaseCombobox.Item className={cn(s.item(), className)} {...props}>
      <span className={s.itemContent()}>{children}</span>
      <BaseCombobox.ItemIndicator className={s.indicator()}>
        <Check size={15} strokeWidth={2.4} aria-hidden />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

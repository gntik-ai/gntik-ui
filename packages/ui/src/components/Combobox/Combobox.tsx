import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { Check, ChevronDown, Plus, RotateCw, Search, X } from 'lucide-react';
import { useId, type ReactNode, type Ref } from 'react';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { Spinner } from '../Spinner';
import { comboboxVariants, type ComboboxVariantProps } from './combobox.variants';
import { useComboboxEnhancement } from './ComboboxRoot';
import { isSpecialItem, type SpecialItem } from './specialItems';

export { Combobox, type ComboboxProps, type ComboboxAsyncProps } from './ComboboxRoot';

const s = comboboxVariants();

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
  clearLabel: clearLabelProp,
  triggerLabel: triggerLabelProp,
  id,
  ...props
}: ComboboxInputProps) {
  const { t } = useI18n();
  const clearLabel = clearLabelProp ?? t('common.clearSelection');
  const triggerLabel = triggerLabelProp ?? t('common.showOptions');
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
  removeLabel: removeLabelProp,
  id,
  ...props
}: ComboboxChipsInputProps<Item>) {
  const { t } = useI18n();
  const removeLabel = removeLabelProp ?? ((l: string) => t('common.removeItem', { label: l }));
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

/** The popup: portal, positioner, popup surface, async status, empty state and listbox. */
export function ComboboxContent({
  className,
  emptyText: emptyTextProp,
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  container,
  children,
  ...props
}: ComboboxContentProps) {
  const { t } = useI18n();
  const emptyText = emptyTextProp ?? t('common.noMatches');
  const dir = usePortalDir();
  const enh = useComboboxEnhancement();
  let list = children;
  if (enh && typeof children === 'function') {
    list = (item: unknown, index: number) => (isSpecialItem(item) ? <ComboboxSpecialItem key={`${item.__gntikSpecial}:${item.value}`} item={item} /> : children(item, index));
  } else if (enh) {
    list = (
      <>
        {children}
        {enh.specials.map((item) => (
          <ComboboxSpecialItem key={item.__gntikSpecial} item={item} />
        ))}
      </>
    );
  }
  const busy = !!enh && (enh.loading || !!enh.error);
  const errorText = typeof enh?.errorText === 'function' ? enh.errorText(enh.error) : (enh?.errorText ?? t('combobox.loadFailed'));
  return (
    <BaseCombobox.Portal container={container}>
      <BaseCombobox.Positioner dir={dir} className={s.positioner()} side={side} align={align} sideOffset={sideOffset}>
        <BaseCombobox.Popup className={cn(s.popup(), className)} {...props}>
          {enh && (
            <BaseCombobox.Status className={cn(s.status(), !!enh.error && !enh.loading && s.statusError())}>
              {enh.loading ? (
                <>
                  <Spinner size={13} />
                  {enh.loadingText ?? t('common.loading')}
                </>
              ) : enh.error ? (
                errorText
              ) : null}
            </BaseCombobox.Status>
          )}
          <BaseCombobox.Empty className={s.empty()}>{busy ? null : emptyText}</BaseCombobox.Empty>
          <BaseCombobox.List className={s.list()} aria-busy={enh?.loading || undefined}>
            {list}
          </BaseCombobox.List>
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

/** The built-in "Create “…”" and "Retry" rows (internal; MultiSelect reuses it). */
export function ComboboxSpecialItem({ item, createLabel }: { item: SpecialItem; createLabel?: (input: string) => ReactNode }) {
  const { t } = useI18n();
  const enh = useComboboxEnhancement();
  const label = createLabel ?? enh?.createLabel;
  const create = item.__gntikSpecial === 'create';
  return (
    <BaseCombobox.Item value={item} className={cn(s.item(), s.specialItem())}>
      <span className={s.itemContent()}>
        {create ? <Plus size={14} aria-hidden className={s.specialIcon()} /> : <RotateCw size={14} aria-hidden className={s.specialIcon()} />}
        <span className="truncate">
          {create ? (label?.(item.value) ?? t('combobox.create', { label: item.value })) : t('common.retry')}
        </span>
      </span>
    </BaseCombobox.Item>
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

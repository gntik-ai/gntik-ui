import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { Check, ChevronDown, Plus, RotateCw, Search, X } from 'lucide-react';
import { useId, type ReactNode, type Ref } from 'react';
import { usePortalContainer } from '../../utils/portal';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { useFieldVariant } from '../../field-variant/field-variant-context';
import { cn } from '../../utils/cn';
import type { MeasuredRowOptions } from '../VirtualList/use-measured-rows';
import { WindowedComboboxList, useComboboxWindow, useVirtualOptionsKeyDown } from './WindowedCombobox';
import { Spinner } from '../Spinner';
import { selectVariants, type SelectVariantProps } from '../Select/select.variants';
import { comboboxVariants, comboboxPopupInputVariants, type ComboboxVariantProps } from './combobox.variants';
import { useComboboxEnhancement } from './ComboboxRoot';
import { isSpecialItem, isSpecialItemGroup, type SpecialItem } from './specialItems';

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
  variant,
  label,
  className,
  showClear = false,
  clearLabel: clearLabelProp,
  triggerLabel: triggerLabelProp,
  id,
  ...props
}: ComboboxInputProps) {
  const { t } = useI18n();
  const onKeyDown = useVirtualOptionsKeyDown(props.onKeyDown);
  const clearLabel = clearLabelProp ?? t('common.clearSelection');
  const triggerLabel = triggerLabelProp ?? t('common.showOptions');
  const autoId = useId();
  const inputId = id ?? autoId;
  const fieldVariant = useFieldVariant(variant);
  const v = comboboxVariants({ size, variant: fieldVariant });
  return (
    <>
      {label && (
        <label id={`${inputId}-label`} htmlFor={inputId} className={s.label()}>
          {label}
        </label>
      )}
      <BaseCombobox.InputGroup
        className={(state) =>
          cn(
            v.inputGroup(),
            fieldVariant !== 'outline' && (state.readOnly || props.readOnly) && 'bg-secondary/40',
            className,
          )
        }
      >
        <Search size={15} aria-hidden className={v.searchIcon()} />
        <BaseCombobox.Input
          id={inputId}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          className={v.input()}
          {...props}
          onKeyDown={onKeyDown}
        />
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

export interface ComboboxTriggerProps extends Omit<BaseCombobox.Trigger.Props, 'className'>, SelectVariantProps {
  className?: string;
}

/** Field-style button, or a custom button supplied through `render`. */
export function ComboboxTrigger({ size, variant, className, children, render, ...props }: ComboboxTriggerProps) {
  const fieldVariant = useFieldVariant(variant);
  const v = selectVariants({ size, variant: fieldVariant });
  return (
    <BaseCombobox.Trigger
      aria-haspopup="listbox"
      render={render}
      className={cn(!render && v.trigger(), className)}
      {...props}
    >
      {render ? (
        children
      ) : (
        <>
          <span className={v.value()}>{children}</span>
          <ChevronDown size={15} aria-hidden className={v.icon()} />
        </>
      )}
    </BaseCombobox.Trigger>
  );
}

export interface ComboboxPopupInputProps extends Omit<BaseCombobox.Input.Props, 'className' | 'size'> {
  className?: string;
}

/** Search field for a ComboboxContent header. */
export function ComboboxPopupInput({ className, placeholder, ...props }: ComboboxPopupInputProps) {
  const { t } = useI18n();
  const popup = comboboxPopupInputVariants();
  const text = placeholder ?? t('common.searchPlaceholder');
  const onKeyDown = useVirtualOptionsKeyDown(props.onKeyDown);
  return (
    <div className={popup.field()}>
      <Search size={15} aria-hidden className={s.searchIcon()} />
      <BaseCombobox.Input
        aria-label={text.replace(/(?:…|\.\.\.)$/, '')}
        placeholder={text}
        className={cn(popup.input(), className)}
        {...props}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

export interface ComboboxChipsInputProps<Item> extends InputBaseProps {
  variant?: ComboboxVariantProps['variant'];
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
  variant,
  label,
  className,
  placeholder,
  getLabel = defaultLabel,
  removeLabel: removeLabelProp,
  id,
  ...props
}: ComboboxChipsInputProps<Item>) {
  const fieldVariant = useFieldVariant(variant);
  const v = comboboxVariants({ variant: fieldVariant });
  const { t } = useI18n();
  const onKeyDown = useVirtualOptionsKeyDown(props.onKeyDown);
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
      <BaseCombobox.InputGroup
        className={(state) =>
          cn(
            v.chipsGroup(),
            fieldVariant !== 'outline' && (state.readOnly || props.readOnly) && 'bg-secondary/40',
            className,
          )
        }
      >
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
                onKeyDown={onKeyDown}
              />
            </BaseCombobox.Chips>
          )}
        </BaseCombobox.Value>
      </BaseCombobox.InputGroup>
    </>
  );
}

export interface ComboboxContentProps
  extends Omit<BaseCombobox.Popup.Props, 'className' | 'children'>, MeasuredRowOptions {
  className?: string;
  /** Optional list and empty-state styling. */
  listClassName?: string;
  emptyClassName?: string;
  /** Shown (and announced) when no item matches the query. */
  emptyText?: ReactNode;
  side?: BaseCombobox.Positioner.Props['side'];
  align?: BaseCombobox.Positioner.Props['align'];
  sideOffset?: number;
  container?: BaseCombobox.Portal.Props['container'];
  /** Optional content above the status and list, e.g. ComboboxPopupInput. */
  header?: ReactNode;
  /** Optional content below the list. */
  footer?: ReactNode;
  /** List children: a render function `(item) => <ComboboxItem …/>`, or static items. */
  children?: BaseCombobox.List.Props['children'];
}

/** The popup: portal, positioner, popup surface, async status, empty state and listbox. */
export function ComboboxContent({
  className,
  emptyText: emptyTextProp,
  listClassName,
  emptyClassName,
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  container,
  children,
  header,
  footer,
  itemHeight,
  estimatedItemHeight,
  overscan,
  ...props
}: ComboboxContentProps) {
  const portalContainer = usePortalContainer();
  const { t } = useI18n();
  const emptyText = emptyTextProp ?? t('common.noMatches');
  const dir = usePortalDir();
  const enh = useComboboxEnhancement();
  const windowed = useComboboxWindow();
  let list = children;
  if (enh && typeof children === 'function') {
    list = (item: unknown, index: number) =>
      isSpecialItemGroup(item) ? (
        item.items.map((special) => (
          <ComboboxSpecialItem key={`${special.__gntikSpecial}:${special.value}`} item={special} />
        ))
      ) : isSpecialItem(item) ? (
        <ComboboxSpecialItem key={`${item.__gntikSpecial}:${item.value}`} item={item} />
      ) : (
        children(item, index)
      );
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
  const hasSlots = header !== undefined || footer !== undefined;
  const busy = !!enh && (enh.loading || !!enh.error);
  const errorText =
    typeof enh?.errorText === 'function' ? enh.errorText(enh.error) : (enh?.errorText ?? t('combobox.loadFailed'));
  return (
    <BaseCombobox.Portal container={container ?? portalContainer}>
      <BaseCombobox.Positioner dir={dir} className={s.positioner()} side={side} align={align} sideOffset={sideOffset}>
        <BaseCombobox.Popup
          className={cn(
            s.popup(),
            ((windowed && typeof list === 'function') || hasSlots) && 'flex flex-col overflow-hidden',
            className,
          )}
          {...props}
        >
          {header}
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
          <BaseCombobox.Empty className={cn(s.empty(), emptyClassName)}>{busy ? null : emptyText}</BaseCombobox.Empty>
          {windowed && typeof list === 'function' ? (
            <WindowedComboboxList
              aria-label={hasSlots ? props['aria-label'] : undefined}
              aria-labelledby={hasSlots ? props['aria-labelledby'] : undefined}
              aria-busy={enh?.loading || undefined}
              itemHeight={itemHeight}
              estimatedItemHeight={estimatedItemHeight}
              overscan={overscan}
            >
              {list}
            </WindowedComboboxList>
          ) : (
            <BaseCombobox.List
              className={cn(s.list(), hasSlots && 'max-h-64 min-h-0 overflow-y-auto', listClassName)}
              aria-label={hasSlots ? props['aria-label'] : undefined}
              aria-labelledby={hasSlots ? props['aria-labelledby'] : undefined}
              aria-busy={enh?.loading || undefined}
            >
              {list}
            </BaseCombobox.List>
          )}
          {footer}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

/** The built-in "Create “…”" and "Retry" rows (internal; MultiSelect reuses it). */
export function ComboboxSpecialItem({
  item,
  createLabel,
  ...props
}: BaseCombobox.Item.Props & {
  item: SpecialItem;
  createLabel?: (input: string) => ReactNode;
}) {
  const { t } = useI18n();
  const enh = useComboboxEnhancement();
  const label = createLabel ?? enh?.createLabel;
  const create = item.__gntikSpecial === 'create';
  return (
    <BaseCombobox.Item value={item} className={cn(s.item(), s.specialItem())} {...props}>
      <span className={s.itemContent()}>
        {create ? (
          <Plus size={14} aria-hidden className={s.specialIcon()} />
        ) : (
          <RotateCw size={14} aria-hidden className={s.specialIcon()} />
        )}
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

export interface ComboboxGroupProps extends Omit<BaseCombobox.Group.Props, 'className' | 'items'> {
  className?: string;
  items?: readonly unknown[];
}

/** A labelled option group. Pass the filtered group's items to its Collection. */
export function ComboboxGroup({ className, ...props }: ComboboxGroupProps) {
  return <BaseCombobox.Group className={cn(className)} {...props} />;
}

export interface ComboboxGroupLabelProps extends Omit<BaseCombobox.GroupLabel.Props, 'className'> {
  className?: string;
}

const groupStyles = selectVariants();

export function ComboboxGroupLabel({ className, ...props }: ComboboxGroupLabelProps) {
  return <BaseCombobox.GroupLabel className={cn(groupStyles.groupLabel(), className)} {...props} />;
}

export interface ComboboxSeparatorProps extends Omit<BaseCombobox.Separator.Props, 'className'> {
  className?: string;
}

export function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return <BaseCombobox.Separator className={cn(groupStyles.separator(), className)} {...props} />;
}

export interface ComboboxCollectionProps<Item = unknown> {
  children: (item: Item, index: number) => ReactNode;
  /** Optional container classes. Without this prop the collection renders no element. */
  className?: string;
}

/** Render the filtered items of the enclosing Group, or the root collection. */
export function ComboboxCollection<Item = unknown>({ className, children }: ComboboxCollectionProps<Item>) {
  const enhancement = useComboboxEnhancement();
  // With static Content children, Content owns the trailing built-in rows. Keep their
  // internal collection out of the consumer's group renderer and avoid rendering twice.
  const collection = (
    <BaseCombobox.Collection>
      {(item: Item, index: number) =>
        enhancement && (isSpecialItemGroup(item) || isSpecialItem(item)) ? null : children(item, index)
      }
    </BaseCombobox.Collection>
  );
  return className === undefined ? collection : <div className={cn(className)}>{collection}</div>;
}

/** Locale-aware matching for custom Combobox filters. */
export const useComboboxFilter = BaseCombobox.useFilter;

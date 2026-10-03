import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { Check } from 'lucide-react';
import { createContext, useContext, useId, type AriaAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { selectableCardVariants, type SelectableCardVariantProps } from './choice-card.variants';

type ChoiceType = 'radio' | 'checkbox';
const TypeContext = createContext<ChoiceType>('radio');

interface GroupCommon extends Pick<AriaAttributes, 'aria-label' | 'aria-labelledby' | 'aria-describedby'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Grid columns from the `sm` breakpoint. */
  columns?: SelectableCardVariantProps['columns'];
  disabled?: boolean;
  id?: string;
  children?: ReactNode;
}

export interface SelectableCardRadioGroupProps extends GroupCommon {
  /** Single choice (role radiogroup; arrows move and select). */
  type?: 'radio';
  /** Form field name. */
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface SelectableCardCheckboxGroupProps extends GroupCommon {
  /** Multiple choice (role group; Space toggles each card). */
  type: 'checkbox';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type SelectableCardGroupProps = SelectableCardRadioGroupProps | SelectableCardCheckboxGroupProps;

/**
 * Grid of SelectableCards with radio (default) or checkbox semantics, on Base UI RadioGroup /
 * CheckboxGroup. Name it with `aria-labelledby` (or `aria-label`).
 */
export function SelectableCardGroup(props: SelectableCardGroupProps) {
  const { columns, className, ...common } = props;
  const groupClass = cn(selectableCardVariants({ columns }).group(), className);
  const shared = {
    className: groupClass,
    ref: common.ref,
    id: common.id,
    disabled: common.disabled,
    'aria-label': common['aria-label'],
    'aria-labelledby': common['aria-labelledby'],
    'aria-describedby': common['aria-describedby'],
    children: common.children,
  };
  if (props.type === 'checkbox') {
    const { value, defaultValue, onValueChange } = props;
    return (
      <TypeContext.Provider value="checkbox">
        <BaseCheckboxGroup {...shared} value={value} defaultValue={defaultValue} onValueChange={(v) => onValueChange?.(v)} />
      </TypeContext.Provider>
    );
  }
  const { value, defaultValue, onValueChange, name } = props;
  return (
    <TypeContext.Provider value="radio">
      <BaseRadioGroup<string>
        {...shared}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(v) => onValueChange?.(v)}
      />
    </TypeContext.Provider>
  );
}

export interface SelectableCardProps {
  /** Identifies the card inside its group. */
  value: string;
  /** The card's accessible name. */
  title: ReactNode;
  description?: ReactNode;
  /** Secondary content (price, badge, specs); announced as part of the description. */
  meta?: ReactNode;
  /** Leading icon tile. */
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** One option card: indicator, title, description and meta; the whole card toggles it. */
export function SelectableCard({ value, title, description, meta, icon, disabled, className }: SelectableCardProps) {
  const type = useContext(TypeContext);
  const s = selectableCardVariants({ type });
  const titleId = useId();
  const descId = useId();
  const metaId = useId();
  const describedBy = [description != null && descId, meta != null && metaId].filter(Boolean).join(' ') || undefined;
  const a11y = { 'aria-labelledby': titleId, 'aria-describedby': describedBy };
  const control =
    type === 'checkbox' ? (
      <BaseCheckbox.Root value={value} disabled={disabled} {...a11y} className={s.control()}>
        <BaseCheckbox.Indicator className={s.indicator()}>
          <Check size={13} strokeWidth={2.6} aria-hidden />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
    ) : (
      <BaseRadio.Root<string> value={value} disabled={disabled} {...a11y} className={s.control()}>
        <BaseRadio.Indicator className={s.indicator()} />
      </BaseRadio.Root>
    );
  return (
    <label className={cn(s.root(), className)}>
      {icon != null && <span className={s.icon()}>{icon}</span>}
      <span className={s.body()}>
        <span id={titleId} className={s.title()}>
          {title}
        </span>
        {description != null && (
          <span id={descId} className={s.description()}>
            {description}
          </span>
        )}
        {meta != null && (
          <span id={metaId} className={s.meta()}>
            {meta}
          </span>
        )}
      </span>
      {control}
    </label>
  );
}

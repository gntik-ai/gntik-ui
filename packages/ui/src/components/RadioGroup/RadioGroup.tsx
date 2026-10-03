import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { createContext, useContext, useId, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { radioGroupVariants, type RadioGroupVariantProps } from './radio-group.variants';

type Variant = NonNullable<RadioGroupVariantProps['variant']>;
const VariantContext = createContext<Variant>('plain');

export interface RadioGroupProps<Value = string>
  extends Omit<BaseRadioGroup.Props<Value>, 'className'>,
    RadioGroupVariantProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Single-choice group (role radiogroup). Arrow keys move and select; Tab enters the group
 * once, on the selected radio. Name it with `aria-labelledby`, or render it as a Fieldset:
 * `<Fieldset render={<RadioGroup />}>`. Variants: plain, list (bordered rows) and card.
 */
export function RadioGroup<Value = string>({ variant = 'plain', className, ...props }: RadioGroupProps<Value>) {
  return (
    <VariantContext.Provider value={variant}>
      <BaseRadioGroup<Value> className={cn(radioGroupVariants({ variant }).group(), className)} {...props} />
    </VariantContext.Provider>
  );
}

export interface RadioProps<Value = string> extends Omit<BaseRadio.Root.Props<Value>, 'className'> {
  className?: string;
  ref?: Ref<HTMLElement>;
  /** Visible label. Without it, pass `aria-label`. */
  label?: ReactNode;
  /** Helper line under the label, linked with aria-describedby. */
  description?: ReactNode;
  /** Right-aligned content on the label row (e.g. a price in the card variant); announced as description. */
  trailing?: ReactNode;
}

/** One option of a RadioGroup. Identified by `value`. */
export function Radio<Value = string>({ label, description, trailing, className, ...props }: RadioProps<Value>) {
  const variant = useContext(VariantContext);
  const s = radioGroupVariants({ variant });
  const descId = useId();
  const trailingId = useId();
  const describedBy = [trailing != null && trailingId, description != null && descId].filter(Boolean).join(' ') || undefined;
  const control = (
    <BaseRadio.Root<Value>
      className={cn(s.radio(), label != null && 'mt-px', label == null && className)}
      aria-describedby={describedBy}
      {...props}
    >
      <BaseRadio.Indicator className={s.indicator()} />
    </BaseRadio.Root>
  );
  if (label == null) return control;
  return (
    <div className={cn(s.item(), className)}>
      <label className={s.label()}>
        {control}
        <span className={s.labelText()}>{label}</span>
      </label>
      {trailing != null && (
        <span id={trailingId} className={s.trailing()}>
          {trailing}
        </span>
      )}
      {description != null && (
        <p id={descId} className={s.description()}>
          {description}
        </p>
      )}
    </div>
  );
}

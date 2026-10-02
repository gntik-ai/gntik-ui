import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';
import { Check, Minus } from 'lucide-react';
import { useId, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { checkboxVariants, type CheckboxVariantProps } from './checkbox.variants';

const s = checkboxVariants();

export interface CheckboxProps extends Omit<BaseCheckbox.Root.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLElement>;
  /** Visible label. Without it, pass `aria-label` or wrap in a Field. */
  label?: ReactNode;
  /** Helper line under the label, linked with aria-describedby. */
  description?: ReactNode;
}

/**
 * Two-state (or indeterminate) checkbox. Controlled with `checked` + `onCheckedChange`,
 * uncontrolled with `defaultChecked`. Inside a CheckboxGroup, identify it with `value`.
 */
export function Checkbox({ label, description, className, ...props }: CheckboxProps) {
  const descId = useId();
  const control = (
    <BaseCheckbox.Root
      className={cn(s.root(), label != null && 'mt-px', label == null && className)}
      aria-describedby={description != null ? descId : undefined}
      {...props}
    >
      <BaseCheckbox.Indicator
        className={s.indicator()}
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? <Minus size={13} strokeWidth={2.6} aria-hidden /> : <Check size={13} strokeWidth={2.6} aria-hidden />}
          </span>
        )}
      />
    </BaseCheckbox.Root>
  );
  if (label == null) return control;
  return (
    <div className={cn(s.item(), className)}>
      <label className={s.label()}>
        {control}
        <span className={s.labelText()}>{label}</span>
      </label>
      {description != null && (
        <p id={descId} className={s.description()}>
          {description}
        </p>
      )}
    </div>
  );
}

export interface CheckboxGroupProps extends Omit<BaseCheckboxGroup.Props, 'className'>, CheckboxVariantProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Shared state for several checkboxes (`value` is the array of ticked `value`s). Name it with
 * `aria-labelledby`, or render it as a Fieldset: `<Fieldset render={<CheckboxGroup />}>`.
 * A `parent` checkbox plus `allValues` gives a "select all" with the indeterminate state.
 */
export function CheckboxGroup({ variant, className, ...props }: CheckboxGroupProps) {
  return <BaseCheckboxGroup className={cn(checkboxVariants({ variant }).group(), className)} {...props} />;
}

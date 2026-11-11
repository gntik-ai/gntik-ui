import { Field as BaseField } from '@base-ui/react/field';
import { NumberInput, type NumberInputProps } from '../NumberInput/NumberInput';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import {
  useState,
  Fragment,
  Children,
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../../utils/cn';
import { sliderVariants, sliderInputVariants, type SliderVariantProps } from './slider.variants';

export interface SliderProps extends Omit<BaseSlider.Root.Props, 'className' | 'children'>, SliderVariantProps {
  /** Pair each thumb with an editable NumberInput; the slider remains the form control. */
  withInput?: boolean;
  /** Paired input presentation. Size defaults to the slider size. */
  inputProps?: Pick<NumberInputProps, 'unit' | 'hideSteppers' | 'size'>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Visible label; labels every thumb. Without it, pass `aria-label` (single) or `thumbLabels`. */
  label?: ReactNode;
  /** Marks every thumb invalid; pair with a FieldError or description. */
  invalid?: boolean;
  /** Accessible name of a single thumb when there is no visible label. */
  'aria-label'?: string;
  /** Per-thumb accessible names for range sliders, e.g. `['Minimum', 'Maximum']`. */
  thumbLabels?: string[];
  /** Show the formatted value next to the label. */
  showValue?: boolean;
  /** Custom value text; receives formatted strings and raw numbers. */
  formatValue?: (formatted: readonly string[], values: readonly number[]) => ReactNode;
}

// Base UI exposes the native range input through Thumb's public render children.
// Preserve its validation props unless the caller explicitly supplies an invalid state.
function invalidThumbChildren(children: ReactNode, ariaInvalid: ComponentProps<'input'>['aria-invalid']): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<ComponentProps<'input'>>(child)) return child;
    if (child.type === 'input')
      return cloneElement(child, { 'aria-invalid': ariaInvalid ?? child.props['aria-invalid'] });
    if (child.type === Fragment)
      return cloneElement(child, {}, invalidThumbChildren(child.props.children, ariaInvalid));
    return child;
  });
}

function thumbCount(value: SliderProps['value'], defaultValue: SliderProps['defaultValue']) {
  const v = value ?? defaultValue;
  return Array.isArray(v) ? v.length : 1;
}

// Construct the documented Slider callback details without importing Base UI internals.
function inputChangeDetails(event: Event, activeThumbIndex: number): BaseSlider.Root.ChangeEventDetails {
  let canceled = false;
  let propagationAllowed = false;
  return {
    event,
    activeThumbIndex,
    reason: 'input-change',
    trigger: undefined,
    cancel() {
      canceled = true;
    },
    allowPropagation() {
      propagationAllowed = true;
    },
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return propagationAllowed;
    },
  };
}

function snapInput(value: number, min: number, max: number, step: number) {
  const precision = (number: number) => {
    const [fraction = '', exponent = '0'] = number.toString().split('e');
    return Math.max(0, (fraction.split('.')[1]?.length ?? 0) - Number(exponent));
  };
  const decimals = Math.max(precision(step), precision(min));
  const snapped = Number((min + Math.round((value - min) / step) * step).toFixed(Math.min(100, decimals)));
  return Math.min(max, Math.max(min, snapped));
}

/**
 * Pick a number (or a range) on a track. Pass an array to `value` / `defaultValue` for a
 * range: one thumb per entry. Arrow keys step, Page Up/Down take `largeStep`, Home/End jump.
 */
export function Slider({
  size,
  withInput = false,
  inputProps,
  invalid,
  'aria-invalid': ariaInvalidProp,
  label,
  'aria-label': ariaLabel,
  thumbLabels,
  showValue = false,
  formatValue = (formatted) => formatted.join(' – '),
  className,
  value,
  defaultValue,
  ...props
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? props.min ?? 0);
  const currentValue = value ?? internalValue;
  const v = sliderVariants({ size });
  const count = thumbCount(value, defaultValue);
  const ariaInvalid = ariaInvalidProp ?? (invalid || undefined);
  const control = (
    <BaseSlider.Control className={v.control()}>
      <BaseSlider.Track className={v.track()}>
        <BaseSlider.Indicator className={v.indicator()} />
        {Array.from({ length: count }, (_, i) => (
          <BaseSlider.Thumb
            key={i}
            index={i}
            aria-label={thumbLabels?.[i] ?? (count === 1 ? ariaLabel : undefined)}
            className={v.thumb()}
            render={(thumbProps) => <div {...thumbProps}>{invalidThumbChildren(thumbProps.children, ariaInvalid)}</div>}
          />
        ))}
      </BaseSlider.Track>
    </BaseSlider.Control>
  );
  if (withInput) {
    const inputStyles = sliderInputVariants();
    const values = typeof currentValue === 'number' ? [currentValue] : currentValue;
    const change: NonNullable<SliderProps['onValueChange']> = (next, details) => {
      props.onValueChange?.(next, details);
      if (!details.isCanceled && value === undefined) setInternalValue(next);
    };
    const updateInput = (next: number | null, index: number, event: Event, commit = false) => {
      const number = values[index];
      if (next === null || number === undefined) return;
      const gap = (props.minStepsBetweenValues ?? 0) * (props.step ?? 1);
      const previous = values[index - 1];
      const following = values[index + 1];
      const min = Math.max(props.min ?? 0, previous === undefined ? -Infinity : previous + gap);
      const max = Math.min(props.max ?? 100, following === undefined ? Infinity : following - gap);
      if (commit)
        next = Math.min(max, Math.max(min, snapInput(next, props.min ?? 0, props.max ?? 100, props.step ?? 1)));
      if (next < min || next > max || next === number) return;
      const nextValues = values.map((n, i) => (i === index ? next : n));
      const details = inputChangeDetails(event, index);
      change(typeof currentValue === 'number' ? next : nextValues, details);
      return details;
    };
    return (
      <BaseSlider.Root
        {...props}
        value={currentValue}
        onValueChange={change}
        className={cn(v.root(), className)}
        {...(invalid ? { 'data-invalid': true } : {})}
        aria-invalid={ariaInvalid}
        render={(rootProps, state) => (
          <div {...rootProps}>
            {label && (
              <div className={v.header()}>
                <BaseSlider.Label className={v.label()}>{label}</BaseSlider.Label>
              </div>
            )}
            <div className={inputStyles.row()}>
              {control}
              <div className="flex gap-3">
                {state.values.map((number, index) => (
                  <BaseField.Root key={index} disabled={state.disabled}>
                    <NumberInput
                      className={inputStyles.input()}
                      role="spinbutton"
                      aria-valuemin={props.min ?? 0}
                      aria-valuemax={props.max ?? 100}
                      aria-valuenow={number}
                      aria-label={thumbLabels?.[index] ?? (!label ? ariaLabel : undefined)}
                      aria-labelledby={
                        thumbLabels?.[index] || (!label && ariaLabel) ? undefined : rootProps['aria-labelledby']
                      }
                      value={number}
                      min={props.min ?? 0}
                      max={props.max ?? 100}
                      step={props.step}
                      largeStep={props.largeStep}
                      format={props.format}
                      locale={props.locale}
                      allowOutOfRange
                      size={inputProps?.size ?? size ?? 'md'}
                      unit={inputProps?.unit}
                      hideSteppers={inputProps?.hideSteppers}
                      onValueChange={(next, details) => {
                        // Blur normalization is handled by the commit callback, once.
                        if (details.reason === 'input-blur') return;
                        if (updateInput(next, index, details.event)?.isCanceled) details.cancel();
                      }}
                      onValueCommitted={(next, details) => {
                        if (details.reason === 'input-blur') updateInput(next, index, details.event, true);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' || !(event.target instanceof HTMLInputElement)) return;
                        event.preventDefault();
                        // Use the same public blur normalization path for Enter and Tab.
                        event.target.blur();
                        event.target.focus();
                      }}
                    />
                  </BaseField.Root>
                ))}
              </div>
            </div>
          </div>
        )}
      />
    );
  }
  return (
    <BaseSlider.Root
      className={cn(v.root(), className)}
      value={value}
      defaultValue={defaultValue}
      {...props}
      {...(invalid ? { 'data-invalid': true } : {})}
      aria-invalid={ariaInvalid}
    >
      {(label || showValue) && (
        <div className={v.header()}>
          {label && <BaseSlider.Label className={v.label()}>{label}</BaseSlider.Label>}
          {showValue && (
            <BaseSlider.Value className={cn(v.value(), !label && 'ms-auto')}>{formatValue}</BaseSlider.Value>
          )}
        </div>
      )}
      {control}
    </BaseSlider.Root>
  );
}

import { Slider as BaseSlider } from '@base-ui/react/slider';
import { Fragment, Children, cloneElement, isValidElement, type ComponentProps, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { sliderVariants, type SliderVariantProps } from './slider.variants';

export interface SliderProps extends Omit<BaseSlider.Root.Props, 'className' | 'children'>, SliderVariantProps {
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

/**
 * Pick a number (or a range) on a track. Pass an array to `value` / `defaultValue` for a
 * range: one thumb per entry. Arrow keys step, Page Up/Down take `largeStep`, Home/End jump.
 */
export function Slider({
  size,
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
  const v = sliderVariants({ size });
  const count = thumbCount(value, defaultValue);
  const ariaInvalid = ariaInvalidProp ?? (invalid || undefined);
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
      <BaseSlider.Control className={v.control()}>
        <BaseSlider.Track className={v.track()}>
          <BaseSlider.Indicator className={v.indicator()} />
          {Array.from({ length: count }, (_, i) => (
            <BaseSlider.Thumb
              key={i}
              index={i}
              aria-label={thumbLabels?.[i] ?? (count === 1 ? ariaLabel : undefined)}
              className={v.thumb()}
              render={(thumbProps) => (
                <div {...thumbProps}>{invalidThumbChildren(thumbProps.children, ariaInvalid)}</div>
              )}
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}

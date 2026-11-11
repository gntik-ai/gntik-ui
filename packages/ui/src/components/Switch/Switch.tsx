import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { useContext, useId, type ReactNode, type Ref } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { FieldsetDisabledContext, InFieldContext } from '../../utils/in-field-context';
import { Spinner } from '../Spinner/Spinner';
import { switchLoadingVariants, switchVariants, type SwitchVariantProps } from './switch.variants';

export interface SwitchProps extends Omit<BaseSwitch.Root.Props, 'className'>, SwitchVariantProps {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  /** Visible label. Without it, pass `aria-label` or wrap in a Field. */
  label?: ReactNode;
  /** Marks the switch invalid; pair with a FieldError or description. */
  invalid?: boolean;
  /** Label placement relative to the track. */
  labelPosition?: 'start' | 'end';
  /** Pending state: shows a spinner and ignores toggles while staying focusable. Ignored when `disabled`. */
  loading?: boolean;
  /** Replaces the catalog "Saving…" text added to the description while `loading`. */
  loadingLabel?: string;
}

/** On/off setting. Controlled with `checked` + `onCheckedChange`, or uncontrolled with `defaultChecked`. */
export function Switch({
  size,
  label,
  labelPosition = 'end',
  className,
  invalid,
  loading = false,
  loadingLabel,
  ...props
}: SwitchProps) {
  const s = switchVariants({ size });
  const l = switchLoadingVariants({ size });
  const { t } = useI18n();
  const savingId = useId();
  const field = useContext(InFieldContext);
  const inDisabledFieldset = useContext(FieldsetDisabledContext);
  const busy = loading && !(props.disabled || field?.disabled || inDisabledFieldset);
  const describedBy = busy
    ? [props['aria-describedby'], savingId].filter(Boolean).join(' ')
    : props['aria-describedby'];
  const control = (
    <BaseSwitch.Root
      className={cn(s.root(), busy && l.root(), !label && className)}
      {...props}
      {...(busy ? { readOnly: true, 'aria-busy': true, 'data-loading': true } : {})}
      {...(invalid ? { 'data-invalid': true } : {})}
      aria-describedby={describedBy}
      aria-invalid={props['aria-invalid'] ?? (invalid || undefined)}
    >
      <BaseSwitch.Thumb className={s.thumb()}>{busy && <Spinner className={l.spinner()} />}</BaseSwitch.Thumb>
      {busy && (
        <span id={savingId} aria-hidden className="sr-only">
          {loadingLabel ?? t('switch.saving')}
        </span>
      )}
    </BaseSwitch.Root>
  );
  if (!label) return control;
  return (
    <label className={cn(s.label(), props.disabled && 'opacity-70', className)}>
      {labelPosition === 'start' && label}
      {control}
      {labelPosition === 'end' && label}
    </label>
  );
}

import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '../../utils/cn';
import { IconButton } from '../Button';
import { Input, type InputProps } from '../Input';
import { DEFAULT_STRENGTH_LABELS, scorePassword, type PasswordStrength } from './password-strength';
import { PASSWORD_SEGMENT_FILL, passwordInputVariants } from './password-input.variants';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'trailingAddon' | 'value' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  /** Whether the password is shown as text (controlled). */
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  /** Show the strength meter under the field. */
  showStrength?: boolean;
  /** Strength score 0–4 from your own checker; defaults to the built-in heuristic. */
  strength?: PasswordStrength;
  /** Five labels for scores 0–4. */
  strengthLabels?: readonly [string, string, string, string, string];
  /** Prefix of the announced strength text ("Strength: Good"). */
  strengthPrefix?: string;
  showLabel?: string;
  hideLabel?: string;
  /** Classes for the column that holds the field and the meter. */
  wrapperClassName?: string;
}

/**
 * Password field on Input with a reveal toggle (aria-pressed) and an optional segmented
 * strength meter whose text is linked to the input via aria-describedby.
 */
export function PasswordInput({
  value,
  defaultValue,
  onValueChange,
  visible: visibleProp,
  defaultVisible = false,
  onVisibleChange,
  showStrength = false,
  strength,
  strengthLabels = DEFAULT_STRENGTH_LABELS,
  strengthPrefix = 'Strength:',
  showLabel = 'Show password',
  hideLabel = 'Hide password',
  size = 'md',
  wrapperClassName,
  className,
  disabled,
  'aria-describedby': describedBy,
  ...props
}: PasswordInputProps) {
  const strengthId = useId();
  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const [innerVisible, setInnerVisible] = useState(defaultVisible);
  const current = value ?? innerValue;
  const visible = visibleProp ?? innerVisible;
  const score = strength ?? scorePassword(current);
  const s = passwordInputVariants({ level: score });

  const toggle = () => {
    setInnerVisible(!visible);
    onVisibleChange?.(!visible);
  };

  const describedByIds = cn(describedBy, showStrength && current && strengthId);
  const input = (
    <Input
      {...props}
      {...(describedByIds ? { 'aria-describedby': describedByIds } : {})}
      size={size}
      disabled={disabled}
      className={cn('pr-1', className)}
      type={visible ? 'text' : 'password'}
      autoComplete={props.autoComplete ?? (showStrength ? 'new-password' : 'current-password')}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onValueChange={(v, details) => {
        setInnerValue(v);
        onValueChange?.(v, details);
      }}
      trailingAddon={
        <IconButton
          size="sm"
          className={s.toggle()}
          icon={visible ? EyeOff : Eye}
          label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          disabled={disabled}
          onClick={toggle}
        />
      }
    />
  );

  if (!showStrength) return input;
  return (
    <div className={cn(s.root(), wrapperClassName)}>
      {input}
      <div className={s.meter()}>
        <div className={s.segments()} aria-hidden>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className={cn(s.segment(), current && n <= Math.max(score, 1) && PASSWORD_SEGMENT_FILL[score])} />
          ))}
        </div>
        <p id={strengthId} className={s.text()}>
          {current ? (
            <>
              {strengthPrefix} <span className={s.level()}>{strengthLabels[score]}</span>
            </>
          ) : (
            'Use 12+ characters with a mix of letters, numbers and symbols.'
          )}
        </p>
      </div>
    </div>
  );
}

import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '../../utils/cn';
import { IconButton } from '../Button';
import { Input, type InputProps } from '../Input';
import {
  builtInPasswordRules,
  scorePassword,
  type PasswordRequirement,
  type PasswordRules,
  type PasswordStrength,
} from './password-strength';
import { PasswordRequirements, type PasswordRequirementState } from './PasswordRequirements';
import { useI18n } from '../../i18n/I18nProvider';
import { PASSWORD_SEGMENT_FILL, passwordInputVariants } from './password-input.variants';

export interface PasswordInputProps extends Omit<
  InputProps,
  'type' | 'trailingAddon' | 'value' | 'defaultValue' | 'size'
> {
  size?: 'auto' | 'sm' | 'md' | 'lg';
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
  /**
   * Built-in rules shown as a checklist under the field. Without `strength`, the meter score is
   * the share of met rules (a rule count, not a measure of guessability).
   */
  rules?: PasswordRules;
  /** Custom rules added to the checklist after the built-in ones. */
  requirements?: readonly PasswordRequirement[];
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
  strengthLabels: strengthLabelsProp,
  strengthPrefix: strengthPrefixProp,
  rules,
  requirements,
  showLabel: showLabelProp,
  hideLabel: hideLabelProp,
  size = 'auto',
  wrapperClassName,
  className,
  disabled,
  'aria-describedby': describedBy,
  ...props
}: PasswordInputProps) {
  const { t } = useI18n();
  const strengthPrefix = strengthPrefixProp ?? t('password.strength');
  const showLabel = showLabelProp ?? t('password.show');
  const hideLabel = hideLabelProp ?? t('password.hide');
  const strengthLabels =
    strengthLabelsProp ??
    ([
      t('password.tooWeak'),
      t('password.weak'),
      t('password.fair'),
      t('password.good'),
      t('password.strong'),
    ] as const);
  const strengthId = useId();
  const requirementsId = useId();
  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const [innerVisible, setInnerVisible] = useState(defaultVisible);
  const current = value ?? innerValue;
  const visible = visibleProp ?? innerVisible;
  const checklist: PasswordRequirementState[] = [
    ...builtInPasswordRules(rules).map(({ id, test }) => ({
      id,
      label: t(`password.rule.${id}`, { count: rules?.minLength ?? 0 }),
      met: test(current),
    })),
    ...(requirements ?? []).map(({ id, label, test }) => ({ id, label, met: test(current) })),
  ];
  const hasChecklist = rules !== undefined || requirements !== undefined;
  const metCount = checklist.filter((item) => item.met).length;
  const score =
    strength ??
    (hasChecklist
      ? ((current && checklist.length > 0 ? Math.round((4 * metCount) / checklist.length) : 0) as PasswordStrength)
      : scorePassword(current));
  const s = passwordInputVariants({ level: score, size });

  const toggle = () => {
    setInnerVisible(!visible);
    onVisibleChange?.(!visible);
  };

  const describedByIds = cn(describedBy, showStrength && current && strengthId, hasChecklist && requirementsId);
  const input = (
    <Input
      {...props}
      {...(describedByIds ? { 'aria-describedby': describedByIds } : {})}
      size={size}
      disabled={disabled}
      className={cn('pe-1', className)}
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
          size={size === 'lg' ? 'md' : 'sm'}
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

  if (!showStrength && !hasChecklist) return input;
  const checklistNode = hasChecklist ? (
    <PasswordRequirements id={requirementsId} items={checklist} empty={!current} value={current} size={size} />
  ) : null;
  if (!showStrength) {
    return (
      <div className={cn(s.root(), wrapperClassName)}>
        {input}
        {checklistNode}
      </div>
    );
  }
  return (
    <div className={cn(s.root(), wrapperClassName)}>
      {input}
      <div className={s.meter()}>
        <div className={s.segments()} aria-hidden>
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={cn(s.segment(), current && n <= Math.max(score, 1) && PASSWORD_SEGMENT_FILL[score])}
            />
          ))}
        </div>
        <p id={strengthId} className={s.text()}>
          {hasChecklist && !current ? null : current ? (
            <>
              {strengthPrefix} <span className={s.level()}>{strengthLabels[score]}</span>
            </>
          ) : (
            'Use 12+ characters with a mix of letters, numbers and symbols.'
          )}
        </p>
      </div>
      {checklistNode}
    </div>
  );
}

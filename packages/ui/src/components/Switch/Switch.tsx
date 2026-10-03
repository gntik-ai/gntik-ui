import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { switchVariants, type SwitchVariantProps } from './switch.variants';

export interface SwitchProps extends Omit<BaseSwitch.Root.Props, 'className'>, SwitchVariantProps {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  /** Visible label. Without it, pass `aria-label` or wrap in a Field. */
  label?: ReactNode;
  /** Label placement relative to the track. */
  labelPosition?: 'start' | 'end';
}

/** On/off setting. Controlled with `checked` + `onCheckedChange`, or uncontrolled with `defaultChecked`. */
export function Switch({ size, label, labelPosition = 'end', className, ...props }: SwitchProps) {
  const s = switchVariants({ size });
  const control = (
    <BaseSwitch.Root className={cn(s.root(), !label && className)} {...props}>
      <BaseSwitch.Thumb className={s.thumb()} />
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

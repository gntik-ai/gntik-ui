import { Input as BaseInput } from '@base-ui/react/input';
import type { ComponentType, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { inputVariants, INPUT_ICON_SIZE, type InputVariantProps } from './input.variants';

type IconComponent = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;

export interface InputProps extends Omit<BaseInput.Props, 'className' | 'size'>, InputVariantProps {
  /** Classes for the outer wrapper (border, width, layout). */
  className?: string;
  /** Classes for the native <input>. */
  inputClassName?: string;
  ref?: Ref<HTMLInputElement>;
  /** Decorative icon before the text (a lucide icon component). */
  leadingIcon?: IconComponent;
  /** Decorative icon after the text. */
  trailingIcon?: IconComponent;
  /** Content before the input: a text prefix ("https://") or a compact control. */
  leadingAddon?: ReactNode;
  /** Content after the input: a unit ("req/s"), a keyboard hint or an icon button. */
  trailingAddon?: ReactNode;
  /** Marks the value as invalid (sets aria-invalid). Inside a Field, `Field invalid` does this. */
  invalid?: boolean;
}

/**
 * Single-line text input on Base UI Input (works with Field out of the box). The wrapper
 * carries the border, focus outline and invalid/disabled styling; icons and addons sit inside it.
 */
export function Input({
  size = 'md',
  className,
  inputClassName,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  leadingAddon,
  trailingAddon,
  invalid,
  ...props
}: InputProps) {
  const s = inputVariants({ size });
  const px = INPUT_ICON_SIZE[size];
  return (
    <div className={cn(s.root(), className)} data-invalid={invalid || undefined}>
      {LeadingIcon && <LeadingIcon size={px} aria-hidden className={s.icon()} />}
      {leadingAddon != null && <span className={s.addon()}>{leadingAddon}</span>}
      <BaseInput
        className={cn(s.input(), inputClassName)}
        aria-invalid={invalid || undefined}
        {...props}
      />
      {trailingAddon != null && <span className={s.addon()}>{trailingAddon}</span>}
      {TrailingIcon && <TrailingIcon size={px} aria-hidden className={s.icon()} />}
    </div>
  );
}

/** Keyboard-shortcut hint for a trailing addon, e.g. `<InputKbd>⌘K</InputKbd>`. */
export function InputKbd({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-[18px] items-center rounded border border-border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

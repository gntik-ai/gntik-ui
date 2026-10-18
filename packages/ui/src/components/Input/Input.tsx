import { Input as BaseInput } from '@base-ui/react/input';
import { useState, type ComponentType, type ReactNode, type Ref } from 'react';
import { useRender } from '@base-ui/react/use-render';
import { ClearControlButton, resetNativeValue, type ClearableProps } from '../../utils/clear-control';
import { cn } from '../../utils/cn';
import { inputVariants, INPUT_ICON_SIZE, type InputVariantProps } from './input.variants';

type IconComponent = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;

export interface InputProps extends Omit<BaseInput.Props, 'className' | 'size'>, InputVariantProps, ClearableProps {
  /** Clear a non-empty editable input on Escape and stop propagation. */
  clearOnEscape?: boolean;
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
  size = 'auto',
  className,
  inputClassName,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  leadingAddon,
  trailingAddon,
  invalid,
  clearable,
  clearLabel,
  onClear,
  clearOnEscape,
  ref,
  onValueChange,
  onKeyDown,
  ...props
}: InputProps) {
  const [control, setControl] = useState<HTMLInputElement | null>(null);
  const [inner, setInner] = useState(props.defaultValue ?? '');
  const hasValue = String(props.value ?? (control ? control.value : inner)).length > 0;
  const clear = () => {
    if (!control || control.disabled || control.readOnly) return;
    resetNativeValue(control);
    onClear?.();
    control.focus();
  };
  const input = useRender({
    ref: [ref ?? null, setControl],
    render: (
      <BaseInput
        {...props}
        onValueChange={(value, details) => {
          setInner(value);
          onValueChange?.(value, details);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            !event.defaultPrevented &&
            clearOnEscape &&
            event.key === 'Escape' &&
            event.currentTarget.value &&
            !event.currentTarget.disabled &&
            !event.currentTarget.readOnly
          ) {
            event.preventDefault();
            event.stopPropagation();
            clear();
          }
        }}
        className={cn(inputVariants({ size }).input(), inputClassName)}
        aria-invalid={props['aria-invalid'] ?? (invalid || undefined)}
      />
    ),
  });
  const s = inputVariants({ size });
  const px = INPUT_ICON_SIZE[size];
  return (
    <div className={cn(s.root(), className)} data-invalid={invalid || undefined}>
      {LeadingIcon && <LeadingIcon size={px} aria-hidden className={s.icon()} />}
      {leadingAddon != null && <span className={s.addon()}>{leadingAddon}</span>}
      {input}
      {trailingAddon != null && <span className={s.addon()}>{trailingAddon}</span>}
      {clearable && hasValue && !props.disabled && !props.readOnly && (
        <ClearControlButton control={control} clearLabel={clearLabel} onClick={clear} />
      )}
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

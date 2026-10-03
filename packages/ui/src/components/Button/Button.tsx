import { Button as BaseButton } from '@base-ui/react/button';
import type { ComponentType, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { rtlIconClass } from '../../utils/rtl';
import { Spinner } from '../Spinner/Spinner';
import { buttonVariants, BUTTON_ICON_SIZE, type ButtonVariantProps } from './button.variants';

type IconComponent = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;

export interface ButtonProps extends Omit<BaseButton.Props, 'className'>, ButtonVariantProps {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  /** Leading icon (a lucide icon component). Directional ones (ChevronLeft, ArrowRight…) mirror under RTL. */
  icon?: IconComponent;
  /** Trailing icon. */
  trailingIcon?: IconComponent;
  /** Shows a spinner, disables the button and sets aria-busy. */
  loading?: boolean;
  children?: ReactNode;
}

/** Primary action control. Renders a native <button> unless `render` swaps the element. */
export function Button({
  variant,
  size = 'md',
  iconOnly,
  icon: LeadingIcon,
  trailingIcon: TrailingIcon,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const px = BUTTON_ICON_SIZE[size];
  return (
    <BaseButton
      type={type}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, iconOnly }), className)}
      {...props}
    >
      {loading ? <Spinner size={px} /> : LeadingIcon && <LeadingIcon size={px} aria-hidden className={rtlIconClass(LeadingIcon)} />}
      {children}
      {!loading && TrailingIcon && <TrailingIcon size={px} aria-hidden className={rtlIconClass(TrailingIcon)} />}
    </BaseButton>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'trailingIcon' | 'children' | 'iconOnly'> {
  icon: IconComponent;
  /** Required accessible name (also used as the tooltip text by callers). */
  label: string;
}

/** Square, icon-only button. `label` becomes its accessible name. */
export function IconButton({ icon: IconCmp, label, size = 'md', variant = 'ghost', loading, className, ...props }: IconButtonProps) {
  const px = BUTTON_ICON_SIZE[size];
  return (
    <Button
      aria-label={label}
      size={size}
      variant={variant}
      iconOnly
      loading={loading}
      className={className}
      {...props}
    >
      {!loading && <IconCmp size={px} aria-hidden className={rtlIconClass(IconCmp)} />}
    </Button>
  );
}

import type { ComponentType } from 'react';
import { Button, buttonVariants, cn } from '@gntik-ai/ui';

type IconComponent = ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;

/** A call to action: a link when `href` is set, otherwise a button. */
export interface MarketingAction {
  label: string;
  href?: string;
  onClick?: () => void;
  /** Trailing icon (lucide component). */
  icon?: IconComponent;
}

export function ActionButton({
  action,
  variant,
  size = 'lg',
  className,
}: {
  action: MarketingAction;
  variant: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  className?: string;
}) {
  const Trailing = action.icon;
  if (action.href) {
    return (
      <a href={action.href} onClick={action.onClick} className={cn(buttonVariants({ variant, size }), className)}>
        {action.label}
        {Trailing && <Trailing size={size === 'lg' ? 17 : 15} aria-hidden />}
      </a>
    );
  }
  return (
    <Button variant={variant} size={size} trailingIcon={Trailing} onClick={action.onClick} className={className}>
      {action.label}
    </Button>
  );
}

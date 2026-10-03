import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { useTheme } from './ThemeProvider';
import type { BrandPreset } from './presets';

export interface LogoProps extends HTMLAttributes<HTMLSpanElement> {
  /** Mark size in px. */
  size?: number;
  /** Show the product name next to the mark. */
  wordmark?: boolean;
  /** Override the preset from ThemeProvider. */
  brand?: BrandPreset;
}

/** The active brand's mark, optionally with its wordmark. */
export function Logo({ size = 28, wordmark = false, brand, className, ...props }: LogoProps) {
  const theme = useTheme();
  const active = brand ?? theme.brand;
  return (
    <span
      role="img"
      aria-label={active.name}
      className={cn('inline-flex items-center gap-[7px]', className)}
      {...props}
    >
      {active.mark(size)}
      {wordmark && (
        <span aria-hidden="true" className="font-sans font-bold tracking-[-0.02em] text-foreground" style={{ fontSize: Math.round(size * 0.64) }}>
          {active.name}
          <span className="text-primary">.</span>
        </span>
      )}
    </span>
  );
}

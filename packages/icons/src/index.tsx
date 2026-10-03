import type { LucideIcon, LucideProps } from 'lucide-react';

// The single icon source for gntik-ai products: every lucide icon, re-exported.
export * from 'lucide-react';

/** Brand icon sizes (px). Buttons use sm/md/lg; inline text uses xs. */
export const ICON_SIZE = { xs: 12, sm: 14, md: 15, lg: 17, xl: 20, '2xl': 24 } as const;
export type IconSize = keyof typeof ICON_SIZE;

export interface IconProps extends Omit<LucideProps, 'size'> {
  /** The lucide icon component, e.g. `icon={Bot}`. */
  icon: LucideIcon;
  /** Brand size token or px. */
  size?: IconSize | number;
  /** Accessible label. Without it the icon is decorative (aria-hidden). */
  label?: string;
}

/** Renders a lucide icon at a brand size; decorative unless `label` is given. */
export function Icon({ icon: Glyph, size = 'md', label, strokeWidth = 2, ...props }: IconProps) {
  const px = typeof size === 'number' ? size : ICON_SIZE[size];
  return (
    <Glyph
      size={px}
      strokeWidth={strokeWidth}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
      {...props}
    />
  );
}

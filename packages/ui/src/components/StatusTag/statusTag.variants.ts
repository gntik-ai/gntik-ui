import { tv, type VariantProps } from '../../utils/tv';
import type { BadgeTone } from '../Badge/badge.variants';

/** Layout on top of the Badge styles: optional uppercase kicker style. */
export const statusTagVariants = tv({
  base: 'tracking-wide',
  variants: {
    uppercase: { true: 'uppercase', false: '' },
  },
  defaultVariants: { uppercase: false },
});

export type StatusTagVariantProps = VariantProps<typeof statusTagVariants>;

export interface StatusDefinition {
  /** Visible label. */
  label: string;
  /** Badge tone the state maps to. */
  tone: BadgeTone;
}

/** Generic lifecycle states. Extend or override per product with the `statuses` prop. */
export const DEFAULT_STATUSES: Record<string, StatusDefinition> = {
  running: { label: 'Running', tone: 'success' },
  succeeded: { label: 'Succeeded', tone: 'success' },
  queued: { label: 'Queued', tone: 'info' },
  pending: { label: 'Pending', tone: 'neutral' },
  paused: { label: 'Paused', tone: 'neutral' },
  draft: { label: 'Draft', tone: 'neutral' },
  degraded: { label: 'Degraded', tone: 'warning' },
  failed: { label: 'Failed', tone: 'destructive' },
};

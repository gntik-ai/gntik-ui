import { tv, type VariantProps } from '../../utils/tv';

/**
 * Roles × permissions grid. Each cell is a chip-like button: allowed and denied use their tone
 * tint with the chip-text alias plus an icon and a word; inherited is a dashed, muted outline.
 */
export const permissionMatrixVariants = tv({
  slots: {
    root: 'w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-card',
    table: 'w-full border-collapse text-[13px]',
    caption: 'px-3 pt-3 pb-1 text-start text-[13px] font-semibold text-foreground',
    corner: 'border-b border-border bg-secondary/40 px-3 py-2 text-start text-[12px] font-semibold text-muted-foreground',
    roleHead: 'border-b border-border bg-secondary/40 px-2 py-2 text-center text-[12px] font-semibold whitespace-nowrap text-foreground',
    roleInner: 'inline-flex items-center gap-1',
    roleIcon: 'shrink-0 text-muted-foreground',
    roleDescription: 'block text-[11px] font-normal text-muted-foreground',
    section: 'bg-card px-3 pt-4 pb-1.5 text-start font-mono text-[11px] font-semibold tracking-wide text-muted-foreground uppercase',
    rowHead: 'border-t border-border/60 px-3 py-2 text-start align-middle font-normal',
    permLabel: 'block text-[13px] font-medium text-foreground',
    permDescription: 'block text-[12px] text-muted-foreground',
    cell: 'border-t border-border/60 px-2 py-1.5 text-center align-middle',
    toggle: [
      'inline-flex h-chip min-w-24 items-center justify-center gap-1 rounded-md px-2 text-[11.5px] font-medium whitespace-nowrap',
      'transition-colors motion-reduce:transition-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      'aria-disabled:cursor-not-allowed',
    ],
  },
  variants: {
    state: {
      allowed: { toggle: 'bg-success/15 text-success-chip-text hover:bg-success/22' },
      denied: { toggle: 'bg-destructive/15 text-destructive-chip-text hover:bg-destructive/22' },
      inherited: { toggle: 'border border-dashed border-border text-muted-foreground hover:bg-secondary/60' },
    },
  },
});

export type PermissionMatrixVariantProps = VariantProps<typeof permissionMatrixVariants>;

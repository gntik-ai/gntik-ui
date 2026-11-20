import { cn, TableHead } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import { stickyTint, type CellLayout } from './column-sizing';

/** Shared sticky treatment for the selection, detail and actions headers. */
export function SpecialHead({
  layout,
  className,
  children,
}: {
  layout?: CellLayout;
  className: string;
  children: ReactNode;
}) {
  return (
    <TableHead
      className={cn(
        className,
        layout?.className,
        layout?.pinned && 'z-sticky-pinned bg-card',
        stickyTint(layout, { head: true }),
      )}
      style={layout?.style}
    >
      {children}
    </TableHead>
  );
}

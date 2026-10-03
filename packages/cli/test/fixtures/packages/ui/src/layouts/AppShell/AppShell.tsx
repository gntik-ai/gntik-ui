import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export function AppShell({ sidebar, children, className }: { sidebar?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('grid min-h-dvh grid-cols-[16rem_1fr] bg-background', className)}>
      <aside className="bg-chrome">{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}

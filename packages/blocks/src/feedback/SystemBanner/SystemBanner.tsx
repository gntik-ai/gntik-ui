import { CircleAlert, Info, Wrench, X } from '@gntik-ai/icons';
import type { LucideIcon } from '@gntik-ai/icons';
import { Button, IconButton, Link, cn } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import type { FeedbackAction } from '../types';

export type SystemBannerKind = 'maintenance' | 'incident' | 'info';

const KIND: Record<SystemBannerKind, { root: string; accent: string; icon: LucideIcon }> = {
  info: { root: 'border-info/25 bg-info/10', accent: 'text-foreground', icon: Info },
  maintenance: { root: 'border-warning/30 bg-warning/10', accent: 'text-warning-text', icon: Wrench },
  incident: { root: 'border-destructive/30 bg-destructive/10', accent: 'text-destructive-text', icon: CircleAlert },
};
const ICON_TONE: Record<SystemBannerKind, string> = {
  info: 'text-info',
  maintenance: 'text-warning-text',
  incident: 'text-destructive-text',
};

export interface SystemBannerProps {
  kind?: SystemBannerKind;
  /** Bold lead-in. */
  title?: ReactNode;
  message?: ReactNode;
  /** Optional call to action (status page, details). */
  action?: FeedbackAction | null;
  /** Shows a dismiss button. Incidents are usually not dismissible. */
  dismissible?: boolean;
  /** Controlled visibility; omit to let the banner hide itself on dismiss. */
  open?: boolean;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Full-width banner above the app chrome for system-wide notices. Incidents are announced
 * assertively (role="alert"); maintenance and info politely (role="status").
 */
export function SystemBanner({
  kind = 'maintenance',
  title = 'Scheduled maintenance.',
  message = 'Services restart zone by zone on Jul 2 at 02:00 UTC. No downtime expected.',
  action = { label: 'View details', href: '#status' },
  dismissible = true,
  open,
  onDismiss,
  className,
}: SystemBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (!(open ?? !dismissed)) return null;
  const k = KIND[kind];
  const Icon = k.icon;
  return (
    <div
      role={kind === 'incident' ? 'alert' : 'status'}
      data-kind={kind}
      className={cn('flex w-full flex-col gap-2.5 border-b px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4 sm:px-6', k.root, className)}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <Icon size={17} strokeWidth={1.9} aria-hidden className={cn('mt-0.5 shrink-0 sm:mt-0', ICON_TONE[kind])} />
        <p className="min-w-0 text-[13px] leading-6 text-foreground">
          {title != null && <span className={cn('font-semibold', k.accent)}>{title} </span>}
          {message}
        </p>
      </div>
      {(action || dismissible) && (
        <div className="flex shrink-0 items-center gap-2 ps-7 sm:ps-0">
          {action &&
            (action.href ? (
              <Link href={action.href} className="text-[12.5px] font-semibold">
                {action.label}
              </Link>
            ) : (
              <Button size="sm" variant={action.variant ?? 'secondary'} icon={action.icon} disabled={action.disabled} onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          {dismissible && (
            <IconButton
              icon={X}
              label="Dismiss banner"
              size="sm"
              variant="ghost"
              className="ms-auto"
              onClick={() => {
                setDismissed(true);
                onDismiss?.();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

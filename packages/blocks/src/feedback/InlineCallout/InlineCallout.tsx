import { Alert, Button, Link, useI18n, type AlertTone } from '@gntik-ai/ui';
import type { LucideIcon } from '@gntik-ai/icons';
import { useState, type ReactNode } from 'react';
import type { FeedbackAction } from '../types';

export interface InlineCalloutLabels {
  title: string;
  description: string;
  upgrade: string;
  viewUsage: string;
}

export interface InlineCalloutProps {
  /** Per-key copy overrides; explicit props take precedence, then labels, then the active catalog. */
  labels?: Partial<InlineCalloutLabels>;
  tone?: AlertTone;
  title?: ReactNode;
  description?: ReactNode;
  /** Buttons (or links when `href` is set) under the text; the first is the main one. */
  actions?: FeedbackAction[];
  /** Replaces the tone icon; `null` hides it. */
  icon?: LucideIcon | null;
  /** Shows a dismiss button; the callout hides itself unless `open` is controlled. */
  dismissible?: boolean;
  open?: boolean;
  onDismiss?: () => void;
  className?: string;
}

/** In-content callout built on Alert: tone, title, body and a row of actions. */
export function InlineCallout({
  tone = 'warning',
  title: titleProp,
  labels,
  description: descriptionProp,
  actions: actionsProp,
  icon,
  dismissible = false,
  open,
  onDismiss,
  className,
}: InlineCalloutProps) {
  const { t } = useI18n();
  const title = titleProp === undefined ? (labels?.title ?? t('callout.title')) : titleProp;
  const description =
    descriptionProp === undefined ? (labels?.description ?? t('callout.description')) : descriptionProp;
  const actions: FeedbackAction[] = actionsProp ?? [
    { label: labels?.upgrade ?? t('callout.upgrade'), variant: 'secondary' },
    { label: labels?.viewUsage ?? t('callout.viewUsage'), href: '#usage' },
  ];
  const [dismissed, setDismissed] = useState(false);
  if (!(open ?? !dismissed)) return null;
  return (
    <Alert
      tone={tone}
      title={title}
      description={description}
      icon={icon}
      className={className}
      onDismiss={
        dismissible
          ? () => {
              setDismissed(true);
              onDismiss?.();
            }
          : undefined
      }
      actions={
        actions.length > 0 ? (
          <>
            {actions.map((a, i) =>
              a.href ? (
                <Link key={a.id ?? a.label} href={a.href} className="text-[12.5px] font-semibold">
                  {a.label}
                </Link>
              ) : (
                <Button
                  key={a.id ?? a.label}
                  size="sm"
                  variant={a.variant ?? (i === 0 ? 'secondary' : 'ghost')}
                  icon={a.icon}
                  disabled={a.disabled}
                  onClick={a.onClick}
                >
                  {a.label}
                </Button>
              ),
            )}
          </>
        ) : undefined
      }
    />
  );
}

import { Check, Copy, RotateCw, ServerCrash } from '@gntik-ai/icons';
import type { LucideIcon } from '@gntik-ai/icons';
import {
  Button,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  IconButton,
  cn,
  useClipboard,
  useI18n,
} from '@gntik-ai/ui';
import { useId, useState, type ReactNode } from 'react';
import type { FeedbackAction } from '../types';

export interface ErrorPanelLabels {
  title: string;
  message: string;
  support: string;
  retry: string;
  retrying: string;
  retryingStatus: string;
  requestId: string;
  copyRequestId: string;
  copied: string;
  requestIdCopied: string;
  details: string;
}

export interface ErrorPanelProps {
  /** Per-key copy overrides; explicit props take precedence, then labels, then the active catalog. */
  labels?: Partial<ErrorPanelLabels>;
  icon?: LucideIcon;
  title?: ReactNode;
  /** Human summary of what failed and what to do. */
  message?: ReactNode;
  /** Status or error code shown as a mono chip (e.g. 503, ECONNRESET). */
  code?: string | number | null;
  /** Correlation id for support; gets a copy button. */
  requestId?: string;
  /** Raw details (response body, stack) behind a disclosure. */
  details?: string;
  /** Retry handler. A returned promise shows the loading state until it settles. */
  onRetry?: () => void | Promise<void>;
  /** Force the loading state from outside. */
  retrying?: boolean;
  retryLabel?: string;
  /** Extra action next to Retry (e.g. contact support). */
  secondaryAction?: FeedbackAction | null;
  titleAs?: 'h2' | 'h3';
  className?: string;
  /** Disable the status region when a parent owns announcements. */
  announce?: boolean;
}

/** Error summary for a failed load or action: what happened, request id, retry and technical details. */
export function ErrorPanel({
  icon: Icon = ServerCrash,
  title: titleProp,
  labels,
  message: messageProp,
  code = 503,
  requestId = 'req_8f2c41d07a9b',
  details = 'GET /v1/projects/acme-web/deployments\n503 Service Unavailable\nupstream timed out after 30000 ms (pool: api-eu-west-1)',
  onRetry,
  retrying,
  retryLabel: retryLabelProp,
  secondaryAction: secondaryActionProp,
  titleAs: Heading = 'h3',
  className,
  announce = true,
}: ErrorPanelProps) {
  const { t } = useI18n();
  const title = titleProp === undefined ? (labels?.title ?? t('error.title')) : titleProp;
  const message = messageProp === undefined ? (labels?.message ?? t('error.message')) : messageProp;
  const secondaryAction =
    secondaryActionProp === undefined
      ? { label: labels?.support ?? t('error.support'), variant: 'ghost' as const }
      : secondaryActionProp;
  const retryLabel = retryLabelProp ?? labels?.retry ?? t('error.retry');
  const id = useId();
  const [innerRetrying, setInnerRetrying] = useState(false);
  const { copied, copy: copyText } = useClipboard();
  const busy = retrying ?? innerRetrying;

  const retry = async () => {
    if (!onRetry || busy) return;
    setInnerRetrying(true);
    try {
      await onRetry();
    } finally {
      setInnerRetrying(false);
    }
  };

  const copy = () => requestId && copyText(requestId);

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn('rounded-lg border border-destructive/30 bg-card p-5 shadow-sm', className)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive-chip-text">
          <Icon size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Heading id={`${id}-title`} className="text-[15px] font-semibold tracking-tight text-foreground">
              {title}
            </Heading>
            {code != null && (
              <span className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-destructive-chip-text">
                {code}
              </span>
            )}
          </div>
          {message != null && <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-muted-foreground">{message}</p>}
          {requestId && (
            <div className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <span>{labels?.requestId ?? t('error.requestId')}</span>
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11.5px] text-foreground">
                {requestId}
              </code>
              <IconButton
                icon={copied ? Check : Copy}
                label={
                  copied ? (labels?.copied ?? t('common.copied')) : (labels?.copyRequestId ?? t('error.copyRequestId'))
                }
                size="sm"
                variant="ghost"
                className="size-7"
                onClick={() => void copy()}
              />
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {onRetry && (
              <Button variant="secondary" size="sm" icon={RotateCw} loading={busy} onClick={() => void retry()}>
                {busy ? (labels?.retrying ?? t('error.retrying')) : retryLabel}
              </Button>
            )}
            {secondaryAction && (
              <Button
                size="sm"
                variant={secondaryAction.variant ?? 'ghost'}
                icon={secondaryAction.icon}
                disabled={secondaryAction.disabled}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
          {details && (
            <Collapsible className="mt-4">
              <CollapsibleTrigger className="text-[12.5px]">{labels?.details ?? t('error.details')}</CollapsibleTrigger>
              <CollapsiblePanel>
                <pre className="mt-2 max-h-60 overflow-auto rounded-md border border-border bg-muted/50 p-3 font-mono text-[11.5px] leading-5 whitespace-pre-wrap text-foreground">
                  {details}
                </pre>
              </CollapsiblePanel>
            </Collapsible>
          )}
          {announce && (
            <p role="status" className="sr-only">
              {busy
                ? (labels?.retryingStatus ?? t('error.retryingStatus'))
                : copied
                  ? (labels?.requestIdCopied ?? t('error.requestIdCopied'))
                  : ''}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

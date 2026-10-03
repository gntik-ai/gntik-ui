import { Check, Copy, RotateCw, ServerCrash } from '@gntik-ai/icons';
import type { LucideIcon } from '@gntik-ai/icons';
import { Button, Collapsible, CollapsiblePanel, CollapsibleTrigger, IconButton, cn } from '@gntik-ai/ui';
import { useId, useRef, useState, type ReactNode } from 'react';
import type { FeedbackAction } from '../types';

export interface ErrorPanelProps {
  icon?: LucideIcon;
  title?: ReactNode;
  /** Human summary of what failed and what to do. */
  message?: ReactNode;
  /** Status or error code shown as a mono chip (e.g. 503, ECONNRESET). */
  code?: string | number;
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
}

/** Error summary for a failed load or action: what happened, request id, retry and technical details. */
export function ErrorPanel({
  icon: Icon = ServerCrash,
  title = 'We couldn’t load deployments',
  message = 'The service didn’t respond in time. Your data is safe; try again in a moment.',
  code = 503,
  requestId = 'req_8f2c41d07a9b',
  details = 'GET /v1/projects/acme-web/deployments\n503 Service Unavailable\nupstream timed out after 30000 ms (pool: api-eu-west-1)',
  onRetry,
  retrying,
  retryLabel = 'Try again',
  secondaryAction = { label: 'Contact support', variant: 'ghost' },
  titleAs: Heading = 'h3',
  className,
}: ErrorPanelProps) {
  const id = useId();
  const [innerRetrying, setInnerRetrying] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
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

  const copy = async () => {
    if (!requestId) return;
    try {
      await navigator.clipboard.writeText(requestId);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section aria-labelledby={`${id}-title`} className={cn('rounded-lg border border-destructive/30 bg-card p-5 shadow-sm', className)}>
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
              <span className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-destructive-chip-text">{code}</span>
            )}
          </div>
          {message != null && <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-muted-foreground">{message}</p>}
          {requestId && (
            <div className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <span>Request ID</span>
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11.5px] text-foreground">{requestId}</code>
              <IconButton icon={copied ? Check : Copy} label={copied ? 'Copied' : 'Copy request ID'} size="sm" variant="ghost" className="size-7" onClick={() => void copy()} />
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {onRetry && (
              <Button variant="secondary" size="sm" icon={RotateCw} loading={busy} onClick={() => void retry()}>
                {busy ? 'Retrying…' : retryLabel}
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
              <CollapsibleTrigger className="text-[12.5px]">Technical details</CollapsibleTrigger>
              <CollapsiblePanel>
                <pre className="mt-2 max-h-60 overflow-auto rounded-md border border-border bg-muted/50 p-3 font-mono text-[11.5px] leading-5 whitespace-pre-wrap text-foreground">
                  {details}
                </pre>
              </CollapsiblePanel>
            </Collapsible>
          )}
          <p role="status" className="sr-only">
            {busy ? 'Retrying' : copied ? 'Request ID copied' : ''}
          </p>
        </div>
      </div>
    </section>
  );
}

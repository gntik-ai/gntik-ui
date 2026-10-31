import { Collapsible, CollapsiblePanel, CollapsibleTrigger, Spinner, StatusTag, cn } from '@gntik-ai/ui';
import { Ban, CircleAlert, Hand, Wrench } from 'lucide-react';
import { useState, type ReactNode, type Ref } from 'react';
import { useChatI18n, type ChatMessageKey } from '../utils/i18n';
import { formatDuration } from '../utils/format';
import { JsonView } from './JsonView';
import { ToolCallApproval } from './ToolCallApproval';
import { toolCallCardStyles as s } from './toolCallCard.variants';

export type ToolCallStatus = 'awaiting-approval' | 'running' | 'succeeded' | 'failed' | 'denied';

export interface ToolCallDecision {
  outcome: 'approved' | 'denied';
  reason?: string;
}

export interface ToolCallCardProps {
  /** Tool / function name, e.g. "search_invoices". */
  name: string;
  status: ToolCallStatus;
  /** Elapsed time in ms. */
  durationMs?: number;
  /** Arguments the model passed. */
  args?: unknown;
  /** What the tool returned. */
  result?: unknown;
  /** Error message for a failed call. */
  error?: string;
  /** Start expanded. Failed, denied and awaiting-approval calls open by default. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Report the decision; the caller controls status and handles errors. */
  onApprove?: () => void | Promise<void>;
  onDeny?: (reason?: string) => void | Promise<void>;
  /** Ask for an optional denial reason. Default true. */
  askDenyReason?: boolean;
  /** Use destructive tone and explicit Run {name} wording. */
  destructive?: boolean;
  approveLabel?: string;
  denyLabel?: string;
  /** Accessible name and visible prompt for the decision group. */
  approvalPrompt?: ReactNode;
  /** Decision supplied by the caller; this card never updates it. */
  decision?: ToolCallDecision;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

const VERB: Record<ToolCallStatus, ChatMessageKey> = {
  'awaiting-approval': 'toolCall.awaitingApproval',
  denied: 'toolCall.denied',
  running: 'toolCall.calling',
  succeeded: 'toolCall.called',
  failed: 'toolCall.failed',
};

/**
 * A tool invocation inside an assistant turn: name, status, duration, and a collapsible body
 * with the arguments and the result (or error) as small JSON views.
 */
export function ToolCallCard({
  name,
  status,
  durationMs,
  args,
  result,
  error,
  defaultOpen,
  open,
  onOpenChange,
  onApprove,
  onDeny,
  askDenyReason,
  destructive,
  approveLabel,
  denyLabel,
  approvalPrompt,
  decision,
  className,
  ref,
}: ToolCallCardProps) {
  const { t, tc } = useChatI18n();
  const awaiting = status === 'awaiting-approval';
  const [expanded, setExpanded] = useState(awaiting || (defaultOpen ?? (status === 'failed' || status === 'denied')));
  const [previousStatus, setPreviousStatus] = useState(status);
  const [announcement, setAnnouncement] = useState(awaiting ? tc('toolCall.approvalRequested', { name }) : '');
  if (previousStatus !== status) {
    setPreviousStatus(status);
    if (awaiting) {
      setExpanded(true);
      setAnnouncement(tc('toolCall.approvalRequested', { name }));
    } else {
      setAnnouncement('');
    }
  }
  const failed = status === 'failed';
  return (
    <Collapsible
      ref={ref}
      open={open ?? expanded}
      onOpenChange={(next) => {
        setExpanded(next);
        onOpenChange?.(next);
      }}
      data-status={status}
      className={cn(s.root, className)}
    >
      <CollapsibleTrigger className={s.trigger}>
        <span
          className={cn(
            s.icon,
            failed && s.iconFailed,
            awaiting && s.iconAwaiting,
            status === 'denied' && s.iconDenied,
          )}
        >
          {status === 'running' ? (
            <Spinner size={13} />
          ) : awaiting ? (
            <Hand size={13} aria-hidden />
          ) : status === 'denied' ? (
            <Ban size={13} aria-hidden />
          ) : failed ? (
            <CircleAlert size={13} aria-hidden />
          ) : (
            <Wrench size={13} aria-hidden />
          )}
        </span>
        <span className={s.label}>
          <span className={s.verb}>{tc(VERB[status])}</span>
          {(awaiting || status === 'denied') && ' '}
          <span className={s.name}>{name}</span>
        </span>
        <span className={s.meta}>
          {durationMs !== undefined && <span className={s.duration}>{formatDuration(durationMs)}</span>}
          <StatusTag
            status={status}
            size="sm"
            statuses={{
              'awaiting-approval': { label: tc('toolCall.statusAwaitingApproval'), tone: 'warning' },
              denied: { label: tc('toolCall.statusDenied'), tone: 'neutral' },
            }}
          />
        </span>
      </CollapsibleTrigger>
      <CollapsiblePanel className="pt-0">
        <div className={s.body}>
          {args !== undefined && <JsonView label={t('toolCall.arguments')} value={args} />}
          {failed && error && (
            <p role="alert" className={s.error}>
              {error}
            </p>
          )}
          {decision && (
            <p className={s.decision}>
              {decision.outcome === 'approved'
                ? tc('toolCall.approved')
                : decision.reason
                  ? tc('toolCall.deniedReason', { reason: decision.reason })
                  : tc('toolCall.statusDenied')}
            </p>
          )}
          {result !== undefined && <JsonView label={t('toolCall.result')} value={result} />}
          {status === 'running' && result === undefined && (
            <p className="text-[12.5px] text-muted-foreground">{t('toolCall.waiting')}</p>
          )}
        </div>
      </CollapsiblePanel>
      {awaiting && (
        <ToolCallApproval
          onApprove={onApprove}
          onDeny={onDeny}
          askDenyReason={askDenyReason}
          name={name}
          destructive={destructive}
          approveLabel={approveLabel}
          denyLabel={denyLabel}
          approvalPrompt={approvalPrompt}
        />
      )}
      {awaiting && (
        <span role="status" aria-live="polite" className="sr-only">
          {announcement}
        </span>
      )}
    </Collapsible>
  );
}

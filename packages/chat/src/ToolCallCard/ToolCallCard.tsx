import { Collapsible, CollapsiblePanel, CollapsibleTrigger, Spinner, StatusTag, cn } from '@gntik-ai/ui';
import { CircleAlert, Wrench } from 'lucide-react';
import type { Ref } from 'react';
import { formatDuration } from '../utils/format';
import { JsonView } from './JsonView';
import { toolCallCardStyles as s } from './toolCallCard.variants';

export type ToolCallStatus = 'running' | 'succeeded' | 'failed';

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
  /** Start expanded. Failed calls open by default. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

const VERB: Record<ToolCallStatus, string> = { running: 'Calling', succeeded: 'Called', failed: 'Failed to call' };

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
  className,
  ref,
}: ToolCallCardProps) {
  const failed = status === 'failed';
  return (
    <Collapsible
      ref={ref}
      defaultOpen={defaultOpen ?? failed}
      open={open}
      onOpenChange={onOpenChange ? (o) => onOpenChange(o) : undefined}
      data-status={status}
      className={cn(s.root, className)}
    >
      <CollapsibleTrigger className={s.trigger}>
        <span className={cn(s.icon, failed && s.iconFailed)}>
          {status === 'running' ? <Spinner size={13} /> : failed ? <CircleAlert size={13} aria-hidden /> : <Wrench size={13} aria-hidden />}
        </span>
        <span className={s.label}>
          <span className={s.verb}>{VERB[status]}</span>
          <span className={s.name}>{name}</span>
        </span>
        <span className={s.meta}>
          {durationMs !== undefined && <span className={s.duration}>{formatDuration(durationMs)}</span>}
          <StatusTag status={status} size="sm" />
        </span>
      </CollapsibleTrigger>
      <CollapsiblePanel className="pt-0">
        <div className={s.body}>
          {args !== undefined && <JsonView label="Arguments" value={args} />}
          {failed && error && (
            <p role="alert" className={s.error}>
              {error}
            </p>
          )}
          {result !== undefined && <JsonView label="Result" value={result} />}
          {status === 'running' && result === undefined && <p className="text-[12.5px] text-muted-foreground">Waiting for the result…</p>}
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}

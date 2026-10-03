import { Check, Copy, Pencil } from '@gntik-ai/icons';
import { Button, Card, CardAction, CardDescription, CardHeader, CardTitle, cn, IconButton, StatusTag } from '@gntik-ai/ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DEPLOYMENT_DETAILS } from './fixtures';

export interface DescriptionItem {
  id: string;
  label: string;
  /** Text value; also what the copy button copies unless `copyValue` is set. */
  value?: string;
  /** Rich value (overrides `value` for display). */
  render?: ReactNode;
  /** Shows the value as a StatusTag with this state key. */
  status?: string;
  /** Monospace value (IDs, regions, URLs). */
  mono?: boolean;
  /** Adds a copy button. */
  copyable?: boolean;
  copyValue?: string;
}

export interface DescriptionListCardProps {
  title?: string;
  description?: string;
  items?: readonly DescriptionItem[];
  /** Shows an Edit button in the header. */
  onEdit?: () => void;
  editLabel?: string;
  /** Called after a value is copied. */
  onCopy?: (item: DescriptionItem) => void;
  className?: string;
}

function CopyButton({ item, onCopy }: { item: DescriptionItem; onCopy?: (item: DescriptionItem) => void }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    const text = item.copyValue ?? item.value ?? '';
    try {
      await navigator.clipboard?.writeText(text);
    } catch {}
    setCopied(true);
    onCopy?.(item);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <>
      <IconButton
        icon={copied ? Check : Copy}
        label={copied ? `${item.label} copied` : `Copy ${item.label}`}
        size="sm"
        variant="ghost"
        className={cn('size-7 shrink-0', copied && 'text-success-text')}
        onClick={copy}
      />
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </>
  );
}

/** Key–value detail card: label column, values (mono, status or rich), copy buttons and an Edit action. */
export function DescriptionListCard({
  title = 'Configuration',
  description = 'Settings of this deployment.',
  items = DEPLOYMENT_DETAILS,
  onEdit,
  editLabel = 'Edit',
  onCopy,
  className,
}: DescriptionListCardProps) {
  return (
    <Card className={className}>
      <CardHeader divided>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {onEdit && (
          <CardAction>
            <Button variant="secondary" size="sm" icon={Pencil} onClick={onEdit}>
              {editLabel}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <dl className="divide-y divide-border px-5">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-[13px] text-muted-foreground">{item.label}</dt>
            <dd className="flex min-w-0 items-center gap-2 text-[13px] text-foreground">
              {item.status ? (
                <StatusTag status={item.status} />
              ) : (
                <span className={cn('min-w-0 truncate', item.mono && 'font-mono text-[12.5px]')}>{item.render ?? item.value}</span>
              )}
              {item.copyable && <CopyButton item={item} onCopy={onCopy} />}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

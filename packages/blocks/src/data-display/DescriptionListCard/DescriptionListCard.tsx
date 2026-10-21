import { Check, Copy, Pencil } from '@gntik-ai/icons';
import {
  Button,
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  IconButton,
  StatusTag,
  useI18n,
} from '@gntik-ai/ui';
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

export interface DescriptionListCardLabels {
  title: string;
  description: string;
  edit: string;
  copy: (label: string) => string;
  copied: (label: string) => string;
  copiedToClipboard: string;
}

export interface DescriptionListCardProps {
  /** Per-key copy overrides; explicit props take precedence, then labels, then the active catalog. */
  labels?: Partial<DescriptionListCardLabels>;
  title?: string;
  description?: string;
  items?: readonly DescriptionItem[];
  /** Shows an Edit button in the header. */
  onEdit?: () => void;
  editLabel?: string;
  /** Called after a value is copied. */
  onCopy?: (item: DescriptionItem) => void;
  /** Heading level of the title, to fit the page outline (default h3). */
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

function CopyButton({
  item,
  onCopy,
  labels,
}: {
  item: DescriptionItem;
  onCopy?: (item: DescriptionItem) => void;
  labels?: Partial<DescriptionListCardLabels>;
}) {
  const { t } = useI18n();
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
        label={
          copied
            ? (labels?.copied?.(item.label) ?? t('descriptionList.copied', { label: item.label }))
            : (labels?.copy?.(item.label) ?? t('descriptionList.copy', { label: item.label }))
        }
        size="sm"
        variant="ghost"
        className={cn('size-7 shrink-0', copied && 'text-success-text')}
        onClick={copy}
      />
      <span className="sr-only" aria-live="polite">
        {copied ? (labels?.copiedToClipboard ?? t('common.copiedToClipboard')) : ''}
      </span>
    </>
  );
}

/** Key–value detail card: label column, values (mono, status or rich), copy buttons and an Edit action. */
export function DescriptionListCard({
  title: titleProp,
  labels,
  description: descriptionProp,
  items = DEPLOYMENT_DETAILS,
  onEdit,
  editLabel: editLabelProp,
  onCopy,
  titleAs = 'h3',
  className,
}: DescriptionListCardProps) {
  const { t } = useI18n();
  const title = titleProp ?? labels?.title ?? t('descriptionList.title');
  const description = descriptionProp ?? labels?.description ?? t('descriptionList.description');
  const editLabel = editLabelProp ?? labels?.edit ?? t('descriptionList.edit');
  return (
    <Card className={className}>
      <CardHeader divided>
        <CardTitle as={titleAs}>{title}</CardTitle>
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
                <span className={cn('min-w-0 truncate', item.mono && 'font-mono text-[12.5px]')}>
                  {item.render ?? item.value}
                </span>
              )}
              {item.copyable && <CopyButton item={item} onCopy={onCopy} labels={labels} />}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

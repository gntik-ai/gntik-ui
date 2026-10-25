import { Check, Copy, Pencil, X } from '@gntik-ai/icons';
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
  useClipboard,
} from '@gntik-ai/ui';
import { type ReactNode } from 'react';
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
  copyFailed?: string;
}

export interface DescriptionListCardProps {
  /** Per-key copy overrides; explicit props take precedence, then labels, then the active catalog. */
  labels?: Partial<DescriptionListCardLabels>;
  title?: string;
  description?: string;
  items?: readonly DescriptionItem[];
  /** Wrap values, including long unbroken strings, instead of truncating (default false). */
  wrap?: boolean;
  /** Responsive columns; items fill top to bottom in contiguous groups (default 1). */
  columns?: 1 | 2 | 3;
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
  const { status, copied, copy: copyText } = useClipboard({ timeout: 1500, onCopy: () => onCopy?.(item) });
  const failedText = labels?.copyFailed ?? t('common.copyFailed');
  const copy = () => copyText(item.copyValue ?? item.value ?? '');
  return (
    <>
      <IconButton
        icon={status === 'failed' ? X : copied ? Check : Copy}
        label={
          status === 'failed'
            ? failedText
            : copied
              ? (labels?.copied?.(item.label) ?? t('descriptionList.copied', { label: item.label }))
              : (labels?.copy?.(item.label) ?? t('descriptionList.copy', { label: item.label }))
        }
        size="sm"
        variant="ghost"
        className={cn('size-7 shrink-0', copied && 'text-success-text')}
        onClick={copy}
      />
      <span className="sr-only" aria-live="polite">
        {status === 'failed' ? failedText : copied ? (labels?.copiedToClipboard ?? t('common.copiedToClipboard')) : ''}
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
  wrap = false,
  columns = 1,
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
  const renderItem = (item: DescriptionItem) => (
    <div
      key={item.id}
      className={cn('grid grid-cols-1 gap-1 py-3.5', columns === 1 && 'sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4')}
    >
      <dt className="text-[13px] text-muted-foreground">{item.label}</dt>
      <dd className="flex min-w-0 items-center gap-2 text-[13px] text-foreground">
        {item.status ? (
          <StatusTag status={item.status} />
        ) : (
          <span
            className={cn(wrap ? 'min-w-0 wrap-anywhere' : 'min-w-0 truncate', item.mono && 'font-mono text-[12.5px]')}
          >
            {item.render ?? item.value}
          </span>
        )}
        {item.copyable && <CopyButton item={item} onCopy={onCopy} labels={labels} />}
      </dd>
    </div>
  );
  const chunkSize = Math.ceil(items.length / columns);
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
      {columns === 1 ? (
        <dl className="divide-y divide-border px-5">{items.map(renderItem)}</dl>
      ) : (
        <div className={cn('grid grid-cols-1 gap-x-6 px-5', columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
          {Array.from({ length: columns }, (_, column) => (
            <dl key={column} className="min-w-0 divide-y divide-border">
              {items.slice(column * chunkSize, (column + 1) * chunkSize).map(renderItem)}
            </dl>
          ))}
        </div>
      )}
    </Card>
  );
}

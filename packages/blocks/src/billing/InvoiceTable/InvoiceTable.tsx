import { Badge, Button, Link, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, cn, type BadgeTone } from '@gntik-ai/ui';
import { Download } from '@gntik-ai/icons';
import { formatMoney, formatShortDate, type DateInput } from '../format';
import { sampleInvoices } from './fixtures';

export type InvoiceStatus = 'paid' | 'open' | 'overdue' | 'void' | 'draft';

export interface Invoice {
  id: string;
  /** Human invoice number, e.g. "INV-2026-0004". */
  number: string;
  /** Issue date. */
  date: DateInput;
  amount: number;
  /** ISO 4217 code. Default: the table's currency. */
  currency?: string;
  status: InvoiceStatus;
  /** PDF URL. Without it the download control calls `onDownload` only. */
  url?: string;
}

export interface InvoiceTableProps {
  invoices?: Invoice[];
  /** Table caption (screen-reader only unless `showCaption`). */
  caption?: string;
  showCaption?: boolean;
  currency?: string;
  /** Called when a download control is activated. */
  onDownload?: (invoice: Invoice) => void;
  /** Row density; omitted, it follows the surrounding DensityProvider. */
  density?: 'compact' | 'comfortable';
  className?: string;
}

const STATUS: Record<InvoiceStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: 'Paid', tone: 'success' },
  open: { label: 'Due', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'destructive' },
  void: { label: 'Void', tone: 'neutral' },
  draft: { label: 'Draft', tone: 'neutral' },
};

/** Invoice history: number, date, amount, status and a per-row PDF download. */
export function InvoiceTable({
  invoices = sampleInvoices,
  caption = 'Invoice history',
  showCaption = false,
  currency = 'USD',
  onDownload,
  density,
  className,
}: InvoiceTableProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}>
      <Table density={density}>
        <TableCaption srOnly={!showCaption}>{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="right">Amount</TableHead>
            <TableHead align="right">
              <span className="sr-only">Download</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => {
            const status = STATUS[inv.status];
            const label = `Download ${inv.number}`;
            return (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-[12.5px] font-medium text-foreground">{inv.number}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatShortDate(inv.date)}</TableCell>
                <TableCell>
                  <Badge tone={status.tone} dot>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell align="right" className="font-mono tabular-nums text-foreground">
                  {formatMoney(inv.amount, inv.currency ?? currency)}
                </TableCell>
                <TableCell align="right">
                  {inv.url ? (
                    <Link
                      href={inv.url}
                      download
                      aria-label={label}
                      onClick={() => onDownload?.(inv)}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
                    >
                      <Download size={14} aria-hidden />
                      PDF
                    </Link>
                  ) : onDownload && inv.status !== 'void' && inv.status !== 'draft' ? (
                    <Button variant="ghost" size="sm" icon={Download} aria-label={label} onClick={() => onDownload(inv)}>
                      PDF
                    </Button>
                  ) : (
                    <span className="text-[12px] text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

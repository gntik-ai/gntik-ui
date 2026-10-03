import { Badge } from '../../../components/Badge';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../../../components/Table';
import { Logo } from '../../../theme/Logo';
import { PageBreak, PrintLayout } from '../PrintLayout';

const LINES = [
  { item: 'Team plan · 12 seats', qty: '12', amount: 240 },
  { item: 'Compute · 1,840 vCPU-hours', qty: '1,840', amount: 92 },
  { item: 'Bandwidth · 420 GB', qty: '420', amount: 21 },
  { item: 'Log retention · 30 days', qty: '1', amount: 15 },
];

const money = (n: number) => `$${n.toFixed(2)}`;
const total = LINES.reduce((sum, l) => sum + l.amount, 0);

export default function PrintLayoutInvoice() {
  return (
    <div className="h-[560px] overflow-hidden rounded-lg border border-border">
      <PrintLayout
        aria-label="Invoice INV-2026-0042"
        pageRule={false}
        header={
          <>
            <div className="flex flex-col gap-2">
              <Logo size={26} wordmark />
              <p className="text-[11.5px] leading-snug text-muted-foreground">
                Example Cloud Ltd · 1 Market Street
                <br />
                billing@example.com
              </p>
            </div>
            <div className="text-right">
              <h1 className="text-[22px] font-semibold tracking-tight">Invoice</h1>
              <p className="font-mono text-[11.5px] text-muted-foreground">INV-2026-0042</p>
              <Badge tone="success" size="sm" className="mt-2">Paid</Badge>
            </div>
          </>
        }
        footer="Thank you for your business. Questions about this invoice: billing@example.com"
      >
        <dl className="mb-8 grid grid-cols-3 gap-4 text-[12px]">
          <div>
            <dt className="font-mono text-[10.5px] tracking-wide text-muted-foreground uppercase">Billed to</dt>
            <dd className="mt-1 font-medium">Acme Workspace</dd>
          </div>
          <div>
            <dt className="font-mono text-[10.5px] tracking-wide text-muted-foreground uppercase">Period</dt>
            <dd className="mt-1">1 – 30 Sep 2026</dd>
          </div>
          <div>
            <dt className="font-mono text-[10.5px] tracking-wide text-muted-foreground uppercase">Issued</dt>
            <dd className="mt-1">1 Oct 2026</dd>
          </div>
        </dl>
        <Table>
          <TableCaption srOnly>Invoice line items</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead align="right">Quantity</TableHead>
              <TableHead align="right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LINES.map((l) => (
              <TableRow key={l.item}>
                <TableCell>{l.item}</TableCell>
                <TableCell align="right" className="font-mono text-[12px]">{l.qty}</TableCell>
                <TableCell align="right" className="font-mono text-[12px]">{money(l.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-semibold">Total</TableCell>
              <TableCell align="right" className="font-mono text-[12.5px] font-semibold">{money(total)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <PageBreak />
        <h2 className="mb-2 text-[15px] font-semibold">Usage detail</h2>
        <p className="text-muted-foreground">Compute is billed per vCPU-hour across all deployments in the workspace, rounded to the nearest hour.</p>
      </PrintLayout>
    </div>
  );
}

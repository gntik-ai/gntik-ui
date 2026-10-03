import { useState } from 'react';
import { StatusTag } from '../../../components/StatusTag';
import { SplitLayout } from '../SplitLayout';

const STATUSES = {
  paid: { label: 'Paid', tone: 'success' },
  due: { label: 'Due', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'destructive' },
} as const;

const INVOICES = [
  { id: 'INV-2044', customer: 'Northbeam Labs', amount: '$4,210.00', status: 'paid', due: 'Oct 12' },
  { id: 'INV-2043', customer: 'Vega Robotics', amount: '$1,940.00', status: 'due', due: 'Oct 08' },
  { id: 'INV-2042', customer: 'Acme Industries', amount: '$862.50', status: 'paid', due: 'Oct 02' },
  { id: 'INV-2041', customer: 'Orbit Freight', amount: '$318.00', status: 'overdue', due: 'Sep 28' },
] as const;

export default function SplitLayoutInvoices() {
  const [selected, setSelected] = useState<string>(INVOICES[0].id);
  const [showDetail, setShowDetail] = useState(false);
  const invoice = INVOICES.find((i) => i.id === selected) ?? INVOICES[0];
  return (
    <div className="h-[460px] overflow-hidden rounded-lg border border-border">
      <SplitLayout
        listLabel="Invoices"
        detailLabel="Invoice details"
        showDetail={showDetail}
        onShowDetailChange={setShowDetail}
        listHeader={<h2 className="text-[13px] font-semibold">Invoices</h2>}
        detailHeader={<h2 className="font-mono text-[13px] font-semibold">{invoice.id}</h2>}
        list={
          <ul className="flex flex-col gap-0.5 p-2">
            {INVOICES.map((inv) => (
              <li key={inv.id}>
                <button
                  type="button"
                  aria-current={inv.id === selected ? 'true' : undefined}
                  onClick={() => {
                    setSelected(inv.id);
                    setShowDetail(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-[current=true]:bg-accent"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[12.5px] font-semibold">{inv.id}</span>
                    <span className="block truncate text-[12px] text-muted-foreground">{inv.customer}</span>
                  </span>
                  <span className="font-mono text-[12px]">{inv.amount}</span>
                </button>
              </li>
            ))}
          </ul>
        }
        detail={
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight">{invoice.amount}</span>
              <StatusTag status={invoice.status} statuses={STATUSES} />
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[13px]">
              <dt className="text-muted-foreground">Customer</dt>
              <dd>{invoice.customer}</dd>
              <dt className="text-muted-foreground">Due</dt>
              <dd>{invoice.due}</dd>
            </dl>
          </div>
        }
      />
    </div>
  );
}

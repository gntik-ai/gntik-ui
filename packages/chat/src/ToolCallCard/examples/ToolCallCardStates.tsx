import { ToolCallCard } from '../ToolCallCard';

export default function ToolCallCardStates() {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <ToolCallCard name="list_deployments" status="running" args={{ project: 'web-app', since: '2026-10-01' }} />
      <ToolCallCard
        name="search_invoices"
        status="succeeded"
        durationMs={840}
        defaultOpen
        args={{ month: '2026-09', status: 'unpaid' }}
        result={{ count: 2, total: { amount: 1840, currency: 'EUR' }, ids: ['INV-1042', 'INV-1047'] }}
      />
      <ToolCallCard
        name="invite_member"
        status="failed"
        durationMs={2310}
        args={{ email: 'alex@example.com', role: 'admin' }}
        error="Seat limit reached: the plan allows 20 members."
      />
    </div>
  );
}

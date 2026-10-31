import { useState } from 'react';
import { useChatI18n } from '../../utils/i18n';
import { ToolCallCard, type ToolCallDecision, type ToolCallStatus } from '../ToolCallCard';

function ApprovalExample({ destructive = false, immediate = false }: { destructive?: boolean; immediate?: boolean }) {
  const { t, tc } = useChatI18n();
  const [status, setStatus] = useState<ToolCallStatus>('awaiting-approval');
  const [decision, setDecision] = useState<ToolCallDecision>();
  const name = destructive ? 'delete_project' : 'read_project';
  return (
    <ToolCallCard
      name={name}
      status={status}
      args={{ id: 'p1' }}
      destructive={destructive}
      askDenyReason={!immediate}
      approveLabel={immediate ? t('common.yes') : undefined}
      denyLabel={immediate ? t('common.no') : undefined}
      approvalPrompt={immediate ? <strong>{tc('toolCall.approvalPrompt')}</strong> : undefined}
      open={immediate ? false : undefined}
      decision={decision}
      result={status === 'succeeded' ? { ok: true } : undefined}
      onApprove={async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, 800));
        setDecision({ outcome: 'approved' });
        setStatus('succeeded');
      }}
      onDeny={async (reason) => {
        await new Promise<void>((resolve) => setTimeout(resolve, 800));
        setDecision({ outcome: 'denied', reason });
        setStatus('denied');
      }}
    />
  );
}

export default function ToolCallCardStates() {
  const { tc } = useChatI18n();
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
      <ApprovalExample />
      <ApprovalExample destructive />
      <ApprovalExample immediate />
      <ToolCallCard
        name="delete_project"
        status="denied"
        args={{ id: 'p1' }}
        decision={{ outcome: 'denied', reason: tc('toolCall.exampleDenyReason') }}
      />
      <ToolCallCard
        name="read_project"
        status="succeeded"
        defaultOpen
        decision={{ outcome: 'approved' }}
        result={{ id: 'p1' }}
      />
    </div>
  );
}

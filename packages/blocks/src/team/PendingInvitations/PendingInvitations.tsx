import { Badge, Button, EmptyState, StatusTag, Timestamp, cn } from '@gntik-ai/ui';
import { Check, Mail, RotateCw, X } from '@gntik-ai/icons';
import { useId, useState, type ReactNode } from 'react';
import { invitations as defaultInvitations, type Invitation } from './fixtures';

export type { Invitation } from './fixtures';

export interface PendingInvitationsProps {
  invitations?: Invitation[];
  /** Resends one invitation. A returned promise shows a loading state. */
  onResend?: (invitation: Invitation) => void | Promise<void>;
  onRevoke?: (invitation: Invitation) => void;
  title?: ReactNode;
  headingLevel?: 'h2' | 'h3' | 'h4';
  className?: string;
}

/** Pending invitations with who sent them, expiry, and resend / revoke actions. */
export function PendingInvitations({
  invitations = defaultInvitations,
  onResend,
  onRevoke,
  title = 'Pending invitations',
  headingLevel: Heading = 'h2',
  className,
}: PendingInvitationsProps) {
  const id = useId();
  const [revoked, setRevoked] = useState<string[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [now] = useState(() => Date.now());
  const rows = invitations.filter((i) => !revoked.includes(i.id));

  const resend = async (inv: Invitation) => {
    setSending(inv.id);
    try {
      await onResend?.(inv);
      setSent((s) => [...s, inv.id]);
      setAnnouncement(`Invitation resent to ${inv.email}.`);
    } catch {
      setAnnouncement(`Could not resend the invitation to ${inv.email}.`);
    }
    setSending(null);
  };

  return (
    <section aria-labelledby={`${id}-title`} className={cn('rounded-lg border border-border bg-card shadow-sm', className)}>
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <Heading id={`${id}-title`} className="text-[14px] font-semibold tracking-tight text-foreground">
          {title}
        </Heading>
        <Badge size="sm">{rows.length}</Badge>
      </div>
      {rows.length === 0 ? (
        <EmptyState size="sm" icon={Mail} title="No pending invitations" description="Invitations you send appear here until they are accepted." className="mx-auto" />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((inv) => {
            const expired = inv.expiresAt != null && new Date(inv.expiresAt).getTime() < now;
            const wasSent = sent.includes(inv.id);
            return (
              <li key={inv.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                    <Mail size={16} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-foreground">{inv.email}</span>
                      <Badge size="sm">{inv.role}</Badge>
                      {expired && !wasSent && <StatusTag status="expired" label="Expired" statuses={{ expired: { label: 'Expired', tone: 'warning' } }} size="sm" />}
                    </div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">
                      {inv.invitedBy ? `Invited by ${inv.invitedBy} · ` : 'Invited '}
                      <Timestamp value={inv.invitedAt} tooltip={false} />
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 pl-12 sm:pl-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={wasSent ? Check : RotateCw}
                    loading={sending === inv.id}
                    disabled={wasSent}
                    aria-label={`Resend invitation to ${inv.email}`}
                    onClick={() => void resend(inv)}
                  >
                    {wasSent ? 'Sent' : 'Resend'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    aria-label={`Revoke invitation to ${inv.email}`}
                    onClick={() => {
                      setRevoked((r) => [...r, inv.id]);
                      setAnnouncement(`Invitation to ${inv.email} revoked.`);
                      onRevoke?.(inv);
                    }}
                  >
                    Revoke
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </section>
  );
}

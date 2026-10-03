import { AuthHeader } from '@gntik-ai/blocks';
import { Alert, AuthLayout, Avatar, Badge, Button, Link, Separator, Stack, Text } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import { sampleInvitation, type Invitation } from './data';

export interface AcceptInvitationPageProps {
  invitation: Invitation;
  /** Joins the workspace. A returned promise shows the loading state; a rejection shows in the alert. */
  onAccept: () => void | Promise<void>;
  /** Declines the invitation. */
  onDecline: () => void | Promise<void>;
  /** From the joined state. */
  onOpenWorkspace: () => void;
  switchAccountHref: string;
  logo: ReactNode;
}

type Outcome = 'pending' | 'accepted' | 'declined';

/** Card invitation: inviter, workspace, role → Join / Decline. */
export default function AcceptInvitationPage({
  invitation = sampleInvitation,
  onAccept,
  onDecline,
  onOpenWorkspace,
  switchAccountHref = '#switch-account',
  logo,
}: Partial<AcceptInvitationPageProps>) {
  const [outcome, setOutcome] = useState<Outcome>('pending');
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { workspace, role, roleDescription, memberCount, inviter, inviteeEmail, expiresIn } = invitation;

  const act = async (kind: 'accept' | 'decline') => {
    setError(null);
    setBusy(kind);
    try {
      await (kind === 'accept' ? onAccept?.() : onDecline?.());
      setOutcome(kind === 'accept' ? 'accepted' : 'declined');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    }
    setBusy(null);
  };

  const body =
    outcome === 'accepted' ? (
      <Stack gap={2}>
        <AuthHeader eyebrow="Invitation accepted" title={`Welcome to ${workspace}`} description={`You joined as ${role}. ${inviter.name} has been notified.`} />
        <Button size="lg" className="w-full" onClick={onOpenWorkspace}>
          Open workspace
        </Button>
      </Stack>
    ) : outcome === 'declined' ? (
      <AuthHeader
        className="mb-0"
        eyebrow="Invitation declined"
        title="No problem"
        description={`You declined the invitation to ${workspace}. ${inviter.name} can invite you again at any time.`}
      />
    ) : (
      <>
        <AuthHeader eyebrow="Invitation" title={`Join ${workspace}`} description={`${inviter.name} invited you to collaborate. This invitation expires in ${expiresIn}.`} />
        <Stack gap={5}>
          {error && <Alert tone="destructive" description={error} />}
          <Stack direction="row" align="center" gap={3}>
            <Avatar name={inviter.name} src={inviter.avatarUrl} size="md" aria-hidden />
            <Stack gap={0}>
              <Text variant="label">{inviter.name}</Text>
              <Text variant="caption">{inviter.email}</Text>
            </Stack>
          </Stack>
          <Separator />
          <Stack as="dl" gap={3}>
            <Stack direction="row" justify="between" align="center" gap={4}>
              <Text as="dt" variant="supporting" tone="muted">Workspace</Text>
              <Text as="dd" variant="label">{workspace}</Text>
            </Stack>
            <Stack direction="row" justify="between" align="center" gap={4}>
              <Text as="dt" variant="supporting" tone="muted">Role</Text>
              <Text as="dd" variant="label">
                <Badge tone="primary">{role}</Badge>
              </Text>
            </Stack>
            <Stack direction="row" justify="between" align="center" gap={4}>
              <Text as="dt" variant="supporting" tone="muted">Members</Text>
              <Text as="dd" variant="label">{memberCount}</Text>
            </Stack>
          </Stack>
          <Text variant="caption">{roleDescription}</Text>
          <Stack gap={2}>
            <Button size="lg" className="w-full" loading={busy === 'accept'} disabled={busy === 'decline'} onClick={() => void act('accept')}>
              Join {workspace}
            </Button>
            <Button variant="ghost" size="lg" className="w-full" loading={busy === 'decline'} disabled={busy === 'accept'} onClick={() => void act('decline')}>
              Decline
            </Button>
          </Stack>
        </Stack>
      </>
    );

  return (
    <AuthLayout
      fullScreen
      variant="card"
      logo={logo}
      skipLinkLabel="Skip to invitation"
      footer={
        <>
          Signed in as <span className="font-medium text-foreground">{inviteeEmail}</span>. <Link href={switchAccountHref}>Not you?</Link>
        </>
      }
    >
      {body}
      <span role="status" className="sr-only">
        {outcome === 'accepted' ? `You joined ${workspace}.` : outcome === 'declined' ? 'Invitation declined.' : ''}
      </span>
    </AuthLayout>
  );
}

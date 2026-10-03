import { InviteMembersDialog, MembersTable, PendingInvitations, type Invitation, type InvitePayload, type Member, type RoleOption } from '@gntik-ai/blocks';
import { Check, Minus, UserPlus } from '@gntik-ai/icons';
import { Section, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@gntik-ai/ui';
import { useState } from 'react';
import { SettingsFrame, type SettingsFrameOptions } from '../settings-profile/SettingsFrame';
import { invitations as defaultInvitations, members as defaultMembers, rolePermissions as defaultPermissions, roles as defaultRoles, type RolePermission } from './data';

export interface SettingsMembersProps extends SettingsFrameOptions {
  members: Member[];
  invitations: Invitation[];
  roles: RoleOption[];
  /** Rows of the role matrix. */
  permissions: RolePermission[];
  /** Id of the signed-in member. */
  currentUserId: string;
  /** Sends invitations. A rejection keeps the dialog open with its message. */
  onInvite: (payload: InvitePayload) => void | Promise<void>;
  onRoleChange: (memberId: string, role: string) => void;
  onRemove: (member: Member) => void;
  onResendInvitation: (invitation: Invitation) => void | Promise<void>;
  onRevokeInvitation: (invitation: Invitation) => void;
}

/** Members settings: MembersTable, PendingInvitations, InviteMembersDialog (header action), role matrix. */
export default function SettingsMembersPage({
  members = defaultMembers,
  invitations = defaultInvitations,
  roles = defaultRoles,
  permissions = defaultPermissions,
  currentUserId = 'u1',
  onInvite,
  onRoleChange,
  onRemove,
  onResendInvitation,
  onRevokeInvitation,
  ...frame
}: Partial<SettingsMembersProps>) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [sent, setSent] = useState<Invitation[]>([]);
  const roleLabel = (value: string) => roles.find((r) => r.value === value)?.label ?? value;

  const invite = async (payload: InvitePayload) => {
    await onInvite?.(payload);
    const now = new Date().toISOString();
    setSent((list) => [
      ...payload.emails.map((email, i) => ({ id: `new-${list.length + i}-${email}`, email, role: roleLabel(payload.role), invitedBy: 'You', invitedAt: now })),
      ...list,
    ]);
  };

  return (
    <SettingsFrame
      page="members"
      width="wide"
      description="Invite people to the workspace and manage what they can do."
      actions={[{ label: 'Invite members', icon: UserPlus, variant: 'primary', onClick: () => setInviteOpen(true) }]}
      {...frame}
    >
      <Section title="Members" description={`${members.length} people have access to this workspace.`}>
        <MembersTable members={members} roles={roles} currentUserId={currentUserId} onRoleChange={onRoleChange} onRemove={onRemove} />
      </Section>
      <PendingInvitations invitations={[...sent, ...invitations]} onResend={onResendInvitation} onRevoke={onRevokeInvitation} />
      <Section title="Roles" description="What each role can do. Owners can change any member's role.">
        <Table className="min-w-[560px]">
          <TableCaption srOnly>Permissions by role</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Permission</TableHead>
              {roles.map((r) => (
                <TableHead key={r.value} align="center">
                  {r.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((p) => (
              <TableRow key={p.id}>
                <TableHead scope="row" className="font-normal text-foreground">
                  {p.label}
                </TableHead>
                {roles.map((r) => {
                  const allowed = p.roles.includes(r.value);
                  const Glyph = allowed ? Check : Minus;
                  return (
                    <TableCell key={r.value} align="center">
                      <Glyph size={15} aria-hidden className={allowed ? 'mx-auto text-primary-text' : 'mx-auto text-muted-foreground'} />
                      <span className="sr-only">{allowed ? 'Allowed' : 'Not allowed'}</span>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
      <InviteMembersDialog trigger={null} open={inviteOpen} onOpenChange={setInviteOpen} roles={roles} onInvite={invite} />
    </SettingsFrame>
  );
}

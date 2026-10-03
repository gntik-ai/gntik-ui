'use client';
import { SettingsMembersPage } from '@gntik-ai/templates';
import { shellFor } from '../../../../data/console';
import { currentUserId, invitationsAt, membersAt } from '../../../../data/team';

export function MembersView({ now }: { now: number }) {
  return <SettingsMembersPage basePath="/settings" members={membersAt(now)} invitations={invitationsAt(now)} currentUserId={currentUserId} shell={shellFor('/settings/members')} />;
}

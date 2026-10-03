import { memberRoles, sampleInvitations, sampleMembers, type Invitation, type Member, type RoleOption } from '@gntik-ai/blocks';

export const members: Member[] = sampleMembers;
export const invitations: Invitation[] = sampleInvitations;
export const roles: RoleOption[] = memberRoles;

export interface RolePermission {
  id: string;
  label: string;
  /** Role values that have this permission. */
  roles: string[];
}

export const rolePermissions: RolePermission[] = [
  { id: 'view', label: 'View projects and deployments', roles: ['owner', 'admin', 'member', 'viewer'] },
  { id: 'deploy', label: 'Create and deploy projects', roles: ['owner', 'admin', 'member'] },
  { id: 'secrets', label: 'Manage environment secrets', roles: ['owner', 'admin'] },
  { id: 'members', label: 'Invite and remove members', roles: ['owner', 'admin'] },
  { id: 'billing', label: 'Manage billing and plans', roles: ['owner'] },
  { id: 'delete', label: 'Delete the workspace', roles: ['owner'] },
];

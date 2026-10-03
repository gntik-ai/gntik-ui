import { useState } from 'react';
import { PermissionMatrix, type PermissionMatrixValue, type PermissionRole, type PermissionSection } from '../PermissionMatrix';

const roles: PermissionRole[] = [
  { id: 'owner', label: 'Owner', readOnly: true, readOnlyReason: 'Owners always have every permission.' },
  { id: 'admin', label: 'Admin' },
  { id: 'member', label: 'Member' },
  { id: 'viewer', label: 'Viewer', description: 'Inherits from Member' },
];

const sections: PermissionSection[] = [
  {
    id: 'projects',
    label: 'Projects',
    permissions: [
      { id: 'projects.read', label: 'View projects' },
      { id: 'projects.write', label: 'Edit projects', description: 'Rename, archive and change settings' },
      { id: 'projects.delete', label: 'Delete projects' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    permissions: [
      { id: 'billing.read', label: 'View invoices' },
      { id: 'billing.manage', label: 'Manage payment methods' },
    ],
  },
];

const all = (state: 'allowed' | 'denied') => Object.fromEntries(sections.flatMap((s) => s.permissions.map((p) => [p.id, state])));

const initial: PermissionMatrixValue = {
  owner: all('allowed'),
  admin: { 'projects.read': 'allowed', 'projects.write': 'allowed', 'projects.delete': 'allowed', 'billing.read': 'allowed', 'billing.manage': 'denied' },
  member: { 'projects.read': 'allowed', 'projects.write': 'allowed', 'projects.delete': 'denied', 'billing.read': 'denied', 'billing.manage': 'denied' },
  viewer: { 'projects.write': 'denied' },
};

export default function PermissionMatrixBasic() {
  const [value, setValue] = useState(initial);
  return (
    <PermissionMatrix
      caption="Workspace roles"
      roles={roles}
      sections={sections}
      value={value}
      onChange={setValue}
      resolveInherited={(roleId, permissionId) => (roleId === 'viewer' ? (value.member?.[permissionId] === 'denied' ? 'denied' : 'allowed') : undefined)}
      getDisabledReason={(roleId, permissionId) => (roleId === 'member' && permissionId === 'billing.manage' ? 'Only admins can manage payment methods.' : undefined)}
    />
  );
}

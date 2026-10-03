export interface RoleOption {
  value: string;
  label: string;
  description?: string;
}

export const memberRoles: RoleOption[] = [
  { value: 'owner', label: 'Owner', description: 'Full access, including billing and deletion.' },
  { value: 'admin', label: 'Admin', description: 'Manage members, projects and settings.' },
  { value: 'member', label: 'Member', description: 'Create and deploy projects.' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access.' },
];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

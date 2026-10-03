import type { InlineEditField } from './InlineEditRow';

export interface EditableMember {
  id: string;
  name: string;
  email: string;
  role: string;
  seats: number;
}

export const EDITABLE_MEMBER_FIELDS: InlineEditField<EditableMember>[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true, className: 'font-mono text-[12px] text-muted-foreground' },
  { key: 'role', label: 'Role' },
  { key: 'seats', label: 'Seats', type: 'number', align: 'right', className: 'font-mono text-[12.5px]' },
];

export const EDITABLE_MEMBERS: EditableMember[] = [
  { id: 'm1', name: 'Ana Lopez', email: 'ana@example.com', role: 'Owner', seats: 3 },
  { id: 'm2', name: 'Sam Carter', email: 'sam@example.com', role: 'Admin', seats: 2 },
  { id: 'm3', name: 'Priya Nair', email: 'priya@example.com', role: 'Member', seats: 1 },
];

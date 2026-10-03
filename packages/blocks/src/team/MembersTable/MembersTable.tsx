import {
  Avatar,
  Badge,
  MoreMenu,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Timestamp,
  cn,
} from '@gntik-ai/ui';
import { Mail, UserMinus } from '@gntik-ai/icons';
import { useState } from 'react';
import { memberRoles, type RoleOption } from '../../forms/InviteMembersDialog/fixtures';
import { members as defaultMembers, type Member } from './fixtures';

export type { Member } from './fixtures';

export interface MembersTableProps {
  members?: Member[];
  roles?: RoleOption[];
  /** Id of the signed-in member: shown with a "You" badge, and their role and removal are locked. */
  currentUserId?: string;
  onRoleChange?: (memberId: string, role: string) => void;
  onRemove?: (member: Member) => void;
  onEmail?: (member: Member) => void;
  /** Table caption (screen-reader only by default). */
  caption?: string;
  className?: string;
}

/** Workspace members: avatar, name and email, inline role select, last activity and a row menu. */
export function MembersTable({
  members = defaultMembers,
  roles = memberRoles,
  currentUserId = 'u1',
  onRoleChange,
  onRemove,
  onEmail,
  caption = 'Workspace members',
  className,
}: MembersTableProps) {
  const [roleOverrides, setRoleOverrides] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<string[]>([]);
  const rows = members.filter((m) => !removed.includes(m.id));
  const items = roles.map(({ value, label }) => ({ value, label }));

  return (
    <Table className={cn('min-w-[560px]', className)}>
      <TableCaption srOnly>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead className="w-44">Role</TableHead>
          <TableHead className="hidden sm:table-cell">Last active</TableHead>
          <TableHead align="right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((m) => {
          const you = m.id === currentUserId;
          const role = roleOverrides[m.id] ?? m.role;
          return (
            <TableRow key={m.id}>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar size="sm" name={m.name} src={m.avatarUrl} aria-hidden />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-foreground">{m.name}</span>
                      {you && (
                        <Badge size="sm" tone="primary">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="truncate text-[12px] text-muted-foreground">{m.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={role}
                  items={items}
                  disabled={you}
                  onValueChange={(v) => {
                    if (v == null) return;
                    setRoleOverrides((o) => ({ ...o, [m.id]: v }));
                    onRoleChange?.(m.id, v);
                  }}
                >
                  <SelectTrigger size="sm" aria-label={`Role for ${m.name}`} className="w-full" />
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="hidden text-[12.5px] text-muted-foreground sm:table-cell">
                {m.lastActive ? <Timestamp value={m.lastActive} /> : 'Never'}
              </TableCell>
              <TableCell align="right">
                <MoreMenu
                  label={`Actions for ${m.name}`}
                  variant="ghost"
                  size="sm"
                  items={[
                    { label: 'Send email', icon: Mail, onSelect: () => onEmail?.(m) },
                    'separator',
                    {
                      label: 'Remove from workspace',
                      icon: UserMinus,
                      destructive: true,
                      disabled: you,
                      onSelect: () => {
                        setRemoved((r) => [...r, m.id]);
                        onRemove?.(m);
                      },
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

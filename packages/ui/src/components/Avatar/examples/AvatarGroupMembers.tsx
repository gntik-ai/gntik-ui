import { Avatar, AvatarGroup } from '../Avatar';

const MEMBERS = [
  { name: 'Maria Ruiz', tone: 'primary' },
  { name: 'Jordan Lee', tone: 'violet' },
  { name: 'Sam King', tone: 'cyan' },
  { name: 'Ana Torres', tone: 'rose' },
  { name: 'Val Gomez', tone: 'amber' },
  { name: 'Dev Nair', tone: 'accent' },
  { name: 'Priya Shah', tone: 'secondary' },
] as const;

export default function AvatarGroupMembers() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <AvatarGroup label="Project members" max={4}>
        {MEMBERS.map((m) => <Avatar key={m.name} name={m.name} tone={m.tone} />)}
      </AvatarGroup>
      <AvatarGroup label="Reviewers" size="sm" max={5}>
        {MEMBERS.map((m) => <Avatar key={m.name} name={m.name} tone={m.tone} />)}
      </AvatarGroup>
    </div>
  );
}

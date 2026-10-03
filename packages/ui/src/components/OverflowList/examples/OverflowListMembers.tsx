import { Avatar } from '../../Avatar';
import { OverflowList } from '../OverflowList';

const MEMBERS = [
  { name: 'Maria Ruiz', tone: 'primary' },
  { name: 'Jonas Berg', tone: 'violet' },
  { name: 'Aiko Tanaka', tone: 'cyan' },
  { name: 'Samir Haddad', tone: 'amber' },
  { name: 'Lena Novak', tone: 'rose' },
  { name: 'Diego Alves', tone: 'secondary' },
  { name: 'Priya Shah', tone: 'violet' },
] as const;

export default function OverflowListMembers() {
  return (
    <OverflowList
      variant="avatar"
      label="Project members"
      items={MEMBERS}
      max={4}
      getKey={(m) => m.name}
      renderItem={(m) => <Avatar name={m.name} tone={m.tone} size="sm" className="rounded-full ring-2 ring-card" />}
      renderOverflowItem={(m) => (
        <>
          <Avatar tone={m.tone} size="xs" initials={m.name.split(' ').map((p) => p[0]).join('')} />
          <span>{m.name}</span>
        </>
      )}
    />
  );
}

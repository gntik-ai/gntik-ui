const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  /** ISO date of the last activity; null when the member never signed in. */
  lastActive: string | null;
}

export const members: Member[] = [
  { id: 'u1', name: 'Avery Collins', email: 'avery@example.com', role: 'owner', lastActive: ago(2) },
  { id: 'u2', name: 'Sam Rivera', email: 'sam@example.com', role: 'admin', lastActive: ago(95) },
  { id: 'u3', name: 'Jordan Lee', email: 'jordan@example.com', role: 'member', lastActive: ago(60 * 26) },
  { id: 'u4', name: 'Riley Chen', email: 'riley@example.com', role: 'member', lastActive: ago(60 * 24 * 9) },
  { id: 'u5', name: 'Morgan Patel', email: 'morgan@example.com', role: 'viewer', lastActive: null },
];

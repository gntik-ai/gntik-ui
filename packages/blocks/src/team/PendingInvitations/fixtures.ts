const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

export interface Invitation {
  id: string;
  email: string;
  role: string;
  invitedBy?: string;
  /** ISO date the invitation was sent. */
  invitedAt: string;
  /** ISO date it expires. */
  expiresAt?: string;
}

export const invitations: Invitation[] = [
  { id: 'i1', email: 'taylor@example.com', role: 'Member', invitedBy: 'Avery Collins', invitedAt: daysFromNow(-1), expiresAt: daysFromNow(6) },
  { id: 'i2', email: 'casey@example.com', role: 'Admin', invitedBy: 'Sam Rivera', invitedAt: daysFromNow(-4), expiresAt: daysFromNow(3) },
  { id: 'i3', email: 'drew@example.com', role: 'Viewer', invitedBy: 'Avery Collins', invitedAt: daysFromNow(-9), expiresAt: daysFromNow(-2) },
];

/** Sample invitation: who invited whom, to which workspace and with what role. */
export interface Invitation {
  workspace: string;
  role: string;
  /** What the role can do, in one line. */
  roleDescription: string;
  memberCount: number;
  inviter: { name: string; email: string; avatarUrl?: string };
  /** Signed-in (or invited) email. */
  inviteeEmail: string;
  expiresIn: string;
}

export const sampleInvitation: Invitation = {
  workspace: 'Acme Industries',
  role: 'Developer',
  roleDescription: 'Create projects, deploy to staging and view usage.',
  memberCount: 24,
  inviter: { name: 'Priya Raman', email: 'priya@acme.example' },
  inviteeEmail: 'dana@example.com',
  expiresIn: '6 days',
};

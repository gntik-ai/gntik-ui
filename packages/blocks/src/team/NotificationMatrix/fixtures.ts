export interface NotificationChannel {
  id: string;
  label: string;
}

export interface NotificationEvent {
  id: string;
  label: string;
  description?: string;
  /** Channels that are always on for this event (shown checked and disabled). */
  locked?: string[];
}

export type NotificationMatrixValue = Record<string, string[]>;

export const notificationChannels: NotificationChannel[] = [
  { id: 'email', label: 'Email' },
  { id: 'in-app', label: 'In-app' },
  { id: 'push', label: 'Push' },
];

export const notificationEvents: NotificationEvent[] = [
  { id: 'deploy-failed', label: 'Deployment failed', description: 'A deployment you own fails or is rolled back.' },
  { id: 'deploy-succeeded', label: 'Deployment succeeded', description: 'A deployment you started goes live.' },
  { id: 'mentions', label: 'Mentions', description: 'Someone mentions you in a comment or review.' },
  { id: 'member-joined', label: 'Member joined', description: 'Someone accepts an invitation to the workspace.' },
  { id: 'usage', label: 'Usage threshold', description: 'Usage reaches 80% or 100% of a quota.' },
  { id: 'security', label: 'Security alerts', description: 'New sign-ins and changes to keys or roles.', locked: ['email'] },
];

export const notificationDefaults: NotificationMatrixValue = {
  'deploy-failed': ['email', 'in-app', 'push'],
  'deploy-succeeded': ['in-app'],
  mentions: ['email', 'in-app'],
  'member-joined': [],
  usage: ['email'],
  security: ['email', 'in-app'],
};

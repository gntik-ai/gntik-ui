export interface DangerZoneAction {
  id: string;
  title: string;
  description: string;
  /** Label of the row button and of the confirming button. */
  actionLabel: string;
  /** Text the user must type to confirm (e.g. the resource name). Omit for a plain confirmation. */
  confirmText?: string;
  /** Use the destructive button style in the row (default true); `false` renders a secondary button. */
  destructive?: boolean;
}

export const dangerZoneActions: DangerZoneAction[] = [
  {
    id: 'transfer',
    title: 'Transfer project',
    description: 'Move this project and its deployments to another workspace you administer.',
    actionLabel: 'Transfer',
    destructive: false,
  },
  {
    id: 'archive',
    title: 'Archive project',
    description: 'Stops every deployment and makes the project read-only. You can restore it later.',
    actionLabel: 'Archive',
    confirmText: 'billing-dashboard',
  },
  {
    id: 'delete',
    title: 'Delete project',
    description: 'Permanently deletes billing-dashboard, its deployments, secrets and audit log. This cannot be undone.',
    actionLabel: 'Delete project',
    confirmText: 'billing-dashboard',
  },
];

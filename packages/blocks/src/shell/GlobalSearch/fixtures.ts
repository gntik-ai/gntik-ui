import { BarChart3, CreditCard, FileText, FolderKanban, FolderPlus, Home, Rocket, Settings, UserPlus, Users } from '@gntik-ai/icons';
import type { CommandItem } from '@gntik-ai/ui';

export const globalSearchPages: CommandItem[] = [
  { id: 'page-overview', label: 'Overview', icon: Home, shortcut: ['G', 'O'] },
  { id: 'page-projects', label: 'Projects', icon: FolderKanban, shortcut: ['G', 'P'] },
  { id: 'page-deployments', label: 'Deployments', icon: Rocket },
  { id: 'page-analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'page-members', label: 'Members', icon: Users, keywords: ['team', 'people'] },
  { id: 'page-billing', label: 'Billing', icon: CreditCard, keywords: ['invoices', 'plan'] },
  { id: 'page-settings', label: 'Settings', icon: Settings, shortcut: ['⌘', ','] },
];

export const globalSearchRecords: CommandItem[] = [
  { id: 'record-web-frontend', label: 'web-frontend', icon: FolderKanban, mono: true, description: 'Project · eu-west' },
  { id: 'record-billing-api', label: 'billing-api', icon: FolderKanban, mono: true, description: 'Project · us-east' },
  { id: 'record-inv-2041', label: 'INV-2041', icon: FileText, mono: true, description: 'Invoice · Orbit Freight · overdue' },
  { id: 'record-dana', label: 'Dana Whitfield', icon: Users, description: 'Member · Owner', keywords: ['dana@example.com'] },
];

export const globalSearchActions: CommandItem[] = [
  { id: 'action-new-project', label: 'Create project', icon: FolderPlus, shortcut: ['⌘', 'N'], keywords: ['new'] },
  { id: 'action-deploy', label: 'Deploy to production', icon: Rocket, description: 'Promote the latest build of the current project' },
  { id: 'action-invite', label: 'Invite member', icon: UserPlus, keywords: ['team', 'people'] },
];

export const globalSearchRecent: CommandItem[] = [
  { id: 'recent-web-frontend', label: 'web-frontend', icon: FolderKanban, mono: true, description: 'Project' },
  { id: 'recent-billing', label: 'Billing', icon: CreditCard, description: 'Page' },
];

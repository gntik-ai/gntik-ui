import { BookOpen, Code2, LifeBuoy, PlayCircle, type LucideIcon } from '@gntik-ai/icons';
import type { BreadcrumbItem } from '@gntik-ai/ui';

export interface SetupTask {
  id: string;
  title: string;
  description: string;
}

export interface DocLink {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const startBreadcrumbs: BreadcrumbItem[] = [{ label: 'Overview', href: '/overview' }, { label: 'Get started' }];

export const setupTasks: SetupTask[] = [
  { id: 'workspace', title: 'Create your workspace', description: 'Name it and pick the region where your data lives.' },
  { id: 'project', title: 'Create a project', description: 'Import a repository or start from a template.' },
  { id: 'deploy', title: 'Ship your first deployment', description: 'Push to the main branch or deploy from the console.' },
  { id: 'invite', title: 'Invite your team', description: 'Add teammates and choose what each of them can do.' },
  { id: 'billing', title: 'Add a payment method', description: 'Needed before you go over the free plan limits.' },
];

export const setupInitialDone: string[] = ['workspace', 'project'];

export const docLinks: DocLink[] = [
  { id: 'quickstart', title: 'Quickstart', description: 'Deploy a sample service in five minutes.', href: '#quickstart', icon: PlayCircle },
  { id: 'concepts', title: 'Core concepts', description: 'Workspaces, projects, environments and deployments.', href: '#concepts', icon: BookOpen },
  { id: 'api', title: 'API reference', description: 'Automate everything you can do in the console.', href: '#api', icon: Code2 },
  { id: 'support', title: 'Get help', description: 'Guides, community forum and support.', href: '#support', icon: LifeBuoy },
];

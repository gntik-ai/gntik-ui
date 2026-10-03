import type { DangerZoneAction } from '@gntik-ai/blocks';

export interface WorkspaceValues {
  name: string;
  slug: string;
  region: string;
}

export interface RegionOption {
  value: string;
  label: string;
}

export const workspaceValues: WorkspaceValues = {
  name: 'Northwind Labs',
  slug: 'northwind-labs',
  region: 'eu-west',
};

export const regions: RegionOption[] = [
  { value: 'eu-west', label: 'EU West · Frankfurt' },
  { value: 'us-east', label: 'US East · Virginia' },
  { value: 'us-west', label: 'US West · Oregon' },
  { value: 'ap-south', label: 'AP South · Singapore' },
];

export const workspaceDangerActions = (slug: string): DangerZoneAction[] => [
  {
    id: 'transfer',
    title: 'Transfer ownership',
    description: 'Make another admin the owner of this workspace. You stay on as an admin.',
    actionLabel: 'Transfer',
    destructive: false,
  },
  {
    id: 'delete',
    title: 'Delete workspace',
    description: `Permanently deletes ${slug}, its projects, members and billing history. This cannot be undone.`,
    actionLabel: 'Delete workspace',
    confirmText: slug,
  },
];

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

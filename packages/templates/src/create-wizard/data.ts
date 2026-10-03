import { Code2, GitBranch, LayoutTemplate, type LucideIcon } from '@gntik-ai/icons';
import type { StepItem } from '@gntik-ai/ui';

export interface WizardValues {
  name: string;
  description: string;
  source: string;
  region: string;
  previews: boolean;
}

export interface SourceOption {
  value: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface WizardRegion {
  value: string;
  label: string;
}

export const wizardSteps: StepItem[] = [
  { id: 'details', label: 'Details' },
  { id: 'source', label: 'Source' },
  { id: 'configure', label: 'Configure' },
  { id: 'review', label: 'Review' },
];

export const wizardSources: SourceOption[] = [
  { value: 'repository', title: 'Import a repository', description: 'Build and deploy from a Git branch on every push.', icon: GitBranch },
  { value: 'template', title: 'Start from a template', description: 'A ready-made service you can change later.', icon: LayoutTemplate },
  { value: 'empty', title: 'Empty project', description: 'No code yet; connect a source when you are ready.', icon: Code2 },
];

export const wizardRegions: WizardRegion[] = [
  { value: 'eu-west-1', label: 'EU West · Ireland' },
  { value: 'eu-central-1', label: 'EU Central · Frankfurt' },
  { value: 'us-east-1', label: 'US East · Virginia' },
  { value: 'ap-south-1', label: 'Asia Pacific · Mumbai' },
];

export const wizardInitialValues: WizardValues = {
  name: '',
  description: '',
  source: 'repository',
  region: 'eu-west-1',
  previews: true,
};

export const PROJECT_NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

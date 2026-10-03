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

/** Every visible string of the wizard; products override any subset through the `copy` prop. */
export interface CreateWizardCopy {
  detailsTitle: string;
  detailsIntro: string;
  nameLabel: string;
  namePlaceholder: string;
  nameHint: string;
  nameRequired: string;
  nameInvalid: string;
  descriptionLabel: string;
  sourceTitle: string;
  sourceIntro: string;
  configureTitle: string;
  configureIntro: string;
  regionLabel: string;
  previewsLabel: string;
  previewsDescription: string;
  reviewTitle: string;
  reviewIntro: string;
  summaryHeading: string;
  reviewDetailsTitle: string;
  reviewDetailsDescription: string;
  editDetailsLabel: string;
  reviewSourceTitle: string;
  reviewSourceDescription: string;
  editSourceLabel: string;
  sourceLabel: string;
  on: string;
  off: string;
  /** Submit button on the review step. */
  submitLabel: string;
  exitTitle: string;
  exitDescription: string;
  /** Live status after a successful finish. */
  created: (name: string) => string;
}

export const wizardCopy: CreateWizardCopy = {
  detailsTitle: 'Project details',
  detailsIntro: 'Name the project; you can change the description later.',
  nameLabel: 'Project name',
  namePlaceholder: 'billing-dashboard',
  nameHint: 'Lowercase letters, numbers and dashes.',
  nameRequired: 'Enter a project name.',
  nameInvalid: 'Use lowercase letters, numbers and dashes.',
  descriptionLabel: 'Description',
  sourceTitle: 'Choose a source',
  sourceIntro: 'Where the project’s code comes from.',
  configureTitle: 'Configure',
  configureIntro: 'Region and deployment defaults.',
  regionLabel: 'Region',
  previewsLabel: 'Preview deployments',
  previewsDescription: 'Deploy every pull request to its own URL.',
  reviewTitle: 'Review and create',
  reviewIntro: 'Check your answers; edit any section before creating the project.',
  summaryHeading: 'Summary',
  reviewDetailsTitle: 'Details',
  reviewDetailsDescription: 'Name and description.',
  editDetailsLabel: 'Edit details',
  reviewSourceTitle: 'Source and configuration',
  reviewSourceDescription: 'Where the code comes from and where it runs.',
  editSourceLabel: 'Edit source',
  sourceLabel: 'Source',
  on: 'On',
  off: 'Off',
  submitLabel: 'Create project',
  exitTitle: 'Leave project setup?',
  exitDescription: 'The project has not been created yet. Your answers will be discarded.',
  created: (name) => `Project “${name}” created`,
};

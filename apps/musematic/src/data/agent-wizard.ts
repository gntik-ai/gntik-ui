import { FileCode2, LayoutTemplate, PenLine } from '@gntik-ai/icons';
import type { StepItem } from '@gntik-ai/ui';

export const agentSteps: StepItem[] = [
  { id: 'details', label: 'Details' },
  { id: 'source', label: 'Starting point' },
  { id: 'configure', label: 'Deployment' },
  { id: 'review', label: 'Review' },
];

export const agentSources = [
  { value: 'template', title: 'Start from a template', description: 'Support triage, research, code review… ready to adapt.', icon: LayoutTemplate },
  { value: 'blank', title: 'Blank prompt', description: 'Write the system prompt and pick tools yourself.', icon: PenLine },
  { value: 'import', title: 'Import an agent spec', description: 'Bring an agent.yaml from another workspace or repo.', icon: FileCode2 },
];

export const agentRegions = [
  { value: 'eu-west-1', label: 'EU West · Ireland' },
  { value: 'eu-central-1', label: 'EU Central · Frankfurt' },
  { value: 'us-east-1', label: 'US East · Virginia' },
  { value: 'ap-south-1', label: 'Asia Pacific · Mumbai' },
];

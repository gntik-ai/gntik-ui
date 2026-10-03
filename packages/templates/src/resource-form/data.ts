import type { ValidationIssue } from '@gntik-ai/blocks';
import type { BreadcrumbItem } from '@gntik-ai/ui';

export interface ResourceFormValues {
  name: string;
  description: string;
  region: string;
  billingEmail: string;
  sendInvoices: boolean;
}

export interface RegionOption {
  value: string;
  label: string;
}

export const formBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Projects', href: '/projects' },
  { label: 'billing-dashboard', href: '#billing-dashboard', mono: true },
  { label: 'Edit' },
];

export const formRegions: RegionOption[] = [
  { value: 'eu-west-1', label: 'EU West · Ireland' },
  { value: 'eu-central-1', label: 'EU Central · Frankfurt' },
  { value: 'us-east-1', label: 'US East · Virginia' },
  { value: 'ap-south-1', label: 'Asia Pacific · Mumbai' },
];

/** The saved project being edited. */
export const formInitialValues: ResourceFormValues = {
  name: 'billing-dashboard',
  description: 'Usage and invoice reporting for every workspace.',
  region: 'eu-west-1',
  billingEmail: 'billing@example.com',
  sendInvoices: true,
};

/** Ids of the controls, the targets of the ValidationSummary links. */
export const FIELD_IDS = { name: 'project-name', region: 'region', billingEmail: 'billing-email' } as const;

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates the form; the order matches the visual order of the fields. */
export function validateResourceForm(v: ResourceFormValues): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!v.name.trim()) issues.push({ fieldId: FIELD_IDS.name, label: 'Project name', message: 'Enter a project name.' });
  else if (!NAME_RE.test(v.name)) issues.push({ fieldId: FIELD_IDS.name, label: 'Project name', message: 'Use lowercase letters, numbers and dashes.' });
  if (!v.region) issues.push({ fieldId: FIELD_IDS.region, label: 'Region', message: 'Choose a region.' });
  if (!EMAIL_RE.test(v.billingEmail)) issues.push({ fieldId: FIELD_IDS.billingEmail, label: 'Billing email', message: 'Enter a valid email address, like name@company.com.' });
  return issues;
}

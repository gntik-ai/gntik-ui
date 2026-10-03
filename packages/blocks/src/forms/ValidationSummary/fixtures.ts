export interface ValidationIssue {
  /** Id of the control to focus (the link target). */
  fieldId: string;
  /** Field name shown before the message. */
  label?: string;
  message: string;
}

export const validationIssues: ValidationIssue[] = [
  { fieldId: 'project-name', label: 'Project name', message: 'Enter a project name.' },
  { fieldId: 'billing-email', label: 'Billing email', message: 'Enter a valid email address, like name@company.com.' },
  { fieldId: 'region', label: 'Region', message: 'Choose a region.' },
];

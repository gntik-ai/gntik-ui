import { buttons } from './buttons';
import { chart } from './chart';
import { dashboard } from './dashboard';
import { form } from './form';
import { template } from './template';

export interface SandboxExample {
  id: string;
  label: string;
  code: string;
}

/** The gallery, in menu order. The first one seeds a fresh sandbox. */
export const EXAMPLES: readonly [SandboxExample, ...SandboxExample[]] = [
  { id: 'buttons', label: 'Button variants', code: buttons },
  { id: 'form', label: 'Form', code: form },
  { id: 'dashboard', label: 'KPI dashboard (blocks)', code: dashboard },
  { id: 'template', label: 'Template page', code: template },
  { id: 'chart', label: 'Chart', code: chart },
];

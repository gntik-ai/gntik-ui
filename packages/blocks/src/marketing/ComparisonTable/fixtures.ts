import type { ComparisonPlan, ComparisonSection } from './ComparisonTable';

/** Three sample plans (generic, product-agnostic). */
export const sampleComparisonPlans: ComparisonPlan[] = [
  { id: 'starter', name: 'Starter', price: '$0', priceNote: 'per month', cta: { label: 'Start for free', href: '#starter' } },
  { id: 'team', name: 'Team', price: '$49', priceNote: 'per member / month', cta: { label: 'Start free trial', href: '#team' } },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', priceNote: 'billed annually', cta: { label: 'Contact sales', href: '#enterprise' } },
];

/** Features grouped by section; values are keyed by plan id. */
export const sampleComparisonSections: ComparisonSection[] = [
  {
    id: 'usage',
    title: 'Usage',
    features: [
      { id: 'projects', label: 'Projects', values: { starter: 1, team: 'Unlimited', enterprise: 'Unlimited' } },
      { id: 'members', label: 'Members', values: { starter: 3, team: 25, enterprise: 'Unlimited' } },
      { id: 'requests', label: 'Requests per month', values: { starter: 50_000, team: 500_000, enterprise: { value: 'Custom', note: 'Volume pricing' } } },
      { id: 'retention', label: 'Log retention', description: 'How long request logs are kept.', values: { starter: '7 days', team: '30 days', enterprise: '1 year' } },
    ],
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    features: [
      { id: 'previews', label: 'Preview deployments', values: { starter: false, team: true, enterprise: true } },
      { id: 'roles', label: 'Custom roles', values: { starter: false, team: false, enterprise: true } },
      { id: 'comments', label: 'Comments and reviews', values: { starter: true, team: true, enterprise: true } },
    ],
  },
  {
    id: 'security',
    title: 'Security and compliance',
    features: [
      { id: 'sso', label: 'Single sign-on', values: { starter: false, team: { value: true, note: 'Add-on' }, enterprise: true } },
      { id: 'audit', label: 'Audit log', values: { starter: false, team: false, enterprise: true } },
      { id: 'residency', label: 'Data residency', values: { starter: false, team: false, enterprise: true } },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    features: [
      { id: 'channel', label: 'Support channel', values: { starter: 'Community', team: 'Email', enterprise: 'Dedicated' } },
      { id: 'sla', label: 'Uptime SLA', values: { starter: null, team: '99.9%', enterprise: '99.99%' } },
    ],
  },
];

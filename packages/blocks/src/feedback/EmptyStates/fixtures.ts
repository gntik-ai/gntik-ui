/** Neutral sample copy for the empty states. */
export const firstRunSteps = ['Connect a Git repository', 'Configure build settings', 'Deploy to an environment'];

export const noResultsSample = { query: 'billing-api', filterCount: 2, entity: 'projects' } as const;

export const noAccessSample = { resource: 'Billing', owner: 'an organization admin' } as const;

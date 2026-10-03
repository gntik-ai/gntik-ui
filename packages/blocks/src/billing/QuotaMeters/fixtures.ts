import type { Quota } from './QuotaMeters';

/** Sample plan quotas: usage so far this cycle and the end-of-cycle projection. */
export const sampleQuotas: Quota[] = [
  { id: 'requests', label: 'Requests', used: 412_800, limit: 500_000, projected: 521_000, unit: 'requests' },
  { id: 'tokens', label: 'Tokens', used: 78_400_000, limit: 120_000_000, projected: 99_100_000, unit: 'tokens' },
  { id: 'storage', label: 'Storage', used: 14.2, limit: 20, projected: 17.1, unit: 'GB' },
  { id: 'seats', label: 'Seats', used: 38, limit: 50, projected: 38, unit: 'seats' },
];

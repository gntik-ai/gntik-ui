import { AppShell } from '@gntik-ai/ui';
import { StatsRow } from '../../../../blocks/src/blocks/StatsRow';

const STATS = [
  { label: 'Active agents', value: '12' },
  { label: 'Runs today', value: '348' },
  { label: 'Success rate', value: '98.2%' },
];

export function DashboardPage() {
  return (
    <AppShell>
      <StatsRow stats={STATS} />
    </AppShell>
  );
}

export const dashboard = `import { KpiRow, ChartCard, ActivityFeed, PageHeader } from '@gntik-ai/blocks';
import { Plus } from '@gntik-ai/icons';

// Blocks ship with realistic fixtures: drop them in, then pass your own data.
export default function App() {
  return (
    <div className="grid gap-6 p-6">
      <PageHeader
        title="Overview"
        description="Traffic, spend and activity across your projects."
        actions={[{ label: 'New project', icon: Plus }]}
      />
      <KpiRow />
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" />
        <ActivityFeed />
      </div>
    </div>
  );
}
`;

import { InspectorLayout } from '@gntik-ai/ui';
import { ChartCard } from '../ChartCard';

export default function ContainerPanel() {
  return (
    <div data-container-example className="h-[640px] overflow-hidden rounded-lg border border-border">
      <InspectorLayout panelTitle="Properties" dockedQuery="(min-width: 0px)" panel={<ChartCard />}>
        <div className="grid gap-6 overflow-auto p-4">
          <div data-container-slot="default" className="flex min-w-0">
            <ChartCard />
          </div>
        </div>
      </InspectorLayout>
    </div>
  );
}

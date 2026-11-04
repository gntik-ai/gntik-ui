import { InspectorLayout } from '@gntik-ai/ui';
import { ResourceCardGrid } from '../ResourceCardGrid';

export default function ContainerPanel() {
  return (
    <div data-container-example className="h-[640px] overflow-hidden rounded-lg border border-border">
      <InspectorLayout panelTitle="Properties" dockedQuery="(min-width: 0px)" panel={<ResourceCardGrid />}>
        <div className="grid gap-6 overflow-auto p-4">
          {([3, 2, 4] as const).map((columns) => (
            <div key={columns} data-container-slot={String(columns)} className="flex min-w-0">
              <ResourceCardGrid columns={columns} className="gap-6" containerClassName="col-span-2" />
            </div>
          ))}
        </div>
      </InspectorLayout>
    </div>
  );
}

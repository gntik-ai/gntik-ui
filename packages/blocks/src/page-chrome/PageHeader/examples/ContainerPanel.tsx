import { InspectorLayout } from '@gntik-ai/ui';
import { PageHeader } from '../PageHeader';

export default function ContainerPanel() {
  return (
    <div data-container-example className="h-[640px] overflow-hidden rounded-lg border border-border">
      <InspectorLayout panelTitle="Properties" dockedQuery="(min-width: 0px)" panel={<PageHeader as="div" />}>
        <div className="grid gap-6 overflow-auto p-4">
          <div data-container-slot="default" className="flex min-w-0">
            <PageHeader as="div" />
          </div>
        </div>
      </InspectorLayout>
    </div>
  );
}

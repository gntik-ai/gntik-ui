import { InspectorLayout, Page, SidebarLayout } from '@gntik-ai/ui';
import { ResourceCardGrid } from '../../ResourceCardGrid/ResourceCardGrid';
import { ChartCard } from '../../ChartCard/ChartCard';
import { FormSection } from '../../../forms/FormSection/FormSection';
import { PageHeader } from '../../../page-chrome/PageHeader/PageHeader';
import { KpiRow } from '../KpiRow';

export default function ContainerPanel() {
  return (
    <div data-container-example className="h-[640px] overflow-hidden rounded-lg border border-border">
      <InspectorLayout
        panelTitle="Properties"
        dockedQuery="(min-width: 0px)"
        panel={<KpiRow variant="strip" showTrends={false} />}
      >
        <div className="grid gap-6 overflow-auto p-4">
          <div data-container-slot="cards" className="flex min-w-0">
            <KpiRow className="gap-6" containerClassName="col-span-2" />
          </div>
          <div data-container-slot="strip" className="flex min-w-0">
            <KpiRow variant="strip" showTrends={false} />
          </div>
        </div>
      </InspectorLayout>
    </div>
  );
}

// The default page frame also demonstrates the thresholds without a narrow panel.
export function StandardFrame() {
  return (
    <div className="h-[900px]">
      <SidebarLayout sidebar={null}>
        <Page>
          <div data-standard-frame className="grid min-w-0 gap-6">
            <PageHeader />
            <KpiRow />
            <ResourceCardGrid />
            <ResourceCardGrid columns={4} />
            <FormSection />
            <ChartCard />
          </div>
        </Page>
      </SidebarLayout>
    </div>
  );
}

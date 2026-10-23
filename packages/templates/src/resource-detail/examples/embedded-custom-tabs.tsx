import { DescriptionListCard } from '@gntik-ai/blocks';
import { Section } from '@gntik-ai/ui';
import ResourceDetailPage from '../Page';

/** The host owns the main landmark and any ChartLocaleProvider needed by chart content. */
export default function EmbeddedCustomTabs() {
  return (
    <main>
      <ResourceDetailPage
        shell={null}
        readOnly
        name="Resource record"
        description="A detail page inside an existing application shell."
        status="active"
        breadcrumbs={[{ label: 'Resources', href: '/resources' }, { label: 'Resource record' }]}
        tabs={[
          {
            value: 'summary',
            label: 'Summary',
            content: (
              <DescriptionListCard
                titleAs="h2"
                title="Record summary"
                items={[
                  { id: 'identifier', label: 'Identifier', value: 'record_42', mono: true },
                  { id: 'owner', label: 'Owner', value: 'Platform team' },
                ]}
              />
            ),
          },
          {
            value: 'output',
            label: 'Output',
            content: (
              <Section variant="card" padding="md" title="Result">
                <p>The resource completed successfully.</p>
              </Section>
            ),
          },
        ]}
      />
    </main>
  );
}

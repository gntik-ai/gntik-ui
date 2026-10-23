import { I18nProvider, Stack } from '@gntik-ai/ui';
import { DescriptionListCard } from '../DescriptionListCard';
export default function Spanish() {
  return (
    <I18nProvider locale="es">
      <Stack gap={6}>
        <DescriptionListCard onEdit={() => {}} />
        <DescriptionListCard
          onEdit={() => {}}
          labels={{
            title: 'Resource details',
            description: 'Current settings',
            edit: 'Change',
            copy: (label) => `Copy field ${label}`,
            copied: (label) => `Copied field ${label}`,
            copiedToClipboard: 'Field copied to clipboard',
          }}
        />
        <DescriptionListCard
          title="Full identifiers"
          wrap
          items={[{ id: 'id', label: 'Correlation ID', value: 'a'.repeat(120), mono: true, copyable: true }]}
        />
        <DescriptionListCard title="Two columns" columns={2} />
        <DescriptionListCard title="Three columns" columns={3} />
      </Stack>
    </I18nProvider>
  );
}

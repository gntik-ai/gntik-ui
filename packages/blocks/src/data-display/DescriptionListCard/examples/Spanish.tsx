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
      </Stack>
    </I18nProvider>
  );
}

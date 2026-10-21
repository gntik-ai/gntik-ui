import { I18nProvider, Stack } from '@gntik-ai/ui';
import { InlineCallout } from '../InlineCallout';
export default function Spanish() {
  return (
    <I18nProvider locale="es">
      <Stack gap={6}>
        <InlineCallout />
        <InlineCallout
          labels={{
            title: 'Build usage',
            description: 'Review your current allowance.',
            upgrade: 'Change plan',
            viewUsage: 'Open usage',
          }}
        />
      </Stack>
    </I18nProvider>
  );
}

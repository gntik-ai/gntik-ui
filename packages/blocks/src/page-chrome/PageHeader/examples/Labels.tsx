import { I18nProvider } from '@gntik-ai/ui';
import { PageHeader } from '../PageHeader';
export default function Labels() {
  return (
    <I18nProvider locale="es">
      <PageHeader
        labels={{
          title: 'Application releases',
          description: 'Build and release history.',
          moreActions: 'Additional actions',
          sections: 'Release sections',
        }}
      />
    </I18nProvider>
  );
}

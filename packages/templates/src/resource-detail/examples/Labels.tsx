import { I18nProvider } from '@gntik-ai/ui';
import ResourceDetailPage from '../Page';

/** Each tab label and the tablist name can be overridden independently. */
export default function Labels() {
  return (
    <I18nProvider locale="es">
      <ResourceDetailPage
        labels={{
          overview: 'Resource overview',
          activity: 'Resource activity',
          settings: 'Resource settings',
          sections: 'Resource navigation',
        }}
      />
    </I18nProvider>
  );
}

import { I18nProvider } from '@gntik-ai/ui';
import ResourceDetailPage from '../Page';

/** Only tab chrome is translated; imported resource data and section content stay unchanged. */
export default function Spanish() {
  return (
    <I18nProvider locale="es">
      <ResourceDetailPage />
    </I18nProvider>
  );
}

import { I18nProvider } from '@gntik-ai/ui';
import { PageHeader } from '../PageHeader';

/** Caller-supplied content is unchanged; the tablist name follows the active catalog. */
export default function Spanish() {
  return (
    <I18nProvider locale="es">
      <PageHeader />
    </I18nProvider>
  );
}

import { I18nProvider } from '@gntik-ai/ui';
import { PageHeader } from '../PageHeader';

/** Caller-supplied content is unchanged; the tablist name follows the active catalog. */
export default function Spanish() {
  return (
    <I18nProvider locale="es">
      <PageHeader />
      <PageHeader
        as="div"
        wrapTitle
        title={`Resource details and correlation identifier ${'a'.repeat(120)}`}
        breadcrumbs={null}
        description={null}
        status=""
        meta={[]}
        actions={[]}
        tabs={null}
      />
    </I18nProvider>
  );
}

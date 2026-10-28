import { EditableText, useI18n } from '@gntik-ai/ui';
import { PageHeader } from '../PageHeader';

export default function EditableTitle() {
  const { t } = useI18n();
  return (
    <PageHeader
      title={
        <EditableText
          defaultValue={t('editableText.example.supportAgent')}
          label={t('editableText.example.agentName')}
          onSave={() => {}}
        />
      }
      breadcrumbs={null}
      description={null}
      status=""
      meta={[]}
      actions={[]}
      tabs={null}
    />
  );
}

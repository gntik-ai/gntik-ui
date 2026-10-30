import { useI18n } from '../../../i18n';
import { EditableText } from '../EditableText';

export default function PageTitle() {
  const { t } = useI18n();
  return (
    <h4 className="text-heading-xl font-bold">
      <EditableText
        defaultValue={t('editableText.example.supportAgent')}
        label={t('editableText.example.agentName')}
        onSave={() => {}}
      />
    </h4>
  );
}

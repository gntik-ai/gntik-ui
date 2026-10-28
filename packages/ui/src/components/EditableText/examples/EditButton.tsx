import { useI18n } from '../../../i18n';
import { EditableText } from '../EditableText';

export default function EditButton() {
  const { t } = useI18n();
  return (
    <EditableText
      defaultValue={t('editableText.example.supportAgent')}
      label={t('editableText.example.agentName')}
      activation="button"
      onSave={() => {}}
    />
  );
}

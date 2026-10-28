import { useI18n } from '../../../i18n';
import { EditableText } from '../EditableText';

export default function Multiline() {
  const { t } = useI18n();
  return (
    <EditableText
      defaultValue={t('editableText.example.descriptionValue')}
      label={t('editableText.example.description')}
      multiline
      maxLength={240}
      onSave={() => {}}
    />
  );
}

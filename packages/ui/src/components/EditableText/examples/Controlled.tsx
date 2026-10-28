import { useState } from 'react';
import { useI18n } from '../../../i18n';
import { EditableText } from '../EditableText';

export default function Controlled() {
  const { t } = useI18n();
  const [value, setValue] = useState(t('editableText.example.supportAgent'));
  const [editing, setEditing] = useState(false);
  return (
    <EditableText
      value={value}
      editing={editing}
      onEditingChange={setEditing}
      label={t('editableText.example.agentName')}
      onSave={(next) => setValue(next)}
    />
  );
}

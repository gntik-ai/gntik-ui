import { useI18n } from '../../../i18n';
import { EditableText } from '../EditableText';

export default function SaveStates() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-start gap-3">
      <EditableText
        defaultValue={t('editableText.example.pending')}
        label={t('editableText.example.agentName')}
        onSave={() => new Promise<void>((resolve) => setTimeout(resolve, 1500))}
      />
      <EditableText
        defaultValue={t('editableText.example.rejectName')}
        label={t('editableText.example.agentName')}
        onSave={() => t('editableText.example.nameTaken')}
      />
      <EditableText
        defaultValue={t('editableText.example.rejectGeneric')}
        label={t('editableText.example.agentName')}
        onSave={() => false}
      />
      <EditableText
        defaultValue={t('editableText.example.rejectNetwork')}
        label={t('editableText.example.agentName')}
        onSave={async () => {
          throw new Error(t('editableText.example.networkDown'));
        }}
      />
      <EditableText
        defaultValue={t('editableText.example.shortName')}
        placeholder={t('editableText.example.agentName')}
        label={t('editableText.example.agentName')}
        maxLength={24}
        validate={(value) => (value ? undefined : t('editableText.example.nameRequired'))}
        onSave={() => {}}
      />
      <EditableText
        defaultValue={t('editableText.example.untrimmed')}
        label={t('editableText.example.agentName')}
        trim={false}
        onSave={() => {}}
      />
      <EditableText
        defaultValue={t('editableText.example.blurCancel')}
        label={t('editableText.example.agentName')}
        submitOnBlur={false}
        onCancel={() => {}}
        onSave={() => {}}
      />
      <EditableText
        defaultValue={t('editableText.example.defaultEditing')}
        label={t('editableText.example.agentName')}
        defaultEditing
        onSave={() => {}}
      />
      <EditableText
        defaultValue={t('editableText.example.disabled')}
        label={t('editableText.example.agentName')}
        disabled
        onSave={() => {}}
      />
    </div>
  );
}

import { Dropzone, DropzoneTrigger, DropzoneCaption } from '../Dropzone';
import { useI18n } from '../../../i18n';

export default function DropzoneTriggerExample() {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <Dropzone activateOnClick={false} accept={['image/*']} maxFiles={1} multiple={false} maxSize={5_000_000}>
        <p>{t('dropzone.label')}</p>
        <DropzoneTrigger />
        <DropzoneCaption />
      </Dropzone>
      <Dropzone disabled />
    </div>
  );
}

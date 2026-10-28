import { Dropzone } from '../Dropzone';
import { useI18n } from '../../../i18n';

export default function DropzoneFullScreen() {
  const { t } = useI18n();
  return (
    <>
      <p>{t('dropzone.label')}</p>
      <Dropzone fullScreen accept="image/*" render={<div data-example="full-screen" />} />
    </>
  );
}

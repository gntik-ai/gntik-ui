import { Dropzone, DropzoneAccept, DropzoneIdle, DropzoneReject, DropzoneCaption } from '../Dropzone';
import { useI18n } from '../../../i18n';

export default function DropzoneDefault() {
  const { t } = useI18n();
  return (
    <Dropzone accept=".csv,text/csv" maxSize={25_000_000}>
      <DropzoneIdle>{t('dropzone.label')}</DropzoneIdle>
      <DropzoneAccept>{t('dropzone.label')}</DropzoneAccept>
      <DropzoneReject>{t('dropzone.reject')}</DropzoneReject>
      <DropzoneCaption />
    </Dropzone>
  );
}

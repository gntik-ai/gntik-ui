import { useDropzone } from '../useDropzone';
import { Button } from '../../Button/Button';
import { useI18n } from '../../../i18n';

export default function DropzoneHeadlessCard() {
  const { t } = useI18n();
  const zone = useDropzone({ accept: 'image/*', activateOnClick: false });
  return (
    <>
      <div
        {...zone.rootProps}
        className="rounded-lg border border-border bg-card p-6 data-[drag-state=accept]:border-primary data-[drag-state=accept]:bg-primary/10 data-[drag-state=reject]:border-destructive data-[drag-state=reject]:bg-destructive/10 data-[drag-state=reject]:text-destructive-text"
      >
        <p>{t(zone.dragState === 'reject' ? 'dropzone.reject' : 'dropzone.label')}</p>
        <Button onClick={zone.open}>{t('upload.browse')}</Button>
      </div>
      <input {...zone.inputProps} />
      <span role="status" aria-live="polite" className="sr-only">
        {zone.announcement}
      </span>
    </>
  );
}

import { useI18n } from '../../../i18n/I18nProvider';
import { QrCode } from '../QrCode';

/** A value beyond version 40 capacity: a bordered placeholder replaces the image. */
export default function QrCodeTooLong() {
  const { t } = useI18n();
  return (
    <div className="grid justify-items-start gap-2">
      <QrCode value={'https://app.example.com/pair?code='.concat('7H2K9QXM4TRD'.repeat(250))} errorLevel="H" />
      <p className="text-sm text-muted-foreground">{t('qrCode.example.tooLongCaption')}</p>
    </div>
  );
}

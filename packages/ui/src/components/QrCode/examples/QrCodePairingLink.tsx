import { useI18n } from '../../../i18n/I18nProvider';
import { QrCode } from '../QrCode';

/** A pairing link at higher error correction and a larger size. */
export default function QrCodePairingLink() {
  const { t } = useI18n();
  return (
    <div className="grid justify-items-start gap-2">
      <QrCode
        value="https://app.example.com/pair?code=7H2K-9QXM-4TRD"
        errorLevel="Q"
        size={192}
        label={t('qrCode.example.pairingLabel')}
      />
      <p className="text-sm text-muted-foreground">{t('qrCode.example.pairingCaption')}</p>
    </div>
  );
}

import { useI18n } from '../../../i18n/I18nProvider';
import { QrCode } from '../QrCode';

/** An otpauth URI for an authenticator app. No download is offered: the URI carries the TOTP secret. */
export default function QrCodeOtpauth() {
  const { t } = useI18n();
  return (
    <div className="grid justify-items-start gap-2">
      <QrCode
        value="otpauth://totp/Example:ana@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"
        label={t('qrCode.example.otpauthLabel')}
      />
      <p className="text-sm text-muted-foreground">{t('qrCode.example.otpauthCaption')}</p>
    </div>
  );
}

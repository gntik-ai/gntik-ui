import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { QrCode, type QrCodeStatus } from '../QrCode';

/** An expired code with Refresh: the modules are removed until a new code is issued. */
export default function QrCodeExpired() {
  const { t } = useI18n();
  const [status, setStatus] = useState<QrCodeStatus>('expired');
  const [issued, setIssued] = useState(0);
  const refresh = () => {
    setStatus('loading');
    window.setTimeout(() => {
      setIssued((n) => n + 1);
      setStatus('active');
    }, 600);
  };
  return (
    <div className="grid justify-items-start gap-2">
      <QrCode value={`https://app.example.com/pair?code=7H2K-9QXM-${issued}`} status={status} onRefresh={refresh} />
      <p className="text-sm text-muted-foreground" role="status">
        {issued > 0 ? t('qrCode.example.reissued') : t('qrCode.example.expiredCaption')}
      </p>
    </div>
  );
}

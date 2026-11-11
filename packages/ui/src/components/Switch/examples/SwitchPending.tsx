import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Alert } from '../../Alert/Alert';
import { Switch } from '../Switch';

const request = (fail: boolean) =>
  new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error('failed')) : resolve()), 400));

export default function SwitchPending() {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const [failed, setFailed] = useState(false);

  const toggle = async (next: boolean) => {
    setFailed(false);
    setEnabled(next);
    setLoading(true);
    try {
      await request(failNext);
    } catch {
      setEnabled(!next);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Switch label={t('switch.example.connector')} checked={enabled} onCheckedChange={toggle} loading={loading} />
      <Switch label={t('switch.example.failNext')} size="sm" checked={failNext} onCheckedChange={setFailNext} />
      {failed && <Alert tone="destructive">{t('switch.example.error')}</Alert>}
    </div>
  );
}

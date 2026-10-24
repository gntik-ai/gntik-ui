import { useState } from 'react';
import { CSPProvider, useCSP } from '../../../csp';
import { useI18n } from '../../../i18n';
import { Button } from '../../../components/Button';
import { PrintLayout } from '../PrintLayout';

export default function PrintLayoutStaticStyles() {
  const { nonce } = useCSP();
  const { t } = useI18n();
  const [disabled, setDisabled] = useState(false);
  return (
    <CSPProvider nonce={nonce} disableStyleElements={disabled}>
      <PrintLayout aria-label={t('csp.document')}>
        <h1 className="mb-4 text-xl font-semibold">{t('csp.document')}</h1>
        <Button onClick={() => setDisabled(!disabled)}>{t(disabled ? 'csp.enable' : 'csp.disable')}</Button>
        <p role="status" className="mt-4">
          {t(disabled ? 'csp.disabled' : 'csp.enabled')}
        </p>
      </PrintLayout>
    </CSPProvider>
  );
}

'use client';

import { PrintLayout, useI18n } from '@gntik-ai/ui';
import { useOs, useReducedMotion } from '@gntik-ai/ui/hooks';

/** App Router smoke-test route: a client component reading kit hooks from the tree-shakable subpath. */
export default function HooksPage() {
  const { t } = useI18n();
  const os = useOs();
  const reducedMotion = useReducedMotion();
  return (
    <PrintLayout aria-label={t('hooksExample.os.current', { os })}>
      <div className="space-y-2">
        <p>{t('hooksExample.os.current', { os })}</p>
        <p>
          {t('hooksExample.mediaQuery.motion', {
            state: t(reducedMotion ? 'hooksExample.mediaQuery.reduced' : 'hooksExample.mediaQuery.standard'),
          })}
        </p>
      </div>
    </PrintLayout>
  );
}

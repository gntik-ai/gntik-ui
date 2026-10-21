import { I18nProvider, Stack } from '@gntik-ai/ui';
import { useState } from 'react';
import { ErrorPanel } from '../ErrorPanel';
export default function Spanish() {
  const [retrying, setRetrying] = useState(false);
  return (
    <I18nProvider locale="es">
      <Stack gap={6}>
        <ErrorPanel onRetry={() => {}} />
        <ErrorPanel
          retrying={retrying}
          onRetry={() => setRetrying(true)}
          labels={{
            title: 'Resource unavailable',
            message: 'Please try again.',
            support: 'Get help',
            retry: 'Try loading',
            retrying: 'Loading…',
            retryingStatus: 'Loading resource',
            requestId: 'Reference',
            copyRequestId: 'Copy reference',
            copied: 'Reference copied',
            requestIdCopied: 'Reference copied to clipboard',
            details: 'Show diagnostics',
          }}
        />
      </Stack>
    </I18nProvider>
  );
}

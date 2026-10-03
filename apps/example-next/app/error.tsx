'use client';
import { Status500Page } from '@gntik-ai/templates';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Status500Page
      requestId={error.digest ?? 'unavailable'}
      details={error.message}
      onRetry={reset}
      supportAction={null}
      homeHref="/dashboard"
      statusHref="/dashboard"
    />
  );
}

import { useClipboard } from '@gntik-ai/ui';
import { useCallback } from 'react';

/** Copies text with shared fallback support and the chat's 1600ms feedback duration. */
export function useCopy(resetMs = 1600) {
  const { status, copied, copy: copyText } = useClipboard({ timeout: resetMs });
  const copy = useCallback(
    async (text: string) => {
      await copyText(text);
    },
    [copyText],
  );
  return { status, copied, copy };
}

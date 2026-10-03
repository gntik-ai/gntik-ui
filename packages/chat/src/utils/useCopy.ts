import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Copies text to the clipboard and exposes a short-lived `copied` flag for the button label.
 * The reset timer is cleared on unmount and on every new copy.
 */
export function useCopy(resetMs = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard?.writeText(text);
      } catch {
        // Clipboard can be denied (insecure context, permissions); the flag still gives feedback.
      }
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetMs);
    },
    [resetMs],
  );

  return { copied, copy };
}

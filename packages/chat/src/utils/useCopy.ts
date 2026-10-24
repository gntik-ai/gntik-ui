import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Copies text to the clipboard and exposes a short-lived status and compatible `copied` flag for the button label.
 * The reset timer is cleared on unmount and on every new copy.
 */
export function useCopy(resetMs = 1600) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const mounted = useRef(true);
  const attempt = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      attempt.current += 1;
      clearTimeout(timer.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      clearTimeout(timer.current);
      const current = ++attempt.current;
      let next: 'copied' | 'failed' = 'failed';
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          next = 'copied';
        }
      } catch {
        // Permission errors and unavailable clipboard access both report failure.
      }
      if (!mounted.current || current !== attempt.current) return;
      setStatus(next);
      timer.current = setTimeout(() => setStatus('idle'), resetMs);
    },
    [resetMs],
  );

  return { status, copied: status === 'copied', copy };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CopyStatus } from '../components/CopyButton/CopyButton';
import { useAnnounce, useHasLiveAnnouncer } from '../components/LiveAnnouncer';
import { useI18n } from '../i18n/I18nProvider';
import { copyToClipboard } from '../components/CopyButton/clipboard';

export interface UseClipboardOptions {
  /** Feedback duration in milliseconds. Zero keeps feedback until reset. Default 2000. */
  timeout?: number;
  /** Announce results through an enclosing LiveAnnouncer. Default false. */
  announce?: boolean;
  /** Called after each successful copy while mounted. */
  onCopy?: (text: string) => void;
  /** Called once when a copy or getter fails while mounted. */
  onError?: (error: unknown) => void;
}

/**
 * Copies text through the kit's Clipboard API and execCommand fallback.
 *
 * `copy(value)` accepts a string or a lazy sync/async getter and always resolves a success
 * flag, including when a getter or callback throws. `status` is idle, copied or failed;
 * `copied` is true only after success and `error` holds the most recent failure.
 * Feedback resets after `timeout` ms (default 2000); zero keeps it until `reset()`.
 * A new copy clears the old timer. Only the latest attempt may update feedback; callbacks
 * still report each settled copy while mounted. Reset/unmount invalidate in-flight feedback
 * and clear timers.
 * Opt into localized polite success and assertive failure announcements with `announce: true`
 * inside LiveAnnouncer; outside it no region is created and no announcement is sent.
 */
export function useClipboard({ timeout = 2000, announce = false, onCopy, onError }: UseClipboardOptions = {}) {
  const announceResult = useAnnounce();
  const hasAnnouncer = useHasLiveAnnouncer();
  const { t } = useI18n();
  const [state, setState] = useState<{ status: CopyStatus; error: unknown }>({ status: 'idle', error: undefined });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  const attempt = useRef(0);
  const reset = useCallback(() => {
    clearTimeout(timer.current);
    attempt.current += 1;
    if (mounted.current) setState({ status: 'idle', error: undefined });
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      attempt.current += 1;
      clearTimeout(timer.current);
    };
  }, []);
  const copy = useCallback(
    async (value: string | (() => string | Promise<string>)) => {
      clearTimeout(timer.current);
      const current = ++attempt.current;
      let text = '';
      let success = false;
      let error: unknown;
      try {
        text = typeof value === 'function' ? await value() : value;
        await copyToClipboard(text);
        success = true;
      } catch (cause) {
        error = cause;
      }
      if (!mounted.current) return success;
      if (current === attempt.current) {
        setState({ status: success ? 'copied' : 'failed', error });
        if (timeout > 0) timer.current = setTimeout(reset, timeout);
        if (announce && hasAnnouncer) {
          announceResult(
            t(success ? 'common.copiedToClipboard' : 'common.copyFailed'),
            success ? 'polite' : 'assertive',
          );
        }
      }
      try {
        if (success) onCopy?.(text);
        else onError?.(error);
      } catch {
        /* Consumer callbacks must not reject copy(). */
      }
      return success;
    },
    [reset, timeout, onCopy, onError, announce, hasAnnouncer, announceResult, t],
  );
  return { ...state, copied: state.status === 'copied', copy, reset };
}

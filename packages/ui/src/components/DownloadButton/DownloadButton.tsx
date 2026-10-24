import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { Button, type ButtonProps } from '../Button';
import { useI18n } from '../../i18n';
import { useAnnounce, useHasLiveAnnouncer } from '../LiveAnnouncer';
import { cn } from '../../utils/cn';
import { downloadButtonVariants } from './download-button.variants';
import { downloadFile } from './download';

export interface DownloadButtonProps extends ButtonProps {
  data: string | Blob | (() => string | Blob | Promise<string | Blob>);
  fileName: string;
  mimeType?: string;
  onDownloaded?: () => void;
  onDownloadError?: (error: unknown) => void;
}

/** Saves data as a named file; async getters use Button's focusable loading state. */
export function DownloadButton({
  data,
  fileName,
  mimeType,
  onDownloaded,
  onDownloadError,
  children,
  icon = Download,
  onClick,
  loading = false,
  disabled,
  className,
  ...props
}: DownloadButtonProps) {
  const { t } = useI18n();
  const announce = useAnnounce();
  const hasAnnouncer = useHasLiveAnnouncer();
  const [failure, setFailure] = useState('');
  const styles = downloadButtonVariants();
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const save: NonNullable<ButtonProps['onClick']> = async (event) => {
    if (inFlight.current || loading || disabled) return;
    inFlight.current = true;
    try {
      onClick?.(event);
      if (event.defaultPrevented) return;
      setFailure('');
      const result = typeof data === 'function' ? data() : data;
      let value: string | Blob;
      if (typeof result === 'string' || result instanceof Blob) value = result;
      else {
        setPending(true);
        value = await result;
      }
      if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
      downloadFile(value, fileName, mimeType);
      onDownloaded?.();
    } catch (error) {
      const message = t('download.failed');
      if (hasAnnouncer) announce(message, 'polite');
      else setFailure(message);
      onDownloadError?.(error);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };
  return (
    <>
      <Button
        {...props}
        className={cn(styles.button(), className)}
        disabled={disabled}
        loading={loading || pending}
        icon={icon}
        onClick={save}
      >
        {children ?? t('download.label')}
      </Button>
      {!hasAnnouncer && (
        <span role="status" aria-live="polite" className={styles.status()}>
          {failure}
        </span>
      )}
    </>
  );
}

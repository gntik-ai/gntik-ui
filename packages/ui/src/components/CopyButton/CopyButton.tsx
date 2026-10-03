import { Check, Copy, X } from 'lucide-react';
import { useEffect, useState, type Ref } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { Button, IconButton, type ButtonProps } from '../Button';
import { useAnnounce, useHasLiveAnnouncer } from '../LiveAnnouncer';
import { SimpleTooltip } from '../Tooltip';
import { copyToClipboard } from './clipboard';
import { copyButtonVariants } from './copy-button.variants';

export type CopyStatus = 'idle' | 'copied' | 'failed';

export interface CopyButtonProps extends Omit<ButtonProps, 'value' | 'children' | 'icon' | 'trailingIcon' | 'onClick' | 'onCopy' | 'iconOnly'> {
  ref?: Ref<HTMLButtonElement>;
  /** Text to copy, or a getter (sync or async) called on click — e.g. to read a secret lazily. */
  value: string | (() => string | Promise<string>);
  /** `icon` (default): square icon button with a tooltip. `label`: icon + visible text. */
  display?: 'icon' | 'label';
  /** Name / visible text before copying. Defaults to "Copy". */
  label?: string;
  /** Name / visible text after a successful copy. Defaults to "Copied". */
  copiedLabel?: string;
  /** Polite announcement after a successful copy. Defaults to "Copied to clipboard". */
  announcement?: string;
  /** Show a tooltip on the icon form (default true). */
  tooltip?: boolean;
  /** How long the success / failure state lasts, in ms (default 2000). */
  resetAfter?: number;
  onCopy?: (text: string) => void;
  onCopyError?: (error: unknown) => void;
}

/**
 * Copies a string (or the result of a getter) to the clipboard. Shows a check while "Copied",
 * announces the result politely (through a LiveAnnouncer above it, or its own status region),
 * and falls back to `execCommand('copy')` when the Clipboard API is unavailable.
 */
export function CopyButton({
  value,
  display = 'icon',
  label: labelProp,
  copiedLabel: copiedProp,
  announcement: announcementProp,
  tooltip = true,
  resetAfter = 2000,
  onCopy,
  onCopyError,
  variant = 'ghost',
  size = 'auto',
  className,
  disabled,
  ...props
}: CopyButtonProps) {
  const { t } = useI18n();
  const announce = useAnnounce();
  const hasAnnouncer = useHasLiveAnnouncer();
  const [status, setStatus] = useState<CopyStatus>('idle');
  const [attempt, setAttempt] = useState(0);
  const label = labelProp ?? t('common.copy');
  const copiedLabel = copiedProp ?? t('common.copied');
  const successText = announcementProp ?? t('common.copiedToClipboard');
  const failedText = t('common.copyFailed');

  useEffect(() => {
    if (status === 'idle') return;
    const id = window.setTimeout(() => setStatus('idle'), resetAfter);
    return () => window.clearTimeout(id);
  }, [status, attempt, resetAfter]);

  const copy = async () => {
    try {
      const text = typeof value === 'function' ? await value() : value;
      await copyToClipboard(text);
      setStatus('copied');
      if (hasAnnouncer) announce(successText);
      onCopy?.(text);
    } catch (error) {
      setStatus('failed');
      if (hasAnnouncer) announce(failedText, 'assertive');
      onCopyError?.(error);
    }
    setAttempt((n) => n + 1);
  };

  const s = copyButtonVariants({ state: status });
  const current = status === 'copied' ? copiedLabel : status === 'failed' ? failedText : label;
  const StateIcon = status === 'copied' ? Check : status === 'failed' ? X : Copy;
  const region = !hasAnnouncer && (
    <span role="status" className={s.status()}>
      {status === 'copied' ? successText : status === 'failed' ? failedText : ''}
    </span>
  );

  if (display === 'label') {
    return (
      <>
        <Button {...props} variant={variant} size={size} disabled={disabled} icon={StateIcon} className={cn(s.button(), className)} onClick={copy} data-status={status}>
          {current}
        </Button>
        {region}
      </>
    );
  }

  const button = (
    <IconButton {...props} variant={variant} size={size} disabled={disabled} icon={StateIcon} label={current} className={cn(s.button(), className)} onClick={copy} data-status={status} />
  );
  return (
    <>
      {tooltip && !disabled ? <SimpleTooltip content={current}>{button}</SimpleTooltip> : button}
      {region}
    </>
  );
}

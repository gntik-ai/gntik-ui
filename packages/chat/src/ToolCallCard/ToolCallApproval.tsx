import { Button, Input } from '@gntik-ai/ui';
import { useEffect, useId, useRef, useState } from 'react';
import { useChatI18n } from '../utils/i18n';
import type { ToolCallCardProps } from './ToolCallCard';
import { toolCallCardStyles as s } from './toolCallCard.variants';

type Props = Pick<
  ToolCallCardProps,
  'name' | 'onApprove' | 'onDeny' | 'askDenyReason' | 'destructive' | 'approveLabel' | 'denyLabel' | 'approvalPrompt'
>;

/** Decision controls stay outside the disclosure so collapsing never hides them. */
export function ToolCallApproval({
  name,
  onApprove,
  onDeny,
  askDenyReason = true,
  destructive = false,
  approveLabel,
  denyLabel,
  approvalPrompt,
}: Props) {
  const { t, tc } = useChatI18n();
  const id = useId();
  const approveText =
    approveLabel ?? (destructive ? tc('toolCall.approveDestructive', { name }) : tc('toolCall.approve'));
  const denyText = denyLabel ?? tc('toolCall.deny');
  const [reasonStep, setReasonStep] = useState(false);
  const [reason, setReason] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const denyButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (reasonStep) input.current?.focus();
    else if (restoreFocus.current) {
      denyButton.current?.focus();
      restoreFocus.current = false;
    }
  }, [reasonStep]);
  const inFlight = useRef(false);
  const [busy, setBusy] = useState<'approve' | 'deny' | null>(null);

  const run = async (action: 'approve' | 'deny', handler?: () => void | Promise<void>) => {
    if (inFlight.current || !handler) return;
    inFlight.current = true;
    try {
      const result = handler();
      if (result && typeof result.then === 'function') {
        setBusy(action);
      }
      // Keep the guard through this event batch even when the callback returns void.
      await result;
    } catch {
      // The caller reports callback errors; keep the controls available for a retry.
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  };

  const cancel = () => {
    if (inFlight.current) return;
    restoreFocus.current = true;
    setReasonStep(false);
    setReason('');
  };
  const submitReason = () => void run('deny', onDeny ? () => onDeny(reason.trim() || undefined) : undefined);

  return (
    <div
      role="group"
      aria-labelledby={`${id}-prompt`}
      aria-describedby={destructive ? `${id}-hint` : undefined}
      className={s.approval}
      onKeyDown={(event) => {
        if (reasonStep && event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          cancel();
        }
      }}
    >
      <p id={`${id}-prompt`} className={s.prompt}>
        {approvalPrompt ?? tc('toolCall.approvalPrompt')}
      </p>
      {destructive && (
        <p id={`${id}-hint`} className={s.hint}>
          {tc('toolCall.destructiveHint')}
        </p>
      )}
      {reasonStep ? (
        <>
          <Input
            ref={input}
            aria-label={tc('toolCall.denyReason')}
            placeholder={tc('toolCall.denyReason')}
            value={reason}
            onValueChange={setReason}
            readOnly={busy !== null}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault();
                event.stopPropagation();
                submitReason();
              }
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            loading={busy === 'deny'}
            disabled={busy !== null}
            focusableWhenDisabled
            onClick={submitReason}
          >
            {denyText}
          </Button>
          <Button size="sm" variant="secondary" disabled={busy !== null} focusableWhenDisabled onClick={cancel}>
            {t('common.cancel')}
          </Button>
        </>
      ) : (
        <>
          <Button
            size="sm"
            variant={destructive ? 'destructive' : 'primary'}
            loading={busy === 'approve'}
            disabled={busy !== null}
            focusableWhenDisabled
            onClick={() => void run('approve', onApprove)}
          >
            {approveText}
          </Button>
          <Button
            ref={denyButton}
            size="sm"
            variant="secondary"
            loading={busy === 'deny'}
            disabled={busy !== null}
            focusableWhenDisabled
            onClick={() => {
              if (inFlight.current) return;
              if (askDenyReason) setReasonStep(true);
              else void run('deny', onDeny);
            }}
          >
            {denyText}
          </Button>
        </>
      )}
    </div>
  );
}

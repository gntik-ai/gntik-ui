import {
  Button,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  Radio,
  RadioGroup,
  SimpleTooltip,
  Textarea,
  cn,
} from '@gntik-ai/ui';
import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useId, useState, type FormEvent, type Ref } from 'react';
import { useChatI18n, type ChatMessageKey } from '../utils/i18n';
import { useCopy } from '../utils/useCopy';
import { messageFeedbackStyles as s } from './messageFeedback.variants';

export type FeedbackRating = 'up' | 'down';

export interface FeedbackValue {
  /** `null` = no rating. */
  rating: FeedbackRating | null;
  /** Reason picked after a thumbs down (a `FeedbackReason.value`). */
  reason?: string;
  /** Free-text comment after a thumbs down. */
  comment?: string;
}

export interface FeedbackReason {
  value: string;
  label: string;
}

export interface MessageFeedbackProps {
  /** Current feedback (controlled). Uncontrolled when omitted. */
  value?: FeedbackValue;
  /**
   * Called on every change: `{ rating: 'up' }`, `{ rating: 'down' }` right away on thumbs down,
   * then `{ rating: 'down', reason, comment }` when the details form is sent, and
   * `{ rating: null }` when the active thumb is pressed again.
   */
  onFeedback?: (value: FeedbackValue) => void;
  /** Reasons offered after a thumbs down. Defaults to a generic list; `[]` hides the picker. */
  reasons?: FeedbackReason[];
  /** Open the reason/comment popover on thumbs down. Default true. */
  askDetails?: boolean;
  /** Plain text to copy; shows the Copy action. */
  copyText?: string;
  /** Shows the Regenerate action. */
  onRegenerate?: () => void;
  /** Accessible name of the group. Default "Response feedback". */
  label?: string;
  disabled?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

const DEFAULT_REASONS: Array<{ value: string; key: ChatMessageKey }> = [
  { value: 'inaccurate', key: 'chat.reasonInaccurate' },
  { value: 'unhelpful', key: 'chat.reasonUnhelpful' },
  { value: 'incomplete', key: 'chat.reasonIncomplete' },
  { value: 'unsafe', key: 'chat.reasonUnsafe' },
  { value: 'other', key: 'chat.reasonOther' },
];

const EMPTY: FeedbackValue = { rating: null };

/**
 * Feedback for an assistant reply: thumbs up / down toggles (aria-pressed), and on thumbs down
 * a popover asking for a reason and an optional comment. Copy and Regenerate sit alongside.
 */
export function MessageFeedback({
  value: valueProp,
  onFeedback,
  reasons: reasonsProp,
  askDetails = true,
  copyText,
  onRegenerate,
  label,
  disabled = false,
  className,
  ref,
}: MessageFeedbackProps) {
  const { t, tc } = useChatI18n();
  const id = useId();
  const [inner, setInner] = useState<FeedbackValue>(EMPTY);
  const value = valueProp ?? inner;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [comment, setComment] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const { copied, copy } = useCopy();
  const reasons = reasonsProp ?? DEFAULT_REASONS.map((r) => ({ value: r.value, label: tc(r.key) }));

  const emit = (next: FeedbackValue) => {
    if (valueProp === undefined) setInner(next);
    onFeedback?.(next);
  };

  const pressUp = () => {
    setOpen(false);
    const next: FeedbackValue = value.rating === 'up' ? EMPTY : { rating: 'up' };
    emit(next);
    setAnnouncement(next.rating ? tc('chat.feedbackThanks') : tc('chat.feedbackCleared'));
  };

  const pressDown = () => {
    if (value.rating === 'down') {
      setOpen(false);
      emit(EMPTY);
      setAnnouncement(tc('chat.feedbackCleared'));
      return;
    }
    emit({ rating: 'down' });
    setReason('');
    setComment('');
    if (askDetails) setOpen(true);
    else setAnnouncement(tc('chat.feedbackThanks'));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = comment.trim();
    emit({ rating: 'down', ...(reason ? { reason } : {}), ...(trimmed ? { comment: trimmed } : {}) });
    setOpen(false);
    setAnnouncement(tc('chat.feedbackThanks'));
  };

  const upLabel = t('chat.goodResponse');
  const downLabel = t('chat.badResponse');

  return (
    <div ref={ref} role="group" aria-label={label ?? tc('chat.feedback')} className={cn(s.root, className)}>
      {copyText !== undefined && (
        <SimpleTooltip content={copied ? t('common.copied') : t('common.copy')}>
          <IconButton size="sm" icon={copied ? Check : Copy} label={copied ? t('common.copied') : t('chat.copyMessage')} disabled={disabled} onClick={() => void copy(copyText)} />
        </SimpleTooltip>
      )}
      {onRegenerate && (
        <SimpleTooltip content={tc('chat.regenerate')}>
          <IconButton size="sm" icon={RefreshCw} label={tc('chat.regenerate')} disabled={disabled} onClick={onRegenerate} />
        </SimpleTooltip>
      )}
      <SimpleTooltip content={upLabel}>
        <IconButton
          size="sm"
          icon={ThumbsUp}
          label={upLabel}
          aria-pressed={value.rating === 'up'}
          disabled={disabled}
          className={cn(value.rating === 'up' && s.up)}
          onClick={pressUp}
        />
      </SimpleTooltip>
      <Popover
        open={open}
        onOpenChange={(next) => {
          // Opening is driven by pressDown (so a second press clears instead of reopening).
          if (!next) setOpen(false);
        }}
      >
        <PopoverTrigger
          render={
            <IconButton
              size="sm"
              icon={ThumbsDown}
              label={downLabel}
              aria-pressed={value.rating === 'down'}
              disabled={disabled}
              className={cn(value.rating === 'down' && s.down)}
            />
          }
          onClick={pressDown}
        />
        <PopoverContent side="top" align="end" className={s.popup}>
          <form className={s.form} onSubmit={submit}>
            <PopoverTitle id={`${id}-title`} className={s.title}>
              {tc('chat.feedbackTitle')}
            </PopoverTitle>
            {reasons.length > 0 && (
              <RadioGroup aria-labelledby={`${id}-title`} value={reason} onValueChange={(v) => setReason(String(v))}>
                {reasons.map((r) => (
                  <Radio key={r.value} value={r.value} label={r.label} />
                ))}
              </RadioGroup>
            )}
            <div>
              <label htmlFor={`${id}-comment`} className={s.label}>
                {tc('chat.feedbackComment')}
              </label>
              <Textarea id={`${id}-comment`} rows={3} value={comment} onValueChange={setComment} placeholder={tc('chat.feedbackPlaceholder')} />
            </div>
            <div className={s.footer}>
              <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" size="sm">
                {tc('chat.feedbackSubmit')}
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

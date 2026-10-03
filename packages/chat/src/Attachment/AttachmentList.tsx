import { cn } from '@gntik-ai/ui';
import type { Ref } from 'react';
import { useChatI18n } from '../utils/i18n';
import { AttachmentChip, type ChatAttachment } from './AttachmentChip';
import { attachmentStyles as s } from './attachment.variants';

export interface AttachmentListProps {
  attachments: ChatAttachment[];
  /** `chip` for the composer, `tile` for larger image previews in a message. */
  variant?: 'chip' | 'tile';
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  disabled?: boolean;
  /** Accessible name of the list. Default "Attachments". */
  label?: string;
  className?: string;
  ref?: Ref<HTMLUListElement>;
}

/** A labelled list of AttachmentChips. Renders nothing when empty. */
export function AttachmentList({ attachments, variant = 'chip', onRemove, onRetry, disabled, label, className, ref }: AttachmentListProps) {
  const { t } = useChatI18n();
  if (attachments.length === 0) return null;
  return (
    <ul ref={ref} aria-label={label ?? t('chat.attachments')} className={cn(s.list, className)}>
      {attachments.map((a) => (
        <li key={a.id} className={s.item}>
          <AttachmentChip attachment={a} variant={variant} onRemove={onRemove} onRetry={onRetry} disabled={disabled} />
        </li>
      ))}
    </ul>
  );
}

import { cn, fileKind, type FileKind } from '@gntik-ai/ui';
import { AlertCircle, File, FileArchive, FileAudio, FileCode, FileImage, FileSpreadsheet, FileText, FileVideo, RotateCcw, X, type LucideIcon } from 'lucide-react';
import type { Ref } from 'react';
import { formatBytes } from '../utils/format';
import { useChatI18n } from '../utils/i18n';
import { attachmentStyles as s } from './attachment.variants';

/** A file attached to a message or waiting in the composer. */
export interface ChatAttachment {
  id: string;
  name: string;
  /** Size in bytes. */
  size?: number;
  /** MIME type; picks the icon (falls back to the extension). */
  type?: string;
  /** Image preview URL (e.g. from URL.createObjectURL); shown as a thumbnail for images. */
  previewUrl?: string;
  /** Upload progress 0–100 (`null` = indeterminate). Omit when not uploading. */
  progress?: number | null;
  /** Upload failed; a string replaces the default message. */
  error?: boolean | string;
}

export type AttachmentStatus = 'idle' | 'uploading' | 'error';

export interface AttachmentChipProps {
  attachment: ChatAttachment;
  /** `chip` (composer, compact row) or `tile` (message, larger image preview). */
  variant?: 'chip' | 'tile';
  /** Shows the remove button. */
  onRemove?: (id: string) => void;
  /** Shows a retry button in the error state. */
  onRetry?: (id: string) => void;
  disabled?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

const ICONS: Record<FileKind, LucideIcon> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  archive: FileArchive,
  code: FileCode,
  spreadsheet: FileSpreadsheet,
  document: FileText,
  file: File,
};

/** Status of an attachment from its progress and error fields. */
export function attachmentStatus(a: ChatAttachment): AttachmentStatus {
  if (a.error) return 'error';
  if (a.progress === null || (typeof a.progress === 'number' && a.progress < 100)) return 'uploading';
  return 'idle';
}

/**
 * One attached file: image thumbnail or file-type icon, name, size, upload progress
 * (a progressbar), error with retry, and a remove button.
 */
export function AttachmentChip({ attachment: a, variant = 'chip', onRemove, onRetry, disabled = false, className, ref }: AttachmentChipProps) {
  const { t, tc } = useChatI18n();
  const status = attachmentStatus(a);
  const kind = fileKind(a.name, a.type);
  const Icon = status === 'error' ? AlertCircle : ICONS[kind];
  const showImage = a.previewUrl !== undefined && kind === 'image' && status !== 'error';
  const tile = variant === 'tile';
  const pct = typeof a.progress === 'number' ? Math.max(0, Math.min(100, Math.round(a.progress))) : null;

  const media = (
    <span className={cn(tile ? s.tileMedia : s.media, status === 'error' && s.mediaError)}>
      {showImage ? <img src={a.previewUrl} alt="" className={s.img} /> : <Icon size={tile ? 22 : 14} aria-hidden />}
    </span>
  );

  const meta =
    status === 'error' ? (
      <span className={s.metaError}>{typeof a.error === 'string' ? a.error : tc('chat.uploadFailed')}</span>
    ) : status === 'uploading' ? (
      <span className={s.meta}>{pct === null ? t('common.loading') : `${pct}%`}</span>
    ) : a.size !== undefined ? (
      <span className={s.meta}>{formatBytes(a.size)}</span>
    ) : null;

  const buttons = (
    <>
      {status === 'error' && onRetry && (
        <button type="button" className={s.button} aria-label={tc('chat.retryUpload', { name: a.name })} disabled={disabled} onClick={() => onRetry(a.id)}>
          <RotateCcw size={12} aria-hidden />
        </button>
      )}
      {onRemove && (
        <button type="button" className={s.button} aria-label={t('common.removeItem', { label: a.name })} disabled={disabled} onClick={() => onRemove(a.id)}>
          <X size={12} aria-hidden />
        </button>
      )}
    </>
  );

  return (
    <div ref={ref} data-status={status} data-kind={kind} className={cn(tile ? s.tile : s.chip, className)}>
      {media}
      <span className={tile ? s.tileText : s.text}>
        <span className={s.name} title={a.name}>
          {a.name}
        </span>
        {meta}
      </span>
      {tile ? (onRemove || (status === 'error' && onRetry)) && <span className={s.tileActions}>{buttons}</span> : buttons}
      {status === 'uploading' && (
        <span
          role="progressbar"
          aria-label={tc('chat.uploading', { name: a.name })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct ?? undefined}
          className={s.track}
        >
          <span className={pct === null ? s.barIndeterminate : s.bar} style={pct === null ? undefined : { width: `${pct}%` }} />
        </span>
      )}
    </div>
  );
}

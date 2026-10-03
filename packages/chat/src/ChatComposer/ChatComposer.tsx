import { Button, IconButton, cn } from '@gntik-ai/ui';
import { ArrowUp, Paperclip, Square, Upload, X } from 'lucide-react';
import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { AttachmentList, validateFiles, type AttachmentRejection, type ChatAttachment } from '../Attachment';
import { formatBytes } from '../utils/format';
import { useChatI18n } from '../utils/i18n';
import { chatComposerStyles as s } from './chatComposer.variants';

/** A file in the composer: name and size, plus optional type, preview, progress and error. */
export type ComposerAttachment = ChatAttachment;

export interface ChatComposerProps {
  /** Controlled text. Pair with `onValueChange`. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed text when the user sends. Uncontrolled composers clear themselves. */
  onSubmit: (text: string, attachments: ComposerAttachment[]) => void;
  /** A reply is streaming: Send turns into Stop, Enter no longer sends, Escape stops. */
  streaming?: boolean;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  /** Accessible name of the text box. */
  label?: string;
  /** Soft limit: shows a counter near the limit and blocks sending above it. */
  maxLength?: number;
  /** Attached files shown as removable chips (thumbnail, progress, error + retry). */
  attachments?: ComposerAttachment[];
  /**
   * Shows the attach button and enables paste and drag-and-drop of files; called with the
   * files that pass `accept`, `maxSize` and `maxFiles`.
   */
  onAttach?: (files: File[]) => void;
  onRemoveAttachment?: (id: string) => void;
  /** Shows Retry on attachments in the error state. */
  onRetryAttachment?: (id: string) => void;
  /** Allowed types, `<input accept>` syntax (e.g. ".pdf,.csv,image/*"). Also checked on paste and drop. */
  accept?: string;
  /** Largest allowed file, in bytes. */
  maxSize?: number;
  /** Most files attached at once. */
  maxFiles?: number;
  /** Called with the files that failed validation (their messages are also shown under the box). */
  onReject?: (rejections: AttachmentRejection[]) => void;
  /** Slot left of the send button, e.g. a model Select. */
  modelPicker?: ReactNode;
  /** Extra tools after the attach button. */
  tools?: ReactNode;
  /** Small line under the box. Defaults to the keyboard hint; pass null to hide it. */
  hint?: ReactNode;
  className?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

/**
 * Message box for a chat: grows with its content, Enter sends and Shift+Enter adds a line,
 * files (picked, pasted or dropped, validated against accept / maxSize / maxFiles) show as
 * removable chips with previews and upload progress, a model picker can sit in the toolbar, and while a reply
 * streams the send button becomes Stop (Escape also stops).
 */
export function ChatComposer({
  value,
  defaultValue = '',
  onValueChange,
  onSubmit,
  streaming = false,
  onStop,
  disabled = false,
  placeholder: placeholderProp,
  label: labelProp,
  maxLength,
  attachments = [],
  onAttach,
  onRemoveAttachment,
  onRetryAttachment,
  accept,
  maxSize,
  maxFiles,
  onReject,
  modelPicker,
  tools,
  hint,
  className,
  ref,
}: ChatComposerProps) {
  const { t, tc } = useChatI18n();
  const placeholder = placeholderProp ?? t('chat.placeholder');
  const label = labelProp ?? t('chat.messageLabel');
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const fileInput = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const canAttach = onAttach !== undefined && !disabled;

  const setText = (next: string) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  const length = text.length;
  const over = maxLength !== undefined && length > maxLength;
  const showCount = maxLength !== undefined && length >= maxLength * 0.8;
  const canSend = !disabled && !streaming && !over && (text.trim().length > 0 || attachments.length > 0);

  const send = () => {
    if (!canSend) return;
    onSubmit(text.trim(), attachments);
    if (value === undefined) setInner('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    } else if (e.key === 'Escape' && streaming && onStop) {
      e.preventDefault();
      onStop();
    }
  };

  const addFiles = (files: File[]) => {
    if (!onAttach || files.length === 0) return;
    const { accepted, rejected } = validateFiles(files, { accept, maxSize, maxFiles, current: attachments.length });
    const rejections: AttachmentRejection[] = rejected.map(({ file, reason }) => ({
      file,
      reason,
      message:
        reason === 'type'
          ? tc('chat.fileTypeNotAllowed', { name: file.name })
          : reason === 'size'
            ? tc('chat.fileTooLarge', { name: file.name, max: formatBytes(maxSize ?? 0) })
            : tc('chat.tooManyFiles', { max: maxFiles ?? 0 }),
    }));
    // One "too many files" line is enough.
    setErrors([...new Set(rejections.map((r) => r.message))]);
    if (rejections.length) onReject?.(rejections);
    if (accepted.length) onAttach(accepted);
  };

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = '';
  };

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData?.files ?? []);
    if (!canAttach || files.length === 0) return;
    e.preventDefault();
    addFiles(files);
  };

  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');
  const dropHandlers = canAttach
    ? {
        onDragEnter: (e: DragEvent<HTMLFormElement>) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        },
        onDragOver: (e: DragEvent<HTMLFormElement>) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        },
        onDragLeave: () => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragging(false);
        },
        onDrop: (e: DragEvent<HTMLFormElement>) => {
          e.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          addFiles(Array.from(e.dataTransfer?.files ?? []));
        },
      }
    : {};

  const hintNode =
    hint === undefined ? (
      <>
        <kbd className="font-sans">{t('kbd.enter')}</kbd> {t('chat.hintSend')} · <kbd className="font-sans">{t('chat.shiftEnter')}</kbd> {t('chat.hintNewLine')}
      </>
    ) : (
      hint
    );

  return (
    <div className={className}>
      <form
        className={s.root}
        data-disabled={disabled || undefined}
        data-dragging={dragging || undefined}
        {...dropHandlers}
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          send();
        }}
      >
        {dragging && (
          <div aria-hidden className={s.dropOverlay}>
            <Upload size={16} />
            {tc('chat.dropFiles')}
          </div>
        )}
        <AttachmentList
          attachments={attachments}
          onRemove={onRemoveAttachment}
          onRetry={onRetryAttachment}
          disabled={disabled}
          className={s.attachments}
        />
        <div role="alert" className={cn(errors.length > 0 && s.errors)}>
          {errors.length > 0 && (
            <>
              <ul className={s.errorList}>
                {errors.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <button type="button" className={s.errorDismiss} aria-label={t('common.dismiss')} onClick={() => setErrors([])}>
                <X size={12} aria-hidden />
              </button>
            </>
          )}
        </div>
        <textarea
          ref={ref}
          id={`${id}-input`}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={over || undefined}
          aria-describedby={showCount ? `${id}-count` : undefined}
          className={s.textarea}
        />
        <div className={s.toolbar}>
          <div className={s.tools}>
            {onAttach && (
              <>
                <IconButton size="sm" icon={Paperclip} label={t('chat.attach')} disabled={disabled} onClick={() => fileInput.current?.click()} />
                <input ref={fileInput} type="file" multiple hidden accept={accept} aria-label={t('chat.attach')} onChange={onFiles} />
              </>
            )}
            {tools}
          </div>
          <div className={s.end}>
            {showCount && (
              <span id={`${id}-count`} className={cn(s.count, over && s.countOver)}>
                {length}/{maxLength}
                {over && <span className="sr-only"> {t('chat.overLimit')}</span>}
              </span>
            )}
            {modelPicker}
            {streaming ? (
              <Button size="sm" variant="secondary" icon={Square} aria-label={t('chat.stop')} onClick={onStop} disabled={!onStop}>
                {t('common.stop')}
              </Button>
            ) : (
              <IconButton size="sm" variant="primary" icon={ArrowUp} label={t('chat.send')} type="submit" disabled={!canSend} />
            )}
          </div>
        </div>
      </form>
      {hintNode !== null && <p className={s.hint}>{hintNode}</p>}
    </div>
  );
}

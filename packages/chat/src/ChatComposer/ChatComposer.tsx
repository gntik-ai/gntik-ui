import { formatBytes, Button, IconButton, cn, useOs, useDropzone } from '@gntik-ai/ui';
import { ArrowUp, Paperclip, Square, Upload, X } from 'lucide-react';
import {
  useCallback,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { AttachmentList, validateFiles, type AttachmentRejection, type ChatAttachment } from '../Attachment';
import { useChatI18n } from '../utils/i18n';
import { chatComposerStyles as s } from './chatComposer.variants';

/** A file in the composer: name and size, plus optional type, preview, progress and error. */
export type ComposerAttachment = ChatAttachment;

export interface ChatComposerActions {
  focus(cursor?: 'start' | 'end' | 'all'): void;
  insert(text: string, at?: 'cursor' | 'start' | 'end'): void;
  /** Clears text only; attachments are untouched. */
  clear(): void;
  getValue(): string;
}

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
  /** Selectable text without sending or attachment editing; Stop remains available. */
  readOnly?: boolean;
  /** Enter sends by default; mod+enter accepts both Ctrl and Meta. */
  submitMode?: 'enter' | 'mod+enter';
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
  /** Inside the frame, above attachments and text. */
  header?: ReactNode;
  /** At the inline start of the text row (follows text direction). */
  prefix?: ReactNode;
  /** Inside the frame, below the toolbar and above the hint. */
  footer?: ReactNode;
  /** Extra tools after the attach button. */
  tools?: ReactNode;
  /** Small line under the box. Defaults to the keyboard hint; pass null to hide it. */
  hint?: ReactNode;
  className?: string;
  /** Text actions. Controlled parents should apply onValueChange synchronously for caret restoration. */
  actionsRef?: Ref<ChatComposerActions>;
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
  readOnly = false,
  submitMode = 'enter',
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
  header,
  prefix,
  footer,
  tools,
  hint,
  className,
  actionsRef,
  ref,
}: ChatComposerProps) {
  const { t, tc, locale } = useChatI18n();
  const os = useOs();
  const modEnter = submitMode === 'mod+enter';
  const placeholder = placeholderProp ?? t('chat.placeholder');
  const label = labelProp ?? t('chat.messageLabel');
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const textarea = useRef<HTMLTextAreaElement>(null);
  const pendingCaret = useRef<{ text: string; offset: number } | null>(null);
  const setTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      textarea.current = node;
      if (typeof ref === 'function') return ref(node);
      if (ref) ref.current = node;
    },
    [ref],
  );
  useLayoutEffect(() => {
    const pending = pendingCaret.current;
    if (pending && pending.text === text && textarea.current) {
      textarea.current.setSelectionRange(pending.offset, pending.offset);
      pendingCaret.current = null;
    }
  });
  const fileInput = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const canAttach = onAttach !== undefined && !disabled && !readOnly;

  const setText = (next: string) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  useImperativeHandle(actionsRef, () => ({
    focus(cursor) {
      const box = textarea.current;
      if (!box) return;
      box.focus();
      if (cursor === 'all') box.setSelectionRange(0, text.length);
      else if (cursor) {
        const offset = cursor === 'start' ? 0 : text.length;
        box.setSelectionRange(offset, offset);
      }
    },
    insert(inserted, at = 'cursor') {
      const box = textarea.current;
      if (!box) return;
      const start = at === 'start' ? 0 : at === 'end' ? text.length : box.selectionStart;
      const end = at === 'cursor' ? box.selectionEnd : start;
      const next = text.slice(0, start) + inserted + text.slice(end);
      const offset = start + inserted.length;
      pendingCaret.current = { text: next, offset };
      setText(next);
      box.focus();
      // A no-op insertion need not cause a render.
      if (next === text) {
        box.setSelectionRange(offset, offset);
        pendingCaret.current = null;
      }
    },
    clear() {
      pendingCaret.current = null;
      setText('');
    },
    getValue: () => text,
  }));

  const length = text.length;
  const over = maxLength !== undefined && length > maxLength;
  const showCount = maxLength !== undefined && length >= maxLength * 0.8;
  const canSend = !disabled && !readOnly && !streaming && !over && (text.trim().length > 0 || attachments.length > 0);

  const send = () => {
    if (!canSend) return;
    onSubmit(text.trim(), attachments);
    if (value === undefined) setInner('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const submitKey = submitMode === 'mod+enter' ? e.ctrlKey || e.metaKey : !e.shiftKey;
    if (e.key === 'Enter' && submitKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    } else if (e.key === 'Escape' && streaming && onStop) {
      e.preventDefault();
      onStop();
    }
  };

  const addFiles = (files: File[]) => {
    if (!canAttach || !onAttach || files.length === 0) return;
    const { accepted, rejected } = validateFiles(files, { accept, maxSize, maxFiles, current: attachments.length });
    const rejections: AttachmentRejection[] = rejected.map(({ file, reason }) => ({
      file,
      reason,
      message:
        reason === 'type'
          ? tc('chat.fileTypeNotAllowed', { name: file.name })
          : reason === 'size'
            ? tc('chat.fileTooLarge', { name: file.name, max: formatBytes(maxSize ?? 0, locale) })
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

  // Keep chat's validation order, current-attachment count and localized rejection API.
  const { rootProps, dragState } = useDropzone({
    activateOnClick: false,
    disabled: !canAttach,
    onDrop: addFiles,
  });
  const dropHandlers = canAttach
    ? {
        onDragEnter: rootProps.onDragEnter,
        onDragOver: rootProps.onDragOver,
        onDragLeave: rootProps.onDragLeave,
        onDrop: rootProps.onDrop,
      }
    : {};
  const dragging = dragState !== 'idle';

  const hintNode =
    hint === undefined ? (
      <>
        <kbd className="font-sans">
          {modEnter ? tc(os === 'macos' || os === 'ios' ? 'chat.cmdEnter' : 'chat.ctrlEnter') : t('kbd.enter')}
        </kbd>{' '}
        {t('chat.hintSend')} · <kbd className="font-sans">{modEnter ? t('kbd.enter') : t('chat.shiftEnter')}</kbd>{' '}
        {t('chat.hintNewLine')}
      </>
    ) : (
      hint
    );

  const textBox = (
    <textarea
      ref={setTextareaRef}
      id={`${id}-input`}
      rows={1}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      disabled={disabled}
      readOnly={readOnly || undefined}
      placeholder={placeholder}
      aria-label={label}
      aria-invalid={over || undefined}
      aria-describedby={showCount ? `${id}-count` : undefined}
      className={prefix != null ? cn(s.textarea, 'min-w-0 flex-1') : s.textarea}
    />
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
        {header}
        <AttachmentList
          attachments={attachments}
          onRemove={readOnly ? undefined : onRemoveAttachment}
          onRetry={readOnly ? undefined : onRetryAttachment}
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
              <button
                type="button"
                className={s.errorDismiss}
                aria-label={t('common.dismiss')}
                onClick={() => setErrors([])}
              >
                <X size={12} aria-hidden />
              </button>
            </>
          )}
        </div>
        {prefix != null ? (
          <div className={s.textRow}>
            <div className={s.prefix}>{prefix}</div>
            {textBox}
          </div>
        ) : (
          textBox
        )}
        <div className={s.toolbar}>
          <div className={s.tools}>
            {onAttach && !readOnly && (
              <>
                <IconButton
                  size="sm"
                  icon={Paperclip}
                  label={t('chat.attach')}
                  disabled={disabled}
                  onClick={() => fileInput.current?.click()}
                />
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  hidden
                  accept={accept}
                  aria-label={t('chat.attach')}
                  onChange={onFiles}
                />
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
              <Button
                size="sm"
                variant="secondary"
                icon={Square}
                aria-label={t('chat.stop')}
                onClick={onStop}
                disabled={!onStop}
              >
                {t('common.stop')}
              </Button>
            ) : (
              <IconButton
                size="sm"
                variant="primary"
                icon={ArrowUp}
                label={t('chat.send')}
                type="submit"
                disabled={!canSend}
              />
            )}
          </div>
        </div>
        {footer != null && <div className={s.footer}>{footer}</div>}
      </form>
      {hintNode !== null && <p className={s.hint}>{hintNode}</p>}
    </div>
  );
}

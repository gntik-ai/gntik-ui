import { Button, IconButton, cn } from '@gntik-ai/ui';
import { ArrowUp, FileText, Paperclip, Square, X } from 'lucide-react';
import { useId, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { formatBytes } from '../utils/format';
import { chatComposerStyles as s } from './chatComposer.variants';

export interface ComposerAttachment {
  id: string;
  name: string;
  /** Size in bytes. */
  size?: number;
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
  placeholder?: string;
  /** Accessible name of the text box. */
  label?: string;
  /** Soft limit: shows a counter near the limit and blocks sending above it. */
  maxLength?: number;
  /** Attached files shown as removable chips. */
  attachments?: ComposerAttachment[];
  /** Shows the attach button; called with the files the user picked. */
  onAttach?: (files: File[]) => void;
  onRemoveAttachment?: (id: string) => void;
  /** `accept` for the file picker (e.g. ".pdf,.csv,image/*"). */
  accept?: string;
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
 * files show as removable chips, a model picker can sit in the toolbar, and while a reply
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
  placeholder = 'Message the assistant…',
  label = 'Message',
  maxLength,
  attachments = [],
  onAttach,
  onRemoveAttachment,
  accept,
  modelPicker,
  tools,
  hint,
  className,
  ref,
}: ChatComposerProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const fileInput = useRef<HTMLInputElement>(null);

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

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAttach?.(files);
    e.target.value = '';
  };

  const hintNode =
    hint === undefined ? (
      <>
        <kbd className="font-sans">Enter</kbd> to send · <kbd className="font-sans">Shift + Enter</kbd> for a new line
      </>
    ) : (
      hint
    );

  return (
    <div className={className}>
      <form
        className={s.root}
        data-disabled={disabled || undefined}
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          send();
        }}
      >
        {attachments.length > 0 && (
          <ul aria-label="Attachments" className={s.attachments}>
            {attachments.map((a) => (
              <li key={a.id} className={s.chip}>
                <FileText size={13} aria-hidden className="shrink-0 text-muted-foreground" />
                <span className={s.chipName} title={a.name}>
                  {a.name}
                </span>
                {a.size !== undefined && <span className={s.chipSize}>{formatBytes(a.size)}</span>}
                {onRemoveAttachment && (
                  <button
                    type="button"
                    className={s.chipRemove}
                    aria-label={`Remove ${a.name}`}
                    disabled={disabled}
                    onClick={() => onRemoveAttachment(a.id)}
                  >
                    <X size={12} aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <textarea
          ref={ref}
          id={`${id}-input`}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
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
                <IconButton size="sm" icon={Paperclip} label="Attach files" disabled={disabled} onClick={() => fileInput.current?.click()} />
                <input ref={fileInput} type="file" multiple hidden accept={accept} aria-label="Attach files" onChange={onFiles} />
              </>
            )}
            {tools}
          </div>
          <div className={s.end}>
            {showCount && (
              <span id={`${id}-count`} className={cn(s.count, over && s.countOver)}>
                {length}/{maxLength}
                {over && <span className="sr-only"> characters, over the limit</span>}
              </span>
            )}
            {modelPicker}
            {streaming ? (
              <Button size="sm" variant="secondary" icon={Square} aria-label="Stop generating" onClick={onStop} disabled={!onStop}>
                Stop
              </Button>
            ) : (
              <IconButton size="sm" variant="primary" icon={ArrowUp} label="Send message" type="submit" disabled={!canSend} />
            )}
          </div>
        </div>
      </form>
      {hintNode !== null && <p className={s.hint}>{hintNode}</p>}
    </div>
  );
}

import { Field } from '@base-ui/react/field';
import { useEffect, useEffectEvent, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { useI18n } from '../../i18n';
import { cn } from '../../utils/cn';
import { validateFiles, type FileRejection } from '../../utils/accept-files';
import { IconButton } from '../Button/Button';
import { X } from 'lucide-react';
import { INPUT_ICON_SIZE, inputVariants } from '../Input/input.variants';
import { FILE_ICON, fileKind } from '../Thumbnail/file-kind';
import { fileInputVariants } from './file-input.variants';
import { useFileDialog, type UseFileDialogOptions } from './useFileDialog';

interface CommonFileInputProps extends Omit<UseFileDialogOptions, 'onChange' | 'multiple'> {
  maxSize?: number;
  clearable?: boolean;
  placeholder?: string;
  renderValue?: (files: File[]) => ReactNode;
  onReject?: (rejected: FileRejection[]) => void;
  name?: string;
  id?: string;
  invalid?: boolean;
  size?: 'auto' | 'sm' | 'md';
  className?: string;
}
export type FileInputProps = CommonFileInputProps &
  (
    | { multiple?: false; value?: File | null; defaultValue?: File | null; onValueChange?: (file: File | null) => void }
    | { multiple: true; value?: File[]; defaultValue?: File[]; onValueChange?: (files: File[]) => void }
  );
const toFiles = (value: File | File[] | null | undefined): File[] =>
  Array.isArray(value) ? value : value ? [value] : [];

/** A compact file field. The picker is separate from the named form input. */
export function FileInput(props: FileInputProps) {
  const { t, formatBytes } = useI18n();
  const valueId = useId();
  const fallbackId = useId();
  const control = useRef<HTMLButtonElement>(null);
  const namedInput = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState(() => toFiles(props.defaultValue));
  const files = props.value === undefined ? inner : toFiles(props.value);
  const syncNamed = (next: File[]) => {
    const input = namedInput.current;
    if (!input) return;
    input.value = '';
    // Native submission needs both a constructible DataTransfer and a writable files property.
    if (typeof DataTransfer === 'undefined') return;
    try {
      const transfer = new DataTransfer();
      for (const file of next) transfer.items.add(file);
      input.files = transfer.files;
    } catch {
      // Controlled display and callbacks still work on platforms without native file assignment.
    }
  };
  useEffect(() => {
    syncNamed(files);
  });
  const resetForm = useEffectEvent(() => {
    const next = props.value === undefined ? toFiles(props.defaultValue) : toFiles(props.value);
    if (props.value === undefined) setInner(next);
    syncNamed(next);
  });
  useEffect(() => {
    const form = control.current?.form;
    if (!form) return;
    const reset = (event: Event) => {
      // A trusted event can drain microtasks before bubbling or the native reset finishes.
      // Wait for both so preventDefault is final and unchanged values are restored too.
      setTimeout(() => {
        if (!event.defaultPrevented) resetForm();
      }, 0);
    };
    form.addEventListener('reset', reset);
    return () => form.removeEventListener('reset', reset);
  }, []);
  const s = fileInputVariants();
  const first = files[0];
  const FileIcon = first ? FILE_ICON[fileKind(first.name, first.type)] : undefined;
  const change = (next: File[]) => {
    if (props.value === undefined) setInner(next);
    if (props.multiple) props.onValueChange?.(next);
    else props.onValueChange?.(next[0] ?? null);
  };
  const { open } = useFileDialog({
    ...props,
    onChange: (selected) => {
      if (control.current?.disabled) return;
      const { accepted, rejected } = validateFiles(selected, { accept: props.accept, maxSize: props.maxSize });
      if (rejected.length) props.onReject?.(rejected);
      if (accepted.length) change(props.multiple ? accepted : accepted.slice(0, 1));
    },
  });
  return (
    <Field.Control
      id={props.id}
      disabled={props.disabled}
      render={(controlProps) => {
        const p = controlProps as ComponentProps<'button'>;
        const label = p['aria-labelledby'];
        return (
          <div className={cn(s.root(), props.className)}>
            <span id={fallbackId} hidden>
              {t(props.multiple ? 'fileInput.chooseMany' : 'fileInput.choose')}
            </span>
            <button
              ref={control}
              id={p.id}
              type="button"
              data-slot="file-input"
              disabled={p.disabled || props.disabled}
              aria-invalid={props.invalid || p['aria-invalid']}
              aria-describedby={p['aria-describedby']}
              aria-labelledby={`${label ?? fallbackId} ${valueId}`}
              onFocus={p.onFocus}
              onBlur={p.onBlur}
              onClick={open}
              className={cn(inputVariants({ size: props.size }).root(), s.control())}
            >
              <span id={valueId} className={s.value()}>
                {files.length ? (
                  props.renderValue ? (
                    <span className={s.name()}>{props.renderValue(files)}</span>
                  ) : files.length > 1 ? (
                    t('fileInput.count', { count: files.length })
                  ) : (
                    <>
                      {FileIcon && (
                        <FileIcon size={INPUT_ICON_SIZE[props.size ?? 'auto']} aria-hidden className={s.icon()} />
                      )}
                      <span className={s.name()}>{first?.name}</span>
                      <span className={s.size()}>{formatBytes(first?.size ?? 0)}</span>
                    </>
                  )
                ) : (
                  <span className={s.placeholder()}>{props.placeholder ?? t('fileInput.placeholder')}</span>
                )}
              </span>
            </button>
            {props.name && (
              <input
                ref={namedInput}
                type="file"
                hidden
                tabIndex={-1}
                name={props.name}
                multiple={props.multiple}
                disabled={p.disabled || props.disabled}
              />
            )}
            {props.clearable && files.length > 0 && (
              <IconButton
                type="button"
                icon={X}
                size={props.size}
                label={t('fileInput.clear')}
                disabled={p.disabled || props.disabled}
                onClick={() => {
                  change([]);
                  control.current?.focus();
                }}
              />
            )}
          </div>
        );
      }}
    />
  );
}

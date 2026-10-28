import { useRef, useState, useEffect, useEffectEvent, type HTMLAttributes, type InputHTMLAttributes } from 'react';
import { useI18n } from '../../i18n';
import {
  acceptRules,
  matchesAccept,
  validateFiles,
  type FileRejection,
  type FileValidationOptions,
} from '../../utils/accept-files';

type FileDrag = { dataTransfer: DataTransfer | null; preventDefault: () => void };

export type DragState = 'idle' | 'accept' | 'reject';
export interface UseDropzoneOptions extends FileValidationOptions {
  fullScreen?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  activateOnClick?: boolean;
  onDrop?: (accepted: File[], rejected: FileRejection[]) => void;
  onReject?: (rejected: FileRejection[]) => void;
}

export function useDropzone({
  accept,
  maxFiles,
  maxSize,
  fullScreen = false,
  multiple = true,
  onDrop,
  onReject,
  disabled = false,
  activateOnClick = true,
}: UseDropzoneOptions = {}) {
  const { t } = useI18n();
  const [announcement, setAnnouncement] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const open = () => {
    if (!disabled) input.current?.click();
  };
  const depth = useRef(0);
  const [state, setState] = useState<DragState>('idle');
  const [previousDisabled, setPreviousDisabled] = useState(disabled);
  // Disabling cancels transient state instead of reviving a stale drag on re-enable.
  if (disabled !== previousDisabled) {
    setPreviousDisabled(disabled);
    setState('idle');
  }
  const dragState = disabled ? 'idle' : state;
  const countLimit = multiple ? maxFiles : Math.min(maxFiles ?? 1, 1);
  const hasFiles = (event: FileDrag) => Array.from(event.dataTransfer?.types ?? []).includes('Files');
  const update = (event: FileDrag) => {
    const items = Array.from(event.dataTransfer?.items ?? []).filter((item) => item.kind === 'file');
    const mimeRules = acceptRules(accept).filter((rule) => !rule.startsWith('.'));
    const rejected =
      (countLimit !== undefined && items.length > countLimit) ||
      items.some(
        (item) => item.type !== '' && mimeRules.length > 0 && !matchesAccept({ name: '', type: item.type }, mimeRules),
      );
    setState(rejected ? 'reject' : 'accept');
  };
  const receive = (files: File[]) => {
    const { accepted, rejected } = validateFiles(files, { accept, maxSize, maxFiles: countLimit });
    onDrop?.(accepted, rejected);
    if (rejected.length) onReject?.(rejected);
    const message = [
      t('upload.added', { count: accepted.length }),
      rejected.length ? t('upload.rejected', { count: rejected.length }) : '',
    ]
      .filter(Boolean)
      .join(' ');
    // As in LiveAnnouncer, make repeated messages observable to assistive technology.
    setAnnouncement((previous) => (previous === message ? `${message}\u00a0` : message));
  };
  const rootProps: HTMLAttributes<HTMLElement> & { 'data-drag-state': DragState } = {
    role: activateOnClick ? 'button' : undefined,
    tabIndex: activateOnClick && !disabled ? 0 : undefined,
    'aria-disabled': disabled || undefined,
    'data-drag-state': dragState,
    'aria-label': activateOnClick ? t('dropzone.label') : undefined,
    onClick: activateOnClick ? open : undefined,
    onKeyDown: activateOnClick
      ? (event) => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            open();
          }
        }
      : undefined,
    onDragEnter(event) {
      if (disabled || !hasFiles(event)) return;
      event.preventDefault();
      depth.current += 1;
      update(event);
    },
    onDragOver(event) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
      if (disabled) return;
      update(event);
    },
    onDrop(event) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      if (disabled) return;
      depth.current = 0;
      setState('idle');
      receive(Array.from(event.dataTransfer?.files ?? []));
    },
    onDragLeave(event) {
      if (disabled || !hasFiles(event)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setState('idle');
    },
  };
  const windowDrag = useEffectEvent((event: globalThis.DragEvent) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    if (event.type === 'drop') {
      depth.current = 0;
      setState('idle');
      receive(Array.from(event.dataTransfer?.files ?? []));
    } else if (event.type === 'dragleave') {
      // A direct window leave ends the drag; page/overlay leaves use the depth counter.
      if (event.target === window) {
        if (!event.relatedTarget) {
          depth.current = 0;
          setState('idle');
          return;
        }
      }
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setState('idle');
    } else {
      if (event.type === 'dragenter') depth.current += 1;
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      update(event);
    }
  });
  const windowKey = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (event.key === 'Escape') {
      depth.current = 0;
      setState('idle');
    }
  });
  useEffect(() => {
    depth.current = 0;
    if (!fullScreen || disabled) return;
    const events = ['dragenter', 'dragover', 'dragleave', 'drop'] as const;
    const onDrag = (event: globalThis.DragEvent) => windowDrag(event);
    const onKey = (event: globalThis.KeyboardEvent) => windowKey(event);
    for (const type of events) window.addEventListener(type, onDrag);
    window.addEventListener('keydown', onKey);
    return () => {
      for (const type of events) window.removeEventListener(type, onDrag);
      window.removeEventListener('keydown', onKey);
    };
  }, [fullScreen, disabled]);
  if (fullScreen) {
    rootProps.onDragEnter = undefined;
    rootProps.onDragOver = undefined;
    rootProps.onDragLeave = undefined;
    rootProps.onDrop = undefined;
  }
  const inputProps: InputHTMLAttributes<HTMLInputElement> & { ref: typeof input } = {
    ref: input,
    type: 'file',
    hidden: true,
    tabIndex: -1,
    multiple,
    disabled,
    accept: typeof accept === 'string' ? accept : accept?.join(','),
    onChange(event) {
      const files = Array.from(event.currentTarget.files ?? []);
      event.currentTarget.value = '';
      if (!disabled && files.length) receive(files);
    },
  };
  return { rootProps, inputProps, dragState, announcement, open };
}

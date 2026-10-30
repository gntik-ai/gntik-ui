import { Button, IconButton, Progress, cn, useI18n, useDropzone, validateFiles } from '@gntik-ai/ui';
import { CircleAlert, FileText, RotateCcw, Upload, X } from '@gntik-ai/icons';
import { useId, useRef, useState, useLayoutEffect, type DragEvent } from 'react';
import { simulateUpload, uploadItems, type UploadItem } from './fixtures';

export type { UploadItem, UploadStatus } from './fixtures';

export interface FileUploadPanelLabels {
  label: string;
  drop: string;
  browse: string;
  files: string;
  failed: string;
  typeRejected: string;
  hint: (types: string, size: string) => string;
  tooLarge: (size: string) => string;
  done: (name: string) => string;
  error: (name: string) => string;
  added: (count: number) => string;
  rejected: (count: number) => string;
  removed: (name: string) => string;
  uploading: (name: string) => string;
  notUploaded: (error: string) => string;
  uploaded: (size: string) => string;
  retry: (name: string) => string;
  remove: (name: string) => string;
  ready?: (size: string) => string;
  cancel?: (name: string) => string;
  cancelled?: (name: string) => string;
  removeFailed?: (name: string) => string;
}

export interface UploadChange {
  reason: 'add' | 'progress' | 'done' | 'error' | 'remove' | 'cancel';
  ids: string[];
}

export interface FileUploadPanelProps {
  labels?: Partial<FileUploadPanelLabels>;
  /** Accepted types, as for `<input accept>` (".csv,.json", "image/*"). */
  accept?: string;
  /** Maximum size per file in bytes. */
  maxSize?: number;
  multiple?: boolean;
  /** Initial list (e.g. files already uploaded). */
  defaultFiles?: UploadItem[];
  /** Controlled list; changes are requested through onFilesChange. */
  files?: UploadItem[];
  onFilesChange?: (files: UploadItem[], change: UploadChange) => void;
  /** Manual mode retains File objects for a later form submission. */
  uploadMode?: 'auto' | 'manual';
  /** Runs after built-in validation. False drops, a File replaces, and rejection adds a non-retryable error. */
  beforeUpload?: (file: File) => boolean | File | void | Promise<boolean | File | void>;
  /** Uploads one file and reports progress (0–100). Defaults to a demo simulation. */
  onUpload?: (
    file: File,
    onProgress: (pct: number) => void,
    context: { signal: AbortSignal; id: string },
  ) => Promise<void>;
  /** Called before removal; false or rejection keeps the row. */
  onRemove?: (item: UploadItem) => void | boolean | Promise<void | boolean>;
  /** Visible label of the panel. */
  label?: string;
  /** Hint under the drop text; defaults to the accepted types and size limit. */
  hint?: string;
  disabled?: boolean;
  className?: string;
}

let uid = 0;
const nextId = () => `upload-${++uid}`;

/**
 * Drop zone with a Browse button, accept and size validation, and a file list with progress,
 * retry and remove. Rejected files stay in the list with the reason.
 */
export function FileUploadPanel({
  labels,
  accept = '.csv,.json,.jsonl,.yaml,.pdf',
  maxSize = 25_000_000,
  multiple = true,
  defaultFiles = uploadItems,
  files,
  onFilesChange,
  uploadMode = 'auto',
  beforeUpload,
  onUpload = simulateUpload,
  onRemove,
  label: labelProp,
  hint,
  disabled = false,
  className,
}: FileUploadPanelProps) {
  const { t, formatBytes } = useI18n();
  const label = labelProp ?? labels?.label ?? t('upload.label');
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [sources, setSources] = useState<Record<string, File>>({});
  const [internalItems, setItems] = useState<UploadItem[]>(defaultFiles);
  const items = files ?? internalItems;
  const current = useRef(items);
  const mounted = useRef(false);
  const attempts = useRef(new Map<string, AbortController>());
  useLayoutEffect(() => {
    mounted.current = true;
    const active = attempts.current;
    return () => {
      mounted.current = false;
      for (const controller of active.values()) controller.abort();
      active.clear();
    };
  }, []);
  useLayoutEffect(() => {
    current.current = items;
  }, [items]);
  const changeItems = (next: UploadItem[], reason: UploadChange['reason'], ids: string[]) => {
    // Accumulate callbacks in the same batch until the parent supplies its next list.
    current.current = next;
    if (files === undefined) {
      setItems(next);
    }
    onFilesChange?.(next, { reason, ids });
  };
  const { rootProps, dragState } = useDropzone({ accept, maxSize, disabled, activateOnClick: false });
  const dragging = dragState !== 'idle';
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const removalRequests = useRef(new Set<string>());
  const [preparing, setPreparing] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const hintText =
    hint ??
    labels?.hint?.(
      accept
        .split(',')
        .map((a) => a.replace('.', '').toUpperCase())
        .join(' · '),
      formatBytes(maxSize),
    ) ??
    t('upload.hint', {
      types: accept
        .split(',')
        .map((a) => a.replace('.', '').toUpperCase())
        .join(' · '),
      size: formatBytes(maxSize),
    });

  const patch = (itemId: string, next: Partial<UploadItem>, reason: UploadChange['reason']) =>
    changeItems(
      current.current.map((x) => (x.id === itemId ? { ...x, ...next } : x)),
      reason,
      [itemId],
    );

  const start = (itemId: string, file: File) => {
    attempts.current.get(itemId)?.abort();
    const controller = new AbortController();
    attempts.current.set(itemId, controller);
    const active = () => mounted.current && !controller.signal.aborted && attempts.current.get(itemId) === controller;
    let previous = 0;
    const failed = (error: unknown) => {
      if (!active()) return;
      attempts.current.delete(itemId);
      patch(
        itemId,
        { status: 'error', error: error instanceof Error ? error.message : (labels?.failed ?? t('upload.failed')) },
        'error',
      );
      setAnnouncement(labels?.error?.(file.name) ?? t('upload.error', { name: file.name }));
    };
    try {
      void onUpload(
        file,
        (pct) => {
          if (!active()) return;
          const progress = Math.floor(pct);
          // Keep the existing uncontrolled display precise when there is no list observer.
          const legacyProgress = files === undefined && onFilesChange === undefined;
          if (previous === progress && !legacyProgress) return;
          previous = progress;
          patch(itemId, { progress: legacyProgress ? pct : progress }, 'progress');
        },
        { signal: controller.signal, id: itemId },
      ).then(() => {
        if (!active()) return;
        attempts.current.delete(itemId);
        patch(itemId, { status: 'done', progress: 100 }, 'done');
        setAnnouncement(labels?.done?.(file.name) ?? t('upload.done', { name: file.name }));
      }, failed);
    } catch (error) {
      failed(error);
    }
  };

  const addFiles = (list: FileList | File[]) => {
    const picked = Array.from(list).slice(0, multiple ? undefined : 1);
    const { rejected: rejectedFiles } = validateFiles(picked, { accept, maxSize });
    const reasons = new Map(rejectedFiles.map((item) => [item.file, item.reasons]));
    type Prepared = { file: File; error?: string } | null;
    const prepared: Prepared[] = picked.map((file) => ({
      file,
      error: reasons.get(file)?.includes('type')
        ? (labels?.typeRejected ?? t('upload.typeRejected'))
        : reasons.get(file)?.includes('size')
          ? (labels?.tooLarge?.(formatBytes(maxSize)) ?? t('upload.tooLarge', { size: formatBytes(maxSize) }))
          : undefined,
    }));
    const append = (results: Prepared[]) => {
      if (!mounted.current) return;
      const added: UploadItem[] = [];
      const toStart: Array<[string, File]> = [];
      const kept: Record<string, File> = {};
      for (const result of results) {
        if (!result) continue;
        const { file, error } = result;
        const itemId = nextId();
        added.push({
          id: itemId,
          file,
          name: file.name,
          size: file.size,
          progress: 0,
          status: error !== undefined ? 'error' : uploadMode === 'manual' ? 'pending' : 'uploading',
          error,
        });
        if (error === undefined) {
          kept[itemId] = file;
          if (uploadMode === 'auto') toStart.push([itemId, file]);
        }
      }
      if (!added.length) return;
      changeItems(
        multiple ? [...current.current, ...added] : added,
        'add',
        added.map((item) => item.id),
      );
      setSources((current) => ({ ...current, ...kept }));
      const rejected = added.filter((a) => a.status === 'error').length;
      setAnnouncement(
        [
          labels?.added?.(added.length - rejected) ?? t('upload.added', { count: added.length - rejected }),
          rejected ? (labels?.rejected?.(rejected) ?? t('upload.rejected', { count: rejected })) : '',
        ]
          .filter(Boolean)
          .join(' '),
      );
      for (const [itemId, file] of toStart) start(itemId, file);
    };
    if (!beforeUpload) {
      append(prepared);
      return;
    }
    setPreparing((count) => count + 1);
    void Promise.all(
      prepared.map(async (result): Promise<Prepared> => {
        if (!result || result.error !== undefined) return result;
        try {
          const transformed = await beforeUpload(result.file);
          return transformed === false ? null : { file: transformed instanceof File ? transformed : result.file };
        } catch (error) {
          return {
            file: result.file,
            error: error instanceof Error ? error.message : (labels?.failed ?? t('upload.failed')),
          };
        }
      }),
    ).then((results) => {
      if (!mounted.current) return;
      setPreparing((count) => count - 1);
      append(results);
    });
  };

  const completeRemoval = (item: UploadItem) => {
    if (!mounted.current) return;
    setSources((current) => Object.fromEntries(Object.entries(current).filter(([k]) => k !== item.id)));
    const cancelling = item.status === 'uploading' && (item.file !== undefined || attempts.current.has(item.id));
    attempts.current.get(item.id)?.abort();
    attempts.current.delete(item.id);
    changeItems(
      current.current.filter((x) => x.id !== item.id),
      cancelling ? 'cancel' : 'remove',
      [item.id],
    );
    setAnnouncement(
      cancelling
        ? (labels?.cancelled?.(item.name) ?? t('upload.cancelled', { name: item.name }))
        : (labels?.removed?.(item.name) ?? t('upload.removed', { name: item.name })),
    );
  };

  const remove = (item: UploadItem) => {
    if (removalRequests.current.has(item.id)) return;
    const failed = () => {
      if (mounted.current)
        setAnnouncement(labels?.removeFailed?.(item.name) ?? t('upload.removeFailed', { name: item.name }));
    };
    try {
      const result = onRemove?.(item);
      if (result && typeof result === 'object' && 'then' in result) {
        removalRequests.current.add(item.id);
        setRemoving(new Set(removalRequests.current));
        void result
          .then((allowed) => {
            if (allowed !== false) completeRemoval(item);
          }, failed)
          .finally(() => {
            removalRequests.current.delete(item.id);
            if (mounted.current) setRemoving(new Set(removalRequests.current));
          });
      } else if (result !== false) completeRemoval(item);
    } catch {
      failed();
    }
  };

  const retryFor = (itemId: string) => {
    const file = sources[itemId];
    return file
      ? () => {
          patch(itemId, { status: 'uploading', progress: 0, error: undefined }, 'progress');
          start(itemId, file);
        }
      : undefined;
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    rootProps.onDrop?.(e);
    if (!disabled && Array.from(e.dataTransfer?.types ?? []).includes('Files') && e.dataTransfer.files.length)
      addFiles(e.dataTransfer.files);
  };

  return (
    <div
      role="group"
      aria-busy={preparing > 0 || undefined}
      aria-labelledby={`${id}-label`}
      className={cn('w-full', className)}
    >
      <div id={`${id}-label`} className="mb-2 text-[13px] font-medium text-foreground">
        {label}
      </div>
      <div
        {...rootProps}
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        onDrop={onDrop}
        className={cn(
          'rounded-xl border-2 border-dashed border-border bg-background/40 px-6 py-8 text-center transition-colors motion-reduce:transition-none',
          'data-[disabled]:opacity-60',
          dragState === 'accept' && 'border-primary bg-primary/10',
          dragState === 'reject' && 'border-destructive bg-destructive/10 text-destructive-text',
        )}
      >
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
          <Upload size={22} aria-hidden />
        </div>
        <p className="mt-4 text-[13.5px] text-foreground">{labels?.drop ?? t('upload.drop')}</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-2"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          aria-describedby={`${id}-hint`}
        >
          {labels?.browse ?? t('upload.browse')}
        </Button>
        <p id={`${id}-hint`} className="mt-3 font-mono text-[11.5px] text-muted-foreground">
          {hintText}
        </p>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {items.length > 0 && (
        <ul aria-label={labels?.files ?? t('upload.files')} className="mt-4 space-y-2">
          {items.map((item) => (
            <FileRow
              key={item.id}
              labels={labels}
              item={item}
              cancellable={item.status === 'uploading' && (item.file !== undefined || sources[item.id] !== undefined)}
              removing={removing.has(item.id)}
              onRemove={() => remove(item)}
              onRetry={retryFor(item.id)}
            />
          ))}
        </ul>
      )}
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

function FileRow({
  item,
  onRemove,
  onRetry,
  cancellable,
  removing,
  labels,
}: {
  item: UploadItem;
  onRemove: () => void;
  onRetry?: () => void;
  cancellable: boolean;
  removing: boolean;
  labels?: Partial<FileUploadPanelLabels>;
}) {
  const { t, formatBytes } = useI18n();
  const err = item.status === 'error';
  const done = item.status === 'done';
  // Pending rows use binary sizing with the compact labels required by the deferred-upload API.
  const readySize =
    item.status === 'pending' ? formatBytes(item.size, { base: 1024 }).replace(/([KMGTPE])iB\b/, '$1B') : '';
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 shadow-sm">
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-md',
          err
            ? 'bg-destructive/12 text-destructive-chip-text'
            : done
              ? 'bg-primary/14 text-primary-chip-text'
              : 'bg-secondary text-muted-foreground',
        )}
      >
        {err ? <CircleAlert size={17} aria-hidden /> : <FileText size={17} aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-foreground">{item.name}</div>
        {item.status === 'uploading' ? (
          <Progress
            value={item.progress}
            size="sm"
            aria-label={labels?.uploading?.(item.name) ?? t('upload.uploading', { name: item.name })}
            className="mt-1.5"
          />
        ) : (
          <div className={cn('mt-0.5 font-mono text-[11px]', err ? 'text-destructive-text' : 'text-muted-foreground')}>
            {err
              ? (labels?.notUploaded?.(item.error ?? labels?.failed ?? t('upload.failed')) ??
                t('upload.notUploaded', { error: item.error ?? labels?.failed ?? t('upload.failed') }))
              : item.status === 'pending'
                ? (labels?.ready?.(readySize) ?? t('upload.ready', { size: readySize }))
                : (labels?.uploaded?.(formatBytes(item.size)) ??
                  t('upload.uploaded', { size: formatBytes(item.size) }))}
          </div>
        )}
      </div>
      {item.status === 'uploading' && (
        <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground tabular-nums">
          {Math.round(item.progress)}%
        </span>
      )}
      {err && onRetry && (
        <IconButton
          icon={RotateCcw}
          size="sm"
          label={labels?.retry?.(item.name) ?? t('upload.retry', { name: item.name })}
          onClick={onRetry}
        />
      )}
      <IconButton
        icon={X}
        size="sm"
        label={
          cancellable
            ? (labels?.cancel?.(item.name) ?? t('upload.cancel', { name: item.name }))
            : (labels?.remove?.(item.name) ?? t('common.removeItem', { label: item.name }))
        }
        onClick={onRemove}
        disabled={removing}
      />
    </li>
  );
}

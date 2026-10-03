import { Button, IconButton, Progress, cn } from '@gntik-ai/ui';
import { CircleAlert, FileText, RotateCcw, Upload, X } from '@gntik-ai/icons';
import { useId, useRef, useState, type DragEvent } from 'react';
import { acceptsFile, formatBytes, simulateUpload, uploadItems, type UploadItem } from './fixtures';

export type { UploadItem, UploadStatus } from './fixtures';

export interface FileUploadPanelProps {
  /** Accepted types, as for `<input accept>` (".csv,.json", "image/*"). */
  accept?: string;
  /** Maximum size per file in bytes. */
  maxSize?: number;
  multiple?: boolean;
  /** Initial list (e.g. files already uploaded). */
  defaultFiles?: UploadItem[];
  /** Uploads one file and reports progress (0–100). Defaults to a demo simulation. */
  onUpload?: (file: File, onProgress: (pct: number) => void) => Promise<void>;
  onRemove?: (item: UploadItem) => void;
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
  accept = '.csv,.json,.jsonl,.yaml,.pdf',
  maxSize = 25 * 1024 * 1024,
  multiple = true,
  defaultFiles = uploadItems,
  onUpload = simulateUpload,
  onRemove,
  label = 'Upload files',
  hint,
  disabled = false,
  className,
}: FileUploadPanelProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [sources, setSources] = useState<Record<string, File>>({});
  const [items, setItems] = useState<UploadItem[]>(defaultFiles);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const hintText = hint ?? `${accept.split(',').map((a) => a.replace('.', '').toUpperCase()).join(' · ')} · max ${formatBytes(maxSize)} per file`;

  const patch = (itemId: string, next: Partial<UploadItem>) => setItems((list) => list.map((x) => (x.id === itemId ? { ...x, ...next } : x)));

  const start = (itemId: string, file: File) => {
    patch(itemId, { status: 'uploading', progress: 0, error: undefined });
    onUpload(file, (pct) => patch(itemId, { progress: pct })).then(
      () => {
        patch(itemId, { status: 'done', progress: 100 });
        setAnnouncement(`${file.name} uploaded.`);
      },
      (e: unknown) => {
        patch(itemId, { status: 'error', error: e instanceof Error ? e.message : 'Upload failed' });
        setAnnouncement(`${file.name} failed to upload.`);
      },
    );
  };

  const addFiles = (list: FileList | File[]) => {
    const files = Array.from(list).slice(0, multiple ? undefined : 1);
    const added: UploadItem[] = [];
    const toStart: Array<[string, File]> = [];
    const kept: Record<string, File> = {};
    for (const file of files) {
      const itemId = nextId();
      const error = !acceptsFile(file, accept) ? 'File type not accepted' : file.size > maxSize ? `Exceeds the ${formatBytes(maxSize)} limit` : undefined;
      added.push({ id: itemId, name: file.name, size: file.size, progress: 0, status: error ? 'error' : 'uploading', error });
      if (!error) {
        kept[itemId] = file;
        toStart.push([itemId, file]);
      }
    }
    setItems((current) => (multiple ? [...current, ...added] : added));
    setSources((current) => ({ ...current, ...kept }));
    const rejected = added.filter((a) => a.error).length;
    setAnnouncement(`${added.length - rejected} ${added.length - rejected === 1 ? 'file' : 'files'} added.${rejected ? ` ${rejected} rejected.` : ''}`);
    for (const [itemId, file] of toStart) start(itemId, file);
  };

  const remove = (item: UploadItem) => {
    setSources((current) => Object.fromEntries(Object.entries(current).filter(([k]) => k !== item.id)));
    setItems((list) => list.filter((x) => x.id !== item.id));
    setAnnouncement(`${item.name} removed.`);
    onRemove?.(item);
  };

  const retryFor = (itemId: string) => {
    const file = sources[itemId];
    return file ? () => start(itemId, file) : undefined;
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div role="group" aria-labelledby={`${id}-label`} className={cn('w-full', className)}>
      <div id={`${id}-label`} className="mb-2 text-[13px] font-medium text-foreground">
        {label}
      </div>
      <div
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'rounded-xl border-2 border-dashed border-border bg-background/40 px-6 py-8 text-center transition-colors motion-reduce:transition-none',
          'data-[dragging]:border-primary data-[dragging]:bg-primary/10 data-[disabled]:opacity-60',
        )}
      >
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground ring-1 ring-border">
          <Upload size={22} aria-hidden />
        </div>
        <p className="mt-4 text-[13.5px] text-foreground">Drag files here or</p>
        <Button variant="secondary" size="sm" className="mt-2" disabled={disabled} onClick={() => inputRef.current?.click()} aria-describedby={`${id}-hint`}>
          Browse files
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
        <ul aria-label="Files" className="mt-4 space-y-2">
          {items.map((item) => (
            <FileRow key={item.id} item={item} onRemove={() => remove(item)} onRetry={retryFor(item.id)} />
          ))}
        </ul>
      )}
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

function FileRow({ item, onRemove, onRetry }: { item: UploadItem; onRemove: () => void; onRetry?: () => void }) {
  const err = item.status === 'error';
  const done = item.status === 'done';
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 shadow-sm">
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-md', err ? 'bg-destructive/12 text-destructive-text' : done ? 'bg-primary/14 text-primary-text' : 'bg-secondary text-muted-foreground')}>
        {err ? <CircleAlert size={17} aria-hidden /> : <FileText size={17} aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-foreground">{item.name}</div>
        {item.status === 'uploading' ? (
          <Progress value={item.progress} size="sm" aria-label={`Uploading ${item.name}`} className="mt-1.5" />
        ) : (
          <div className={cn('mt-0.5 font-mono text-[11px]', err ? 'text-destructive-text' : 'text-muted-foreground')}>
            {err ? `${item.error ?? 'Upload failed'} · not uploaded` : `${formatBytes(item.size)} · uploaded`}
          </div>
        )}
      </div>
      {item.status === 'uploading' && <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground tabular-nums">{Math.round(item.progress)}%</span>}
      {err && onRetry && <IconButton icon={RotateCcw} size="sm" label={`Retry ${item.name}`} onClick={onRetry} />}
      <IconButton icon={X} size="sm" label={`Remove ${item.name}`} onClick={onRemove} />
    </li>
  );
}

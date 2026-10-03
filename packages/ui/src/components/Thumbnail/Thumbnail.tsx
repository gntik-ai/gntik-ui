import { AlertCircle, X } from 'lucide-react';
import { Children, isValidElement, useId, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { FILE_ICON, fileExtension, fileKind, formatBytes } from './file-kind';
import { thumbnailVariants } from './thumbnail.variants';

export type ThumbnailStatus = 'idle' | 'uploading' | 'done' | 'error';

export interface ThumbnailLabels {
  /** Remove button name; receives the file name. */
  remove: (name: string) => string;
  /** Progress bar name; receives the file name. */
  uploading: (name: string) => string;
  /** Default error text when `error` is `true`. */
  error: string;
  /** Retry action text. */
  retry: string;
}

const DEFAULT_LABELS: ThumbnailLabels = {
  remove: (name) => `Remove ${name}`,
  uploading: (name) => `Uploading ${name}`,
  error: 'Upload failed',
  retry: 'Retry',
};

export interface ThumbnailProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'> {
  className?: string;
  ref?: Ref<HTMLElement>;
  /** File name; the caption and the accessible name. */
  name: string;
  /** Size in bytes, shown as "2.4 MB". */
  size?: number;
  /** MIME type; picks the icon (falls back to the extension). */
  type?: string;
  /** Image preview URL. Without it the file-type icon shows. */
  src?: string;
  /** Custom preview (replaces image and icon). */
  preview?: ReactNode;
  /** Upload progress 0–100: shows the shimmer and a progress bar. `null` = indeterminate. */
  progress?: number | null;
  /** Error state; a string replaces the default message. */
  error?: boolean | string;
  /** Shows the remove button. */
  onRemove?: () => void;
  /** Shows a retry action in the error state. */
  onRetry?: () => void;
  /** BCP 47 locale for the size. */
  locale?: string;
  /** Built-in strings (English defaults). */
  labels?: Partial<ThumbnailLabels>;
}

/**
 * File or image preview tile (a `<figure>` captioned with name and size): image or file-type
 * icon, upload progress with a reduced-motion-safe shimmer, error state and a remove button.
 */
export function Thumbnail({
  name,
  size,
  type,
  src,
  preview,
  progress,
  error,
  onRemove,
  onRetry,
  locale,
  labels: labelsProp,
  className,
  ...props
}: ThumbnailProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const nameId = useId();
  const uploading = progress !== undefined && !error && (progress === null || progress < 100);
  const status: ThumbnailStatus = error ? 'error' : uploading ? 'uploading' : progress !== undefined ? 'done' : 'idle';
  const s = thumbnailVariants({ status });
  const kind = fileKind(name, type);
  const Icon = error ? AlertCircle : FILE_ICON[kind];
  const ext = fileExtension(name);
  const errorText = typeof error === 'string' ? error : labels.error;
  const pct = progress == null ? undefined : Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <figure aria-labelledby={nameId} className={cn(s.root(), className)} data-status={status} aria-busy={uploading || undefined} {...props}>
      <div className={s.preview()}>
        {preview ?? (src && !error ? <img src={src} alt="" className={s.image()} /> : <Icon size={26} strokeWidth={1.6} aria-hidden className={s.icon()} />)}
        {!src && !preview && !error && ext && (
          <span aria-hidden className={s.ext()}>
            {ext}
          </span>
        )}
        {uploading && <span aria-hidden className={s.shimmer()} />}
        {uploading && (
          <div
            role="progressbar"
            aria-label={labels.uploading(name)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            className={s.progress()}
          >
            <span className={cn(s.progressBar(), pct === undefined && 'w-2/5 animate-pulse motion-reduce:animate-none')} style={pct === undefined ? undefined : { width: `${pct}%` }} />
          </div>
        )}
      </div>
      <figcaption className={s.caption()}>
        <span id={nameId} className={s.name()} title={name}>
          {name}
        </span>
        <span className={s.meta()}>
          {error ? (
            <>
              {errorText}
              {onRetry && (
                <>
                  {' · '}
                  <button type="button" onClick={onRetry} className={s.retry()}>
                    {labels.retry}
                  </button>
                </>
              )}
            </>
          ) : uploading && pct !== undefined ? (
            `${pct}%${size !== undefined ? ` · ${formatBytes(size, locale)}` : ''}`
          ) : size !== undefined ? (
            formatBytes(size, locale)
          ) : (
            (ext ?? '')
          )}
        </span>
      </figcaption>
      {onRemove && (
        <button type="button" aria-label={labels.remove(name)} onClick={onRemove} className={s.remove()}>
          <X size={13} strokeWidth={2.2} aria-hidden />
        </button>
      )}
    </figure>
  );
}

export interface ThumbnailListProps extends Omit<HTMLAttributes<HTMLUListElement>, 'className'> {
  className?: string;
  ref?: Ref<HTMLUListElement>;
  children?: ReactNode;
}

/** Wrapping list of thumbnails (each child becomes a list item). Label it with `aria-label`. */
export function ThumbnailList({ className, children, ...props }: ThumbnailListProps) {
  const s = thumbnailVariants();
  return (
    <ul className={cn(s.list(), className)} {...props}>
      {Children.toArray(children)
        .filter(isValidElement)
        .map((child) => (
          <li key={child.key}>{child}</li>
        ))}
    </ul>
  );
}

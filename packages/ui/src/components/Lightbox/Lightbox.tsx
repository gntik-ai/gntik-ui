import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { ChevronLeft, ChevronRight, Play, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { lightboxVariants } from './lightbox.variants';

export interface LightboxItem {
  src: string;
  /** Alternative text (images) or accessible name (videos). */
  alt: string;
  type?: 'image' | 'video';
  caption?: ReactNode;
  /** Thumbnail URL (defaults to `src` for images, `poster` for videos). */
  thumbnail?: string;
  poster?: string;
  /** WebVTT captions for videos. */
  captions?: string;
}

export interface LightboxLabels {
  title: string;
  close: string;
  previous: string;
  next: string;
  zoomIn: string;
  zoomOut: string;
  thumbnails: string;
  counter: (index: number, total: number) => string;
  status: (index: number, total: number, alt: string) => string;
  thumbnail: (index: number, alt: string) => string;
}

const defaultLabels: LightboxLabels = {
  title: 'Media viewer',
  close: 'Close viewer',
  previous: 'Previous',
  next: 'Next',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  thumbnails: 'Thumbnails',
  counter: (i, n) => `${i + 1} / ${n}`,
  status: (i, n, alt) => `${i + 1} of ${n}: ${alt}`,
  thumbnail: (i, alt) => `Show ${i + 1}: ${alt}`,
};

export interface LightboxProps {
  items: LightboxItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Wrap from the last item to the first. */
  loop?: boolean;
  showThumbnails?: boolean;
  /** Largest zoom factor (steps of 0.5). */
  maxZoom?: number;
  labels?: Partial<LightboxLabels>;
  container?: BaseDialog.Portal.Props['container'];
}

/**
 * Full-screen image and video viewer on Base UI Dialog: previous / next, zoom with a scrollable
 * stage, captions and a thumbnail strip. Arrow keys move (mirrored in RTL), +/−/0 zoom, Escape
 * closes and focus returns to whatever opened it.
 */
export function Lightbox({
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  index,
  defaultIndex = 0,
  onIndexChange,
  loop = false,
  showThumbnails = true,
  maxZoom = 4,
  labels: labelsProp,
  container,
}: LightboxProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [innerIndex, setInnerIndex] = useState(defaultIndex);
  const [zoomState, setZoomState] = useState({ at: -1, zoom: 1 });
  const thumbsRef = useRef<HTMLDivElement | null>(null);
  const isOpen = open ?? innerOpen;
  const total = items.length;
  const current = Math.min(Math.max(index ?? innerIndex, 0), Math.max(total - 1, 0));
  const item = items[current];
  const zoom = zoomState.at === current ? zoomState.zoom : 1;
  const isVideo = item?.type === 'video';
  const s = lightboxVariants();

  const setOpen = (next: boolean) => {
    setInnerOpen(next);
    onOpenChange?.(next);
  };
  const go = (i: number) => {
    const next = loop ? (i + total) % total : Math.min(Math.max(i, 0), total - 1);
    if (next === current || total === 0) return;
    setInnerIndex(next);
    onIndexChange?.(next);
  };
  const setZoom = (z: number) => setZoomState({ at: current, zoom: Math.min(Math.max(z, 1), maxZoom) });

  useEffect(() => {
    if (!isOpen) return;
    thumbsRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  }, [isOpen, current]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'VIDEO') return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const actions: Record<string, () => void> = {
      [rtl ? 'ArrowLeft' : 'ArrowRight']: () => go(current + 1),
      [rtl ? 'ArrowRight' : 'ArrowLeft']: () => go(current - 1),
      Home: () => go(0),
      End: () => go(total - 1),
      '+': () => setZoom(zoom + 0.5),
      '=': () => setZoom(zoom + 0.5),
      '-': () => setZoom(zoom - 0.5),
      '0': () => setZoom(1),
    };
    const action = actions[e.key];
    if (!action || e.altKey || e.ctrlKey || e.metaKey) return;
    if (isVideo && e.key.length === 1) return;
    e.preventDefault();
    action();
  };

  const atStart = !loop && current === 0;
  const atEnd = !loop && current >= total - 1;

  return (
    <BaseDialog.Root open={isOpen} onOpenChange={(next) => setOpen(next)}>
      <BaseDialog.Portal container={container}>
        <BaseDialog.Backdrop className={s.backdrop()} />
        <BaseDialog.Popup className={s.popup()} onKeyDown={onKeyDown}>
          <BaseDialog.Title className="sr-only">{labels.title}</BaseDialog.Title>
          <div className={s.bar()}>
            <span className={s.counter()} aria-hidden>
              {labels.counter(current, total)}
            </span>
            {!isVideo && (
              <>
                <button type="button" className={s.control()} aria-label={labels.zoomOut} disabled={zoom <= 1} onClick={() => setZoom(zoom - 0.5)}>
                  <ZoomOut size={16} aria-hidden />
                </button>
                <span className={s.zoomValue()} aria-hidden>
                  {Math.round(zoom * 100)}%
                </span>
                <button type="button" className={s.control()} aria-label={labels.zoomIn} disabled={zoom >= maxZoom} onClick={() => setZoom(zoom + 0.5)}>
                  <ZoomIn size={16} aria-hidden />
                </button>
              </>
            )}
            <BaseDialog.Close className={s.control()} aria-label={labels.close}>
              <X size={17} aria-hidden />
            </BaseDialog.Close>
          </div>
          <div className={s.stageWrap()}>
            {total > 1 && (
              <button type="button" className={cn(s.nav(), s.prev())} aria-label={labels.previous} disabled={atStart} onClick={() => go(current - 1)}>
                <ChevronLeft size={18} aria-hidden className="rtl:-scale-x-100" />
              </button>
            )}
            <figure className="m-0 flex min-h-0 min-w-0 flex-1 flex-col">
              <div className={s.stage()} onDoubleClick={() => !isVideo && setZoom(zoom > 1 ? 1 : 2)}>
                {item &&
                  (isVideo ? (
                    <video key={item.src} src={item.src} poster={item.poster} controls aria-label={item.alt} className={s.media()} style={{ maxHeight: '100%' }}>
                      {item.captions && <track kind="captions" src={item.captions} default />}
                    </video>
                  ) : (
                    <img
                      key={item.src}
                      src={item.src}
                      alt={item.alt}
                      draggable={false}
                      className={s.media()}
                      style={{ height: zoom > 1 ? `${zoom * 100}%` : undefined, maxHeight: zoom > 1 ? 'none' : '100%', maxWidth: zoom > 1 ? 'none' : '100%' }}
                    />
                  ))}
              </div>
              {item?.caption != null && <figcaption className={s.caption()}>{item.caption}</figcaption>}
            </figure>
            {total > 1 && (
              <button type="button" className={cn(s.nav(), s.next())} aria-label={labels.next} disabled={atEnd} onClick={() => go(current + 1)}>
                <ChevronRight size={18} aria-hidden className="rtl:-scale-x-100" />
              </button>
            )}
          </div>
          {showThumbnails && total > 1 && (
            <div ref={thumbsRef} role="group" aria-label={labels.thumbnails} className={s.thumbs()}>
              {items.map((it, i) => {
                const thumb = it.thumbnail ?? (it.type === 'video' ? it.poster : it.src);
                return (
                  <button key={`${it.src}-${i}`} type="button" className={s.thumb()} aria-label={labels.thumbnail(i, it.alt)} aria-current={i === current} onClick={() => go(i)}>
                    {thumb && <img src={thumb} alt="" className={s.thumbImg()} />}
                    {it.type === 'video' && (
                      <span className={s.thumbBadge()} aria-hidden>
                        <Play size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <span role="status" className="sr-only">
            {item ? labels.status(current, total, item.alt) : ''}
          </span>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

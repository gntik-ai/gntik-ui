import { useEffect, useState } from 'react';
import { Thumbnail, ThumbnailList } from '../Thumbnail';

// Neutral illustration: shapes in the default fill at low opacity, so it reads on every theme.
const PREVIEW =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"><rect width="160" height="120" fill-opacity="0.08"/><circle cx="118" cy="34" r="14" fill-opacity="0.22"/><path d="M0 120 L52 58 L92 100 L118 76 L160 120 Z" fill-opacity="0.3"/></svg>',
  );

interface Item {
  id: string;
  name: string;
  size: number;
  type?: string;
  src?: string;
  progress?: number;
  error?: string;
}

const INITIAL: Item[] = [
  { id: 'a', name: 'architecture-diagram.png', size: 482_000, type: 'image/png', src: PREVIEW },
  { id: 'b', name: 'q3-invoices.csv', size: 1_840_000, progress: 35 },
  { id: 'c', name: 'deployment-runbook.pdf', size: 236_000 },
  { id: 'd', name: 'backup-2026-05.tar.gz', size: 31_400_000, error: 'Exceeds 25 MB' },
];

export default function ThumbnailUploads() {
  const [items, setItems] = useState(INITIAL);
  const uploading = items.some((i) => i.progress !== undefined && i.progress < 100);

  useEffect(() => {
    if (!uploading) return;
    const id = window.setInterval(() => {
      setItems((list) => list.map((i) => (i.progress !== undefined && i.progress < 100 ? { ...i, progress: Math.min(100, i.progress + 13) } : i)));
    }, 400);
    return () => window.clearInterval(id);
  }, [uploading]);

  const remove = (id: string) => setItems((list) => list.filter((i) => i.id !== id));
  const retry = (id: string) => setItems((list) => list.map((i) => (i.id === id ? { ...i, error: undefined, size: 18_200_000, progress: 0 } : i)));

  return (
    <ThumbnailList aria-label="Attachments">
      {items.map((item) => (
        <Thumbnail
          key={item.id}
          name={item.name}
          size={item.size}
          type={item.type}
          src={item.src}
          progress={item.progress}
          error={item.error}
          onRemove={() => remove(item.id)}
          onRetry={item.error ? () => retry(item.id) : undefined}
        />
      ))}
    </ThumbnailList>
  );
}

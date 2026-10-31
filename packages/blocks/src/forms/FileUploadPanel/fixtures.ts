import { matchesAccept } from '@gntik-ai/ui';

export type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface UploadItem {
  id: string;
  /** Picked source file, absent for previously uploaded items. */
  file?: File;
  name: string;
  /** Size in bytes. */
  size: number;
  /** 0–100. */
  progress: number;
  status: UploadStatus;
  /** Why the file was rejected or failed. */
  error?: string;
}

export const uploadItems: UploadItem[] = [
  { id: 'f1', name: 'service-config.yaml', size: 4_300, progress: 100, status: 'done' },
  { id: 'f2', name: 'events-export.jsonl', size: 1_679_000, progress: 64, status: 'uploading' },
  {
    id: 'f3',
    name: 'db-snapshot.bin',
    size: 2_540_000_000,
    progress: 0,
    status: 'error',
    error: 'File type not accepted',
  },
];

/** Demo uploader: reports progress in steps and resolves after ~1.5 s. */
export function simulateUpload(
  _file: File,
  onProgress: (pct: number) => void,
  context?: { signal: AbortSignal; id: string },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const signal = context?.signal;
    let timer: ReturnType<typeof setTimeout>;
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    if (signal?.aborted) {
      abort();
      return;
    }
    signal?.addEventListener('abort', abort, { once: true });
    let pct = 0;
    const step = () => {
      if (signal?.aborted) return;
      pct = Math.min(100, pct + 20);
      onProgress(pct);
      if (signal?.aborted) return;
      if (pct >= 100) {
        signal?.removeEventListener('abort', abort);
        resolve();
      } else timer = setTimeout(step, 250);
    };
    timer = setTimeout(step, 250);
  });
}

/** Matches a file against an `accept` list (".csv", "image/*", "application/pdf"). */
export function acceptsFile(file: { name: string; type: string }, accept: string | undefined) {
  return matchesAccept(file, accept);
}

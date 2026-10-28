import { matchesAccept } from '@gntik-ai/ui';

export type UploadStatus = 'uploading' | 'done' | 'error';

export interface UploadItem {
  id: string;
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
export function simulateUpload(_file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve) => {
    let pct = 0;
    const step = () => {
      pct = Math.min(100, pct + 20);
      onProgress(pct);
      if (pct >= 100) resolve();
      else setTimeout(step, 250);
    };
    setTimeout(step, 250);
  });
}

/** Matches a file against an `accept` list (".csv", "image/*", "application/pdf"). */
export function acceptsFile(file: { name: string; type: string }, accept: string | undefined) {
  return matchesAccept(file, accept);
}

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
  { id: 'f3', name: 'db-snapshot.bin', size: 2_540_000_000, progress: 0, status: 'error', error: 'File type not accepted' },
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

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v >= 10 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

/** Matches a file against an `accept` list (".csv", "image/*", "application/pdf"). */
export function acceptsFile(file: { name: string; type: string }, accept: string | undefined) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(',')
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean)
    .some((a) => (a.startsWith('.') ? name.endsWith(a) : a.endsWith('/*') ? type.startsWith(a.slice(0, -1)) : type === a));
}

import { matchesAccept as matchesUiAccept } from '@gntik-ai/ui';

export type AttachmentRejectionReason = 'type' | 'size' | 'count';

export interface AttachmentRejection {
  file: File;
  reason: AttachmentRejectionReason;
  /** Human-readable message (set by ChatComposer from the i18n catalog). */
  message: string;
}

export interface ValidateFilesOptions {
  /** Same syntax as `<input accept>`: ".pdf,.csv,image/*,application/json". */
  accept?: string;
  /** Largest allowed file, in bytes. */
  maxSize?: number;
  /** Most files allowed in total, counting `current`. */
  maxFiles?: number;
  /** Files already attached. */
  current?: number;
}

/** Whether a file matches an `accept` list (extensions, exact MIME types and `type/*`). */
export function matchesAccept(file: Pick<File, 'name' | 'type'>, accept?: string): boolean {
  return matchesUiAccept(file, accept);
}

/** Splits files into accepted ones and rejections (without messages) by type, size and count. */
export function validateFiles(files: File[], { accept, maxSize, maxFiles, current = 0 }: ValidateFilesOptions) {
  const accepted: File[] = [];
  const rejected: Array<{ file: File; reason: AttachmentRejectionReason }> = [];
  for (const file of files) {
    if (!matchesAccept(file, accept)) rejected.push({ file, reason: 'type' });
    else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: 'size' });
    else if (maxFiles !== undefined && current + accepted.length >= maxFiles) rejected.push({ file, reason: 'count' });
    else accepted.push(file);
  }
  return { accepted, rejected };
}

/** Saves a string or Blob in the browser. Unsupported environments are a no-op. */
export function downloadFile(data: string | Blob, fileName: string, mimeType?: string): void {
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function')
    return;
  const type = mimeType ?? (data instanceof Blob && data.type ? data.type : 'text/plain;charset=utf-8');
  const blob = data instanceof Blob && data.type === type ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  try {
    document.body.append(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

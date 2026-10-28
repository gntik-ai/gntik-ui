/** The syntax of an input's accept attribute: MIME types, wildcards and extensions. */
export type FileAccept = string | readonly string[];
export interface FileRejection {
  file: File;
  reasons: ('type' | 'size' | 'count')[];
}
export interface FileValidationOptions {
  accept?: FileAccept;
  maxSize?: number;
  maxFiles?: number;
}

export function acceptRules(accept?: FileAccept): string[] {
  return (typeof accept === 'string' ? [accept] : (accept ?? []))
    .flatMap((value) => value.split(','))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

/** Matches names only on drop; drag items do not expose filenames. */
export function matchesAccept(file: Pick<File, 'name' | 'type'>, accept?: FileAccept): boolean {
  const rules = acceptRules(accept);
  return (
    rules.length === 0 ||
    rules.some((rule) =>
      rule.startsWith('.')
        ? file.name.toLowerCase().endsWith(rule)
        : rule.endsWith('/*')
          ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
          : file.type.toLowerCase() === rule,
    )
  );
}

export function validateFiles(files: readonly File[], { accept, maxSize, maxFiles }: FileValidationOptions = {}) {
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];
  for (const file of files) {
    const reasons: FileRejection['reasons'] = [];
    if (!matchesAccept(file, accept)) reasons.push('type');
    if (maxSize !== undefined && file.size > maxSize) reasons.push('size');
    if (maxFiles !== undefined && accepted.length >= maxFiles) reasons.push('count');
    if (reasons.length) rejected.push({ file, reasons });
    else accepted.push(file);
  }
  return { accepted, rejected };
}

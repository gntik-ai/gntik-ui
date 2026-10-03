import { File, FileArchive, FileAudio, FileCode, FileImage, FileSpreadsheet, FileText, FileVideo, type LucideIcon } from 'lucide-react';

export type FileKind = 'image' | 'video' | 'audio' | 'archive' | 'code' | 'spreadsheet' | 'document' | 'file';

const EXT: Record<string, FileKind> = {
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', svg: 'image', avif: 'image',
  mp4: 'video', mov: 'video', webm: 'video',
  mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio',
  zip: 'archive', gz: 'archive', tar: 'archive', tgz: 'archive', '7z': 'archive', rar: 'archive',
  js: 'code', ts: 'code', tsx: 'code', jsx: 'code', json: 'code', yaml: 'code', yml: 'code', py: 'code', sql: 'code', sh: 'code',
  csv: 'spreadsheet', xlsx: 'spreadsheet', xls: 'spreadsheet', parquet: 'spreadsheet', tsv: 'spreadsheet',
  pdf: 'document', doc: 'document', docx: 'document', md: 'document', txt: 'document',
};

/** Kind of a file from its MIME type, falling back to the extension of its name. */
export function fileKind(name: string, type?: string): FileKind {
  const major = type?.split('/')[0];
  if (major === 'image' || major === 'video' || major === 'audio') return major;
  const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined;
  return (ext && EXT[ext]) || 'file';
}

/** File extension shown as a tag ("PDF"), or undefined. */
export function fileExtension(name: string) {
  return name.includes('.') ? name.split('.').pop()?.toUpperCase() : undefined;
}

export const FILE_ICON: Record<FileKind, LucideIcon> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  archive: FileArchive,
  code: FileCode,
  spreadsheet: FileSpreadsheet,
  document: FileText,
  file: File,
};

/** "2.4 MB" style size with binary multiples. */
export function formatBytes(bytes: number, locale?: string) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  const digits = i === 0 || value >= 10 ? 0 : 1;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)} ${units[i]}`;
}

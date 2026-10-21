import type { BlockMeta } from '../../meta';
import type { FileUploadPanelLabels } from './FileUploadPanel';

export const meta: BlockMeta = {
  name: 'File upload panel',
  family: 'forms',
  status: 'stable',
  description:
    'Drag-and-drop zone with a Browse button, type and size validation, and a file list with progress, retry and remove. Optional labels?: Partial<FileUploadPanelLabels> overrides built-in copy; explicit props and validation messages win, then labels, then I18nProvider (en/es). No provider preserves English; fixtures and caller content stay unchanged. Interactive preview: /preview.html?kind=block&id=file-upload-panel--labels.',
  labels: [
    { key: 'label', type: 'string', state: 'Default content and accessible names' },
    { key: 'drop', type: 'string', state: 'Default content and accessible names' },
    { key: 'browse', type: 'string', state: 'Default content and accessible names' },
    { key: 'files', type: 'string', state: 'Default content and accessible names' },
    { key: 'failed', type: 'string', state: 'Default content and accessible names' },
    { key: 'typeRejected', type: 'string', state: 'Default content and accessible names' },
    { key: 'hint', type: '(types: string, size: string) => string', state: 'Default content and accessible names' },
    { key: 'tooLarge', type: '(size: string) => string', state: 'Default content and accessible names' },
    { key: 'done', type: '(name: string) => string', state: 'Async feedback' },
    { key: 'error', type: '(name: string) => string', state: 'Validation feedback' },
    { key: 'added', type: '(count: number) => string', state: 'Default content and accessible names' },
    { key: 'rejected', type: '(count: number) => string', state: 'Default content and accessible names' },
    { key: 'removed', type: '(name: string) => string', state: 'Default content and accessible names' },
    { key: 'uploading', type: '(name: string) => string', state: 'Async feedback' },
    { key: 'notUploaded', type: '(error: string) => string', state: 'Async feedback' },
    { key: 'uploaded', type: '(size: string) => string', state: 'Async feedback' },
    { key: 'retry', type: '(name: string) => string', state: 'Default content and accessible names' },
    { key: 'remove', type: '(name: string) => string', state: 'Default content and accessible names' },
  ] satisfies Array<{ key: keyof FileUploadPanelLabels; type: string; state: string }>,
  uses: ['Button', 'IconButton', 'Progress'],
};

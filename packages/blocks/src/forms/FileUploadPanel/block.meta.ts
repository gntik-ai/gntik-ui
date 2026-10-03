import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'File upload panel',
  family: 'forms',
  status: 'stable',
  description: 'Drag-and-drop zone with a Browse button, type and size validation, and a file list with progress, retry and remove.',
  uses: ['Button', 'IconButton', 'Progress'],
};

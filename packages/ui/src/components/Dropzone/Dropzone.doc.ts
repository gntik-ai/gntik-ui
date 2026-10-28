import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Dropzone',
  group: 'Forms',
  status: 'stable',
  description:
    'A file target with accept/reject feedback, a picker, type/size/count validation and a headless useDropzone hook. Accept is an input-style string or string array. With activateOnClick (default), children must contain no interactive content; use activateOnClick=false with DropzoneTrigger for buttons. Safari can expose an empty MIME type while dragging: these files are provisionally accepted and validated on drop. Extension and size rules apply on drop. Mount only one fullScreen zone per page; its window listeners ignore non-file drags. DropzoneCaption uses accept and maxSize for the upload hint. multiple defaults to true. Disabled zones ignore interaction.',
  primitive: '@base-ui/react/use-render',
  pattern: 'Button',
  keyboard: [
    ['Tab', 'Focus the clickable zone or its separate trigger.'],
    ['Enter', 'Open the file picker.'],
    ['Space', 'Open the file picker without scrolling.'],
    ['Escape', 'Hide the full-screen overlay.'],
  ],
  tokens: ['border', 'background', 'foreground', 'primary', 'destructive', 'destructive-text', 'focus-ring'],
};

import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'FileInput',
  group: 'Forms',
  status: 'beta',
  description:
    'Compact file selection with a file icon, name and localized size, or a count for several files. clearable defaults to false; renderValue replaces the single-file or count display. accept and maxSize use shared file validation; mixed picks keep accepted files and report rejected files through onReject. Field supplies the label, disabled/invalid state and descriptions (use FieldError match for an externally invalid field). FileTrigger opens a picker from a render element, defaulting to a secondary Button; onSelect receives File[]. useFileDialog({ accept, multiple, directory, capture, disabled, onChange }) returns { open, reset, files }, renders nothing and creates its attached hidden input only in an effect. reset clears hook files without firing onChange. Picker inputs are unnamed, reset before opening and removed on unmount; cancellation preserves values. With name, FileInput maintains a separate form input. Native FormData submission requires constructible DataTransfer and writable input.files; without them controlled display and callbacks still work, but use the value to submit files yourself. Form reset restores defaultValue for uncontrolled fields and re-syncs a controlled value. directory maps to webkitdirectory; capture is user or environment. These picker helpers live with FileInput, outside the hooks entry point. ProfileHeader and ChatComposer use FileTrigger, so their picker is attached outside the block container and exists only while its action is shown.',
  primitive: '@base-ui/react/field + @base-ui/react/button',
  pattern: 'Button',
  keyboard: [
    [
      'Tab / Shift+Tab',
      'Move between the control, optional clear button and adjacent controls; hidden inputs are skipped.',
    ],
    [
      'Enter / Space',
      'Open the picker from FileInput or FileTrigger; activate clear to empty the value and return focus.',
    ],
  ],
  tokens: [
    'background',
    'foreground',
    'border',
    'secondary',
    'muted-foreground',
    'primary',
    'destructive',
    'focus-ring',
  ],
};

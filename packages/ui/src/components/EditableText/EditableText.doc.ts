import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'EditableText',
  group: 'Forms',
  status: 'beta',
  description:
    'Inline editing for names and titles. value/defaultValue and editing/defaultEditing support controlled or uncontrolled use; onEditingChange requests mode changes, and a controlled value is updated by the owner in onSave. label names the field. activation is click (default), dblclick, or button (static text and a ghost edit icon). The editor inherits surrounding typography. multiline uses an auto-sizing Textarea; maxLength and placeholder pass to the field. trim defaults to true; validate receives the trimmed value and can return an error. onSave accepts void/true, rejects with a string or false, and displays thrown/rejected Error messages. Pending fields stay read-only and show a Spinner. data-editing, data-pending and data-invalid expose state. Disabled prevents activation. submitOnBlur defaults to true, matching table cells, but may save half-typed text when clicking away; set false to cancel instead. Save/cancel restores preview focus, except blur preserves its destination. onCancel runs on Escape or blur cancellation; unchanged values exit without saving. The exported low-level useInlineEdit<T> hook shares draft, start, cancel(after), commit(after), pending, error and busy state with DataTable. It requires value, parse and onSave(next, previous), plus genericError; optional validate, isEqual, focusEditor, onAccepted and onMove adapt parsing, acceptance and focus. focusEditor receives the requested move on save rejection (undefined on parse/validation errors). after is self/next/prev/null; null preserves blur focus. editing/defaultEditing/onEditingChange control mode. LowLevel shows hook composition; use EditableText for standard text editing.',
  primitive: '@base-ui/react/input, @base-ui/react/field, @base-ui/react/button',
  pattern: 'button + textbox + alert',
  keyboard: [
    [
      'Tab / Shift+Tab',
      'Move between the preview/editor and surrounding controls; blur saves, or cancels with submitOnBlur=false.',
    ],
    ['Enter', 'Open the focused preview (including dblclick mode); save a changed single-line value.'],
    ['Space', 'Open a click preview or the edit icon button.'],
    ['Escape', 'Cancel editing and restore preview focus.'],
    ['Enter (multiline)', 'Insert a newline.'],
    ['Ctrl+Enter / Cmd+Enter', 'Save a multiline value.'],
  ],
  tokens: ['secondary', 'foreground', 'destructive-text', 'focus-ring'],
};

import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'FieldArray',
  group: 'Forms',
  status: 'beta',
  description:
    'Repeatable arbitrary fields bound to react-hook-form arrays. Import from @gntik-ai/ui/forms only; use within Form or pass control explicitly. Rows expose index, name(field), remove(), duplicate() and move(delta). Add accepts a default object or factory. Optional reorder and duplicate actions preserve row identity, and min/max gate removals and additions. Inline and card layouts support nested arrays, list-level validation, focus restoration and localized announcements. Use ListInput for standalone key/value pairs without a form library; use FieldArray for arbitrary object fields managed by react-hook-form.',
  primitive: '@base-ui/react/fieldset, @base-ui/react/field, @base-ui/react/button',
  pattern: 'fieldset with named row groups',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves through row fields, row actions and Add in document order'],
    ['Enter / Space on Add', 'Appends the default item and focuses its first control'],
    ['Enter / Space on Remove', 'Removes the row and focuses the next row, previous row or Add'],
    [
      'Alt+ArrowUp / Alt+ArrowDown',
      'With reorderable, moves the row and keeps focus on the same control; stops at either end',
    ],
    ['Enter / Space on Move up / Move down', 'Moves the row by one position and preserves focus'],
    ['Enter / Space on Duplicate', 'With duplicable, inserts an independent deep copy below and focuses it'],
  ],
  tokens: ['border', 'card', 'foreground', 'muted-foreground', 'destructive-text', 'secondary', 'focus-ring'],
};

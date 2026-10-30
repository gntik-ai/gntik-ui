import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'PowerSearch',
  group: 'Forms',
  status: 'experimental',
  description:
    'Structured filter input: pick a field, an operator and a value from suggestions (or type `status=failed`, `cost>100`), add free text, and edit committed terms from the keyboard. Emits a typed query AST (`{ type: "and", terms }`) with parse / format / match helpers; fields, operators and values are props.',
  primitive: '@base-ui/react/combobox',
  pattern: 'combobox + list of editable filter terms',
  keyboard: [
    ['ArrowDown / ArrowUp', 'Opens the suggestions and moves the highlight'],
    ['Enter', 'Picks the highlighted suggestion; otherwise commits the typed value or free text (empty input: submit)'],
    ['field=value / field:value', 'Typed shortcut: jumps straight to the value step'],
    ['Backspace (empty input)', 'Steps back: operator → field → edits the last term'],
    ['ArrowLeft (input start)', 'Moves focus to the last term'],
    ['ArrowLeft / ArrowRight / Home / End (on a term)', 'Moves between terms; past the last returns to the input'],
    ['Enter / Space (on a term)', 'Pulls the term back into the input to edit it'],
    ['Delete / Backspace (on a term)', 'Removes the term'],
    ['Escape', 'Closes the suggestions; again clears the term being built'],
  ],
  dataAttributes: [
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-chip-body', 'chip', 'The part contains the chip content.'],
    ['data-disabled', 'input', 'The control cannot be changed or activated.'],
    ['data-chip-body', 'input', 'The part contains the chip content.'],
    ['data-starting-style', 'popup', 'The part is entering.'],
    ['data-ending-style', 'popup', 'The part is leaving.'],
    ['data-highlighted', 'item', 'The item is highlighted for keyboard or pointer navigation.'],
    ['data-selected', 'item', 'The item is selected.'],
    ['data-disabled', 'item', 'The control cannot be changed or activated.'],
  ],
  tokens: [
    'background',
    'border',
    'foreground',
    'muted-foreground',
    'primary',
    'primary-text',
    'secondary',
    'popover',
    'focus-ring',
  ],
};

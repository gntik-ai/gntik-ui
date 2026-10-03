import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'KeyValueEditor',
  group: 'Forms',
  status: 'beta',
  description:
    'Editable list of key/value rows (environment variables, headers, labels): add and remove rows (no reordering), per-row validation (required key, key pattern, duplicate keys, optional required value and a custom `validate`), secret rows whose values are masked with a reveal toggle, bulk paste of `.env` text (comments ignored, existing keys updated) and "Copy as .env". Controlled (`value` + `onChange`) or uncontrolled. `parseEnv`, `serializeEnv`, `validateKeyValueRows` and `createKeyValueRow` are exported.',
  primitive: '@base-ui/react/input',
  pattern: 'group of textboxes + toggle buttons',
  keyboard: [
    ['Tab', 'Moves through each row: key, value, secret toggle, remove; then Add, Paste .env and Copy as .env'],
    ['Enter / Space', 'On Add variable: appends a row and focuses its key'],
    ['Enter / Space', 'On Remove: deletes the row, announces it and focuses the next row (or Add)'],
    ['Enter / Space', 'On the secret toggle: masks or unmasks the value (aria-pressed)'],
    ['Ctrl / ⌘ + V', 'In a key field, multi-line KEY=value text is imported as rows'],
  ],
  tokens: ['background', 'border', 'card', 'foreground', 'muted-foreground', 'secondary', 'destructive', 'destructive-text', 'focus-ring'],
};

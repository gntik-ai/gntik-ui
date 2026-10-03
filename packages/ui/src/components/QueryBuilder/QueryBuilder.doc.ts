import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'QueryBuilder',
  group: 'Forms',
  status: 'beta',
  description:
    'Visual filter editor: nested AND/OR groups of field / operator / value conditions. Typed fields (text, number, enum, date, boolean) offer their operators and value editor (Input, NumberInput, Select / MultiSelect, DatePicker, ranges for "between"); add and remove conditions and groups up to `maxDepth`. The value is a serialisable tree; `queryToString(tree)` makes it human-readable and `evaluateQuery(tree, record)` tests a record.',
  primitive: 'Select, MultiSelect, Input, NumberInput, DatePicker, ToggleGroup, Button',
  pattern: 'nested groups of form controls',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves through each condition\'s field, operator, value and remove button, then the group\'s buttons'],
    ['Enter / Space', 'On Add condition / Add group: adds it and focuses its first field; on a remove button: removes it and focuses Add condition'],
    ['ArrowLeft / ArrowRight', 'In a group\'s AND / OR switch: moves between the options (Enter / Space picks)'],
    ['Enter / Space / ArrowDown', 'On a field, operator or enum value: opens its list (see Select)'],
  ],
  tokens: ['card', 'secondary', 'border', 'foreground', 'muted-foreground', 'primary', 'focus-ring'],
};

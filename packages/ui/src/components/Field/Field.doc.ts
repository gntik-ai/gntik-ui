import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Field',
  group: 'Forms',
  status: 'stable',
  description:
    'Accessible form field scaffolding: Field, FieldLabel, FieldDescription, FieldError and FieldItem wire ids and aria-describedby for any kit control; Fieldset and FieldsetLegend group related fields under one name.',
  primitive: '@base-ui/react/field, @base-ui/react/fieldset',
  pattern: 'form field (label + description + error), fieldset/legend',
  keyboard: [
    ['Click on label', 'Moves focus to the field control'],
    ['Tab', 'Moves focus to the control; its description and error are announced via aria-describedby'],
  ],
  anatomy: `<Field name="value">
  <FieldLabel>Label</FieldLabel>
  <Input />
  <FieldDescription>Hint</FieldDescription>
  <FieldError />
</Field>`,
  dataAttributes: [
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-disabled', 'label', 'The control cannot be changed or activated.'],
    ['data-disabled', 'fieldset', 'The control cannot be changed or activated.'],
  ],
  tokens: ['foreground', 'muted-foreground', 'destructive-text'],
};

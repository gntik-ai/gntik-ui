import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Field',
  group: 'Forms',
  status: 'stable',
  description:
    'Optional status=idle|validating|warning|success and feedbackIcon provide non-blocking feedback; invalid always resolves to error. FieldWarning and FieldSuccess are linked descriptions with hideIcon and match overrides (invalid still hides them). useFieldStatus returns {status, invalid, validating}, or idle outside Field. Input and NumberInput show decorative status icons when feedbackIcon is enabled; only warning tints their border. Passing status mounts a polite region: validating is localized and the settled message is announced once. Unset props preserve the existing DOM. See FieldAsyncStatus and the FormAsyncValidation example for debounced checks. Accessible form field scaffolding: Field, FieldLabel, FieldDescription, FieldError and FieldItem wire ids and aria-describedby for any kit control; Fieldset and FieldsetLegend group related fields under one name.',
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
    ['data-status', 'root', 'Effective status when status is supplied; invalid takes precedence as error.'],
    ['data-disabled', 'root', 'The control cannot be changed or activated.'],
    ['data-disabled', 'label', 'The control cannot be changed or activated.'],
    ['data-disabled', 'fieldset', 'The control cannot be changed or activated.'],
  ],
  tokens: ['foreground', 'muted-foreground', 'destructive-text', 'warning-text', 'success-text', 'warning'],
};

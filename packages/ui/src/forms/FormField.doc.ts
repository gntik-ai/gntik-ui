import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'FormField',
  group: 'Forms',
  status: 'beta',
  description:
    'Form and FormField adapt react-hook-form to kit Fields. Import from @gntik-ai/ui/forms. The default bind="input" preserves raw value/onChange/onBlur props for Input and Textarea. bind="value" maps to value/onValueChange (undefined becomes null); bind="checked" maps to checked/onCheckedChange (undefined becomes false). Both committed changes update the value then touch the field, so mode="onTouched" validates pickers on their first change. toValueProps(controlProps) and toCheckedProps(controlProps) provide the same mapping for useFieldProps users. Array/range controls require their own empty shape: value={p.value ?? []} for MultiSelect and an empty range for DateRangePicker. Bound refs focus the control itself or lazily resolve its first tabbable descendant; custom controls with different DOM should supply their own focusable ref. Form enhanceFieldProps({name}) returns disabled/readOnly props, overriding field options when supplied; returning undefined preserves the original props. Disabled fields also disable their Field and skip validation. Input, Textarea, NumberInput and SimpleSelect support readOnly; DatePicker, DateRangePicker and MultiSelect ignore it. Width presets xs/sm/md/lg/xl cap the Field at 6.5/13.5/20.5/27.5/34.5rem; unset fills available width. For dependent loadOptions, useWatch the parent and key the child select by it to discard cached options, resetting the child value when the parent changes.',
  primitive: '@base-ui/react/field',
  pattern: 'form with labelled fields and inline validation',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves through enabled controls in document order'],
    ['Enter on Submit', 'Validates and focuses the first invalid field'],
    ['Focus on a bound RadioGroup', 'Reaches the checked radio, or the first radio when none is checked'],
    ['Focus on a DatePicker ref', 'Reaches its input without opening the popup'],
    ['Focus on a TimePicker ref', 'Reaches its hours segment'],
  ],
  tokens: ['foreground', 'muted-foreground', 'destructive-text', 'focus-ring'],
};

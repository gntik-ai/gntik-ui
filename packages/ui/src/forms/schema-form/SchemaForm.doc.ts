import type { ComponentDoc } from '../../doc';
export const doc: ComponentDoc = {
  name: 'SchemaForm',
  group: 'Forms',
  status: 'beta',
  description:
    'SchemaForm renders an object JSON Schema using kit controls from @gntik-ai/ui/forms; SchemaFields renders the same fields using control or the nearest FormProvider (including useFormDialog). Supported keywords: type, properties, required, title, description, default, enum, oneOf const/title choices, const, minimum, maximum, multipleOf, minLength, maxLength, pattern, format (email, uri, date, date-time, password), writeOnly, items, minItems, maxItems, uniqueItems and local #/$defs refs. Strings with maxLength >255 use Textarea; enums with at most five options use RadioGroup, otherwise SimpleSelect. String arrays use TokenInput or MultiSelect; object arrays use FieldArray. Dates are ISO calendar days; date-times are ISO instants edited in the system zone. Numbers are numeric and optional empty strings/arrays are omitted on SchemaForm submit. Unsupported keywords (including conditionals, remote or cyclic refs) show a JSON textarea and one development warning per field/keyword. Schema text is always plain text. Invalid patterns produce a validation error; pattern input is capped at maxLength or 1000 characters before regex evaluation (this limits input size, not regex execution time). ui overrides by dotted property path support widget, label, description, placeholder, hidden and order; explicitly ordered fields come first. widgets receive name, schema, controlProps and fieldState; use toValueProps/toCheckedProps to wire kit controls. SchemaForm resolver fully replaces built-in validation and value transformation. SchemaFields uses field rules, so a parent resolver replaces them; configure the parent resolver to transform values when needed. defaultValues are initial values; remount or use the parent form reset API to replace them. columns defaults to 1; 2 uses two columns from sm. disabled disables all fields and submission. onChange receives prepared current values; submitLabel overrides the translated Save label. Validation runs on submit. Hidden fields keep schema defaults and validation, so make them optional or provide valid values. Schemas must have an object root. Client validation is a subset; the server remains authoritative.',
  primitive: '@base-ui/react/field',
  pattern: 'labelled schema fields with inline errors',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves between enabled fields in rendered order'],
    ['Enter on Save', 'Validates and focuses the first invalid field'],
    ['Arrow keys in choices', 'Selects a radio option or navigates select options'],
    ['Enter in tags', 'Commits the pending token'],
    ['Escape in a date popup', 'Closes the calendar and returns focus to the field'],
  ],
  tokens: ['foreground', 'muted-foreground', 'destructive-text', 'focus-ring', 'border'],
};

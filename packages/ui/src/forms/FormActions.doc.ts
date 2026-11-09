import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'FormActions',
  group: 'Forms',
  status: 'beta',
  description:
    'Import FormSubmit, FormReset and useFormActions from @gntik-ai/ui/forms. FormSubmit uses the kit Button loading state: a spinner, aria-busy and retained focus, plus a visually hidden polite submitting announcement. Its children default to the localized Save label. disableWhenClean is opt-in for edit forms; leave it off on create forms so submission can reveal validation errors. FormReset is a ghost button, defaults to the localized Discard label, restores defaults and clears errors; it is disabled while clean or submitting. Form ignores additional clicks, Enter and imperative submissions until validation and the current save settle. afterSubmit defaults to keep, preserving current state. After a successful save, rebase calls form.reset(form.getValues()) to make raw inputs, rather than resolver output, the new defaults; reset calls form.reset() to restore defaults. A rejected save propagates and preserves edits. Rebase also clears touched state and resets submitCount; use keep when relying on that state. Outside Form, FormSubmit renders a plain submit Button and warns once per mounted instance in development. FormReset and useFormActions require Form. StickyActionBar recipe: render a child of Form that calls useFormActions(), then pass dirty={isDirty}, saving={isSubmitting}, onSave={submit} and onCancel={reset} to StickyActionBar from @gntik-ai/blocks. submit() uses requestSubmit() so validation, the in-flight guard and afterSubmit apply. The live example uses kit Buttons as an action-bar stand-in; ui does not depend on blocks.',
  primitive: '@base-ui/react/button',
  pattern: 'form submit and reset controls bound to pending and dirty state',
  keyboard: [
    ['Enter / Space on FormSubmit', 'Validates and submits once; pending submissions keep focus and ignore repeats'],
    ['Enter in a text field', 'Submits through the same guard and focuses the first invalid field on failure'],
    ['Tab / Shift+Tab while submitting', 'Can still reach the loading submit button'],
    ['Enter / Space on FormReset', 'Restores default values and clears validation errors'],
  ],
  tokens: ['primary', 'primary-foreground', 'muted-foreground', 'focus-ring'],
};

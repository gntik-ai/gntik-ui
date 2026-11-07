import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'FormDialog',
  group: 'Overlays',
  status: 'beta',
  description:
    "A Dialog (or, with variant=\"drawer\", a Drawer) that hosts a form and owns its lifecycle. It needs no form library: children are the fields, and onSubmit receives the form's FormData. onSubmit may return nothing or true (closes, focus returns to the trigger), false (stays open, no message: the caller handled it), a string (stays open and shows it) or a promise of those; a thrown error or rejection shows its message, or the catalog text formDialog.failed. The body is a <form noValidate>: Enter in a field or the submit button submits once, and the submit event does not reach an outer form that renders the dialog. A synchronous result never enters the pending state. While a promise is pending the submit button is aria-busy (still focusable), Cancel is disabled, the form is aria-busy, and Escape, the backdrop, the close button, a drawer swipe, a custom footer's close control and repeat submits do nothing; onOpenChange is not called for them. A parent that sets open to false is always honoured, and the late result is ignored. Set a request timeout in onSubmit, because users cannot close the dialog while it is pending. The error shows in a destructive Alert at the top of the body and clears on the next submit and on close; summary adds a slot under it. Without keepMounted the content unmounts on close, so uncontrolled fields start empty on the next open; with it they keep their text. onClosed runs once after every close, when the exit animation ends, including a parent-driven one. Unlike DataTable's onCellEdit, false is silent here. size is typed per variant (dialog sm to xl, drawer sm to lg) and side is drawer-only. A trigger without children is labelled by title. useFormDialog(form, save) from @gntik-ai/ui/forms wires react-hook-form validation, parsed values and reset on close.",
  primitive: '@base-ui/react/dialog',
  pattern: 'dialog (modal) with a form',
  keyboard: [
    ['Enter / Space', 'On the trigger: opens the dialog and moves focus to the first field'],
    ['Tab / Shift+Tab', 'Cycles focus within the dialog (focus is trapped)'],
    ['Enter', 'In a text field or on the submit button: submits once; ignored while a submit is pending'],
    ['Escape', 'Closes the dialog and returns focus to the trigger; ignored while a submit is pending'],
  ],
  anatomy: `<FormDialog
  title="New quota"
  trigger={<Button />}
  onSubmit={async (data) => {
    const error = await save(Object.fromEntries(data));
    return error; // undefined closes, a string shows it, false stays open
  }}
>
  <Field><FieldLabel>Name</FieldLabel><Input name="name" /></Field>
</FormDialog>`,
  tokens: ['popover', 'popover-foreground', 'border', 'destructive', 'muted-foreground', 'focus-ring'],
};

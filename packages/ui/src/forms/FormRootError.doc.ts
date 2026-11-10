import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'FormRootError',
  group: 'Forms',
  status: 'beta',
  description:
    'Import FormRootError from @gntik-ai/ui/forms and render it inside Form, usually above the actions. It shows the form-level server error: the entry of the Form errors prop under the key "" (for example a quota error), or one whose path matches no mounted FormField, so a mismatched path is visible instead of lost. It is the kit Alert with the destructive tone and role="alert", and renders nothing while there is no root error. The next submit, or any reset, removes it. Other Alert props such as className pass through. See FormField for the errors prop and the FormServerErrors example: a create form whose fake API answers with a taken name, a blocked email domain and a quota error. Keep the errors map in state; a map rebuilt on every render re-applies on each render.',
  primitive: '@gntik-ai/ui Alert',
  pattern: 'form-level server error alert',
  tokens: ['destructive', 'destructive-foreground', 'destructive-text'],
};

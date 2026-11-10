import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'PasswordInput',
  group: 'Forms',
  status: 'beta',
  description:
    'Password field on Input with a reveal toggle (aria-pressed) and an optional 4-segment strength meter. Strength comes from a small built-in heuristic or a `strength` prop (0–4); its text is linked to the input with aria-describedby. Works inside Field. Size lg renders a 44px field, a 36px reveal toggle with a 17px icon, and 13px strength text. Auto (default), sm and md retain the 28px toggle and 12px strength text. See PasswordInputLarge. The `rules` prop ({ minLength, lowercase, uppercase, number, symbol }) and the `requirements` prop (custom { id, label, test } entries, added after the built-in rules) render a named checklist under the field, joined to the input with aria-describedby next to any Field description and replacing the empty-state hint. Each item shows a muted circle before typing, then a check (met) or an X (not met) with visually hidden text, so colour is never the only signal. A polite status announces "N of M requirements met" 700 ms after typing stops, only when the met count changed. Without a `strength` prop the meter score is round(4 × met / total), 0 while empty; an explicit `strength` wins. A rule-count score does not measure guessability: pass `strength` from a zxcvbn-style checker for that. Keep the list to 3 to 5 rules, because it is read on every focus. `checkPasswordRules(password, rules, requirements?)` returns { met, total, failed } with the same tests, so a schema `refine` can enforce the policy the UI shows. See PasswordInputPolicy.',
  primitive: '@base-ui/react/input',
  pattern: 'textbox + toggle button',
  keyboard: [
    ['Tab', 'Moves from the input to the reveal toggle'],
    ['Enter / Space', 'On the toggle: shows or hides the password (aria-pressed)'],
  ],
  tokens: [
    'background',
    'border',
    'foreground',
    'muted-foreground',
    'secondary',
    'destructive',
    'destructive-text',
    'warning',
    'warning-text',
    'success',
    'success-text',
    'focus-ring',
  ],
};

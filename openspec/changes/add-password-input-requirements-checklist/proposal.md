# Add a PasswordInput requirements checklist

## Why

PasswordInput gets its strength from the scorePassword heuristic or a 0-4 `strength` prop and has no per-rule checklist. With an empty value it renders a hard-coded English hint that ignores the actual policy, and the sign-up and reset blocks restate their rules by hand. Consumers cannot show a tenant policy as a list of met and unmet rules, nor enforce the same policy in validation.

## What changes

- Add optional `rules` ({ minLength, lowercase, uppercase, number, symbol }) and `requirements` (custom { id, label, test }) props. Either one renders a named checklist linked to the input, a debounced polite summary and a derived strength score.
- Add `checkPasswordRules(password, rules, requirements?)` returning { met, total, failed }, using the same tests as the checklist.
- Add en and es catalog entries, a PasswordInputPolicy example, docs, tests, a changeset and regenerated registry output.

## Scope and risk

- Change id: add-password-input-requirements-checklist. Capability: ui/password-input. All requirements are ADDED; no baseline exists. No dependencies.
- R1, additive. Without `rules` or `requirements` the DOM is unchanged.
- A rule-count score does not measure guessability; the docs say so and keep `strength` for zxcvbn-style checkers. A long list inside aria-describedby is read on every focus, so the docs recommend 3 to 5 rules. Met items use the success token, which shares the primary green; the check icon and the hidden "met" text carry the meaning.
- Out of scope: server-side enforcement and breached-password checks, localising the existing empty-state hint, moving SignUpForm and ResetPasswordForm to `rules`, re-exporting Base UI Field.Validity.
- Roll back by pinning the previous @gntik-ai/ui release or reverting. No deployment or data migration.

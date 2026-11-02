# Change: Carry large Input sizing through compositions

## Why

Input already supports a 44px lg step, but its password, secret and addon compositions and auth blocks keep smaller controls beside large submit buttons.

## What changes

- Scope an Input size context to addons: lg keyboard hints are 22px and implicit icon buttons are md (36px). Explicit addon sizes win; standalone addons retain auto sizing.
- Add lg to PasswordInput and SecretField. Large reveal/copy controls are 36px with 17px icons; password strength text is 13px. Other sizes keep existing metrics.
- Add optional fieldSize: auto | lg, default auto, consistently to SignInForm, SignUpForm, ResetPasswordForm, ForgotPasswordForm and MfaChallenge. Large OTP slots use the existing md (44px) step, without adding an OtpInput API value.
- Set the sso-login work email Input to lg.
- Add live documentation, tests, one minor changeset for UI/blocks/templates and generated registry output.

## Scope and risk

Issue #421, R1. Depends on add-multi-select-density-aware-sizes, present at base 9a8167eb. Default auth markup and all non-lg metrics remain unchanged. The SSO email field and implicit icon addons in existing lg Inputs intentionally grow. No token, theme, OtpInput API or default auth-size changes. Rollback is a revert or pinning the previous package releases. No deployment or publication.

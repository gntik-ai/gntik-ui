## Purpose

Auth forms with optional large fields matching their submit buttons.

## ADDED Requirements

### Requirement: fieldSize lg matches fields to the large submit button

SignInForm, SignUpForm, ResetPasswordForm, ForgotPasswordForm and MfaChallenge SHALL accept optional fieldSize: auto | lg, default auto. At lg every Input and PasswordInput SHALL be 44px. MfaChallenge SHALL use existing md (44px) OTP slots. Omitted fieldSize SHALL retain existing DOM and appearance.

#### Scenario: Large auth form

- **WHEN** SignInForm renders with fieldSize lg
- **THEN** identifier, password and submit controls are 44px

#### Scenario: Other large auth forms

- **WHEN** SignUpForm, ResetPasswordForm or ForgotPasswordForm renders with fieldSize lg
- **THEN** all its default or configured fields are 44px

#### Scenario: MFA code and backup modes

- **WHEN** MfaChallenge renders with fieldSize lg
- **THEN** code slots use OtpInput md (44px) and the backup-code Input is lg (44px)

#### Scenario: Default auth forms

- **WHEN** fieldSize is omitted or auto on any of the five blocks
- **THEN** markup and appearance remain unchanged

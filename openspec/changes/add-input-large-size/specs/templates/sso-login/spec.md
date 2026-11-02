## Purpose

SSO sign-in with a work email lookup, redirecting state and password fallback.

## ADDED Requirements

### Requirement: Work email field matches the large SSO button

The sso-login template SHALL render its work email field at lg to match Continue with SSO.

#### Scenario: SSO form

- **WHEN** the sso-login page renders
- **THEN** work email and Continue with SSO are both 44px tall

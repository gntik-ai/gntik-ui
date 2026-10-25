## Purpose

Appearance settings expose the app motion preference alongside theme, density and language.

## ADDED Requirements

### Requirement: Reduce motion preference row

The settings-appearance template SHALL render a Reduce motion Switch bound to useTheme().motion and setMotion. Its label and description SHALL have English and Spanish catalog entries. Changed examples SHALL be axe clean in dark, light and high_contrast.

#### Scenario: Toggle on

- **GIVEN** ThemeProvider motion is system
- **WHEN** the user turns on Reduce motion
- **THEN** setMotion('reduce') is called and the switch is checked

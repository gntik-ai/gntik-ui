## Purpose

Report the operating system for platform-aware hints without accessing navigator during server rendering.

## ADDED Requirements

### Requirement: Detect the operating system

getOs() and useOs() SHALL report macos, ios, windows, android, chromeos, linux or undetermined. Detection SHALL prefer navigator.userAgentData.platform, then navigator.platform, then navigator.userAgent, refining Linux platform strings with Android and CrOS user agents. MacIntel with maxTouchPoints greater than one SHALL count as ios. Without navigator, getOs() SHALL return undetermined. Os, getOs and useOs SHALL be exported with TSDoc from @gntik-ai/ui.

#### Scenario: Windows platform

- **GIVEN** navigator.platform is Win32
- **WHEN** getOs() runs
- **THEN** it returns windows

#### Scenario: Desktop iPad platform

- **GIVEN** navigator.platform is MacIntel and maxTouchPoints is 5
- **WHEN** getOs() runs
- **THEN** it returns ios

#### Scenario: Client hints take priority

- **GIVEN** userAgentData.platform is Windows and navigator.platform is MacIntel
- **WHEN** getOs() runs
- **THEN** it returns windows

### Requirement: Hydration is safe

useOs SHALL use useSyncExternalStore with an undetermined server snapshot and a no-op subscription. It SHALL NOT read navigator at module scope or during server rendering. Client-only renders SHALL immediately use the detected OS.

#### Scenario: Server render and Mac hydration

- **GIVEN** reading navigator during renderToString would throw
- **WHEN** the default trigger is server-rendered
- **THEN** no navigator access occurs and the hint shows Ctrl
- **WHEN** that markup hydrates with a MacIntel navigator
- **THEN** it changes to Command without a hydration mismatch

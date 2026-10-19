## Purpose

Render agent-driven A2UI command messages as allow-listed kit components, bind a surface data model and report user actions to the consumer.

## ADDED Requirements

### Requirement: Only catalogued components with valid props render

AgentSurface SHALL render only types present as own entries in its trusted catalog and properties accepted by that entry's validator. Unknown types and invalid props MUST show the localized neutral placeholder and report onError. Unknown keys, agent className, style, on* handlers, render overrides and HTML injection properties MUST NOT reach kit components or DOM. Strings MUST render as React text nodes. URL-valued properties MUST reuse Markdown safeUrl.

#### Scenario: Unknown component

- **WHEN** updateComponents defines Iframe
- **THEN** the placeholder reads This content cannot be shown in English
- **AND** onError reports type Iframe once
- **AND** no iframe is created

#### Scenario: Unsafe URL and markup

- **WHEN** text contains HTML or href contains javascript: including whitespace-obfuscated forms
- **THEN** text is displayed literally and the unsafe href is dropped
- **AND** agent styles and handlers never reach DOM

### Requirement: Validate every versioned command at runtime

AgentSurface SHALL pin A2UI_VERSION to v0.9 and validate each command envelope before applying it. Only one of createSurface, updateComponents, updateDataModel and deleteSurface MAY appear in a message. Unsupported versions MUST suppress that surface and report onError exactly once per surface. Malformed input MUST report an error without throwing.

#### Scenario: Unsupported protocol

- **WHEN** several messages declare an unsupported version for the same surface
- **THEN** that surface renders nothing
- **AND** onError reports one version error

### Requirement: Progressive rendering preserves component identity

Surfaces SHALL render an adjacency list rooted at root, keyed by component id. Missing children MAY arrive later. Patches to a child MUST preserve unaffected parent DOM identity. The renderer MUST reject cycles, repeated parents, graphs over 256 components or depth 32, and more than 32 surfaces.

#### Scenario: Stream and patch

- **GIVEN** createSurface followed by a Card with a Text and a Button
- **WHEN** a later updateComponents patches the Text
- **THEN** its new text renders
- **AND** the Card retains its DOM node

### Requirement: Bindings resolve JSON Pointer paths

A prop given as { path } SHALL read from the model at that RFC 6901 pointer. Input and Select value and Checkbox checked MUST write user changes back immutably. updateDataModel SHALL replace the value at its path, defaulting to the model root, and update every bound component. Pointer reads and writes MUST reject `__proto__`, `prototype` and `constructor` segments, malformed escapes and excessive depth. Model payloads MUST reject prototype keys.

#### Scenario: Two-way Input

- **GIVEN** an Input and Text bound to /user/name with model value Ana
- **WHEN** the user types López after a space
- **THEN** both controls expose Ana López
- **AND** a later model patch updates both

### Requirement: Actions return current resolved context

Activating a Button or implicitly submitting its containing form SHALL emit onAction exactly once with name, surfaceId and context resolved against the current surface model.

#### Scenario: Submit

- **GIVEN** a submit Button whose context binds name to /user/name
- **WHEN** the user activates it after entering Ana López
- **THEN** onAction receives { name: 'submit', surfaceId: 's1', context: { name: 'Ana López' } }

### Requirement: Keep origin visible and recover focus

Every surface SHALL render in a visibly and accessibly labelled agent-content frame. Agent data MUST NOT override that frame. deleteSurface MUST unmount the surface; focus inside it MUST move to the next surviving focusable sibling, otherwise the chat composer. With neither available, the labelled container MUST retain focus rather than body. Deleting an unfocused surface MUST NOT move focus.

#### Scenario: Delete focused content

- **GIVEN** focus inside a surface
- **WHEN** deleteSurface removes it
- **THEN** focus moves to the next sibling control or the composer
- **AND** focus never falls to body

### Requirement: Ship accessible, localized kit examples

Default catalog entries SHALL use existing kit components. All new visible and accessible strings MUST come from English and Spanish i18n entries via useChatI18n().tc. The example MUST be keyboard-operable and axe-clean in dark, light and high_contrast. New styling MUST use token classes and respect reduced motion. Documentation MUST explain custom-catalog trust and exclude password, payment and upload controls.

#### Scenario: Accessible live form

- **WHEN** the live form is rendered in each supported theme
- **THEN** axe finds no semantic violations
- **AND** keyboard users can edit inputs, select options, toggle a checkbox and submit

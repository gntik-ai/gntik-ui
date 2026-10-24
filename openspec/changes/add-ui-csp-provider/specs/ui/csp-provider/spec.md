## Purpose

Content Security Policy support for the kit: one provider that gives an app nonce to inline elements rendered by the kit and its Base UI primitives, or disables style elements.

## ADDED Requirements

### Requirement: Nonce reaches Base UI inline elements

CSPProvider SHALL forward nonce and disableStyleElements to Base UI's CSPProvider from @base-ui/react/csp-provider. ScrollArea and Select styles SHALL carry the nonce or be omitted when styles are disabled. Tabs and Slider prehydration scripts SHALL carry the nonce when emitted; disabling styles SHALL NOT disable scripts.

#### Scenario: Select popup style

- **GIVEN** CSPProvider with nonce="abc123" wraps a Select
- **WHEN** the Select opens
- **THEN** the base-ui-disable-scrollbar style has nonce="abc123"

#### Scenario: ScrollArea style

- **WHEN** ScrollArea renders inside CSPProvider with nonce="abc123"
- **THEN** the scrollbar style has nonce="abc123"

#### Scenario: Server-rendered positioning scripts

- **WHEN** renderToString renders TabsIndicator with renderBeforeHydration or Slider with thumbAlignment="edge" inside CSPProvider with nonce="abc123"
- **THEN** the emitted prehydration script has nonce="abc123"

### Requirement: Kit-owned inline elements follow the provider

useCSP SHALL expose nonce and disableStyleElements. PrintLayout's @page style SHALL use the nonce and SHALL NOT render when disableStyleElements is true or pageRule is false.

#### Scenario: Print page rule with a nonce

- **WHEN** PrintLayout renders its page rule inside CSPProvider with nonce="abc123"
- **THEN** its style has nonce="abc123"

#### Scenario: Style elements disabled

- **WHEN** PrintLayout renders inside CSPProvider with disableStyleElements
- **THEN** no page style is rendered

### Requirement: Disabled style elements keep the scrollbar appearance

ScrollArea's viewport and Select's popup and list SHALL carry [scrollbar-width:none] and [&::-webkit-scrollbar]:hidden. The shared Combobox popup classes SHALL remain unchanged.

#### Scenario: Scrollbars without injected styles

- **WHEN** an overflowing ScrollArea and an open Select render inside CSPProvider with disableStyleElements
- **THEN** no scrollbar style is added
- **AND** every affected slot carries the static scrollbar classes

### Requirement: Defaults preserve existing behavior

Outside a provider, useCSP SHALL return { nonce: undefined, disableStyleElements: false }. Components SHALL retain existing inline elements without nonce attributes, apart from additive static scrollbar classes. The APIs and props SHALL resolve from @gntik-ai/ui with types and TSDoc.

#### Scenario: Default output

- **WHEN** ScrollArea, Select, Tabs, Slider and PrintLayout render without a provider
- **THEN** their existing inline elements remain and have no nonce attribute

### Requirement: Strict CSP reference setup and documentation

The production Next.js example SHALL generate a fresh nonce per response through proxy.ts, set matching request/response policies, render routes dynamically and pass the nonce through headers() into the client provider and theme script. The reference app SHALL use disableStyleElements and static print CSS when its React server renderer supplies only a script nonce. A custom React 19.3 streaming renderer SHALL supply both script and style nonce options to preserve nonced hoisted style resources. The policy SHALL use script-src 'nonce-X' 'strict-dynamic', style-src-elem 'self' 'nonce-X' and style-src-attr 'unsafe-inline'. Documentation SHALL cover Next.js, Vite html.cspNonce, static hosting with disableStyleElements and theme-bootstrap.js, app stylesheet @page rules and the style attribute caveat. New example strings SHALL have English and Spanish catalog entries.

#### Scenario: Production interactions

- **WHEN** Playwright opens a Select, scrolls a ScrollArea and changes theme in the production example
- **THEN** no securitypolicyviolation event is recorded
- **AND** two consecutive responses have different nonces

#### Scenario: Catalog accessibility

- **WHEN** the new examples render in dark, light and high_contrast
- **THEN** axe reports no violations and styling uses brand tokens

### Requirement: Dependency upgrade inventory

A unit test SHALL inventory Base UI's inline style/script emitters and consumers, including base-ui-disable-scrollbar and PrehydrationScript, so additions or renames require review.

#### Scenario: Upstream inline element changes

- **WHEN** an upgrade changes Base UI's inline element inventory
- **THEN** the inventory test fails visibly

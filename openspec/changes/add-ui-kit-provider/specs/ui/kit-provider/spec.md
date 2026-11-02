## Purpose

Root provider of a kit app: composes the theme, i18n, density, link, tooltip, toast, dialog, CSP and announcer providers with defaults and exposes app-level actions through `useApp()`.

## ADDED Requirements

### Requirement: KitProvider composes the kit providers with defaults

`KitProvider` SHALL render ThemeProvider, TooltipProvider, ToastProvider with exactly one Toaster, DialogsProvider and LiveAnnouncer by default, and SHALL render I18nProvider, DensityProvider, LinkProvider and CSPProvider only when their prop is set, passing each prop object through unchanged. The provider order, outermost first, SHALL be CSP, Theme, I18n, Density, Link, Tooltip, Toast, Dialogs and LiveAnnouncer, followed by children and the Toaster.

#### Scenario: No props

- **WHEN** an app renders `<KitProvider><App /></KitProvider>` and a child calls `useToast().add({ title: 'Saved' })`
- **THEN** the toast is shown in the single Toaster
- **AND** the theme is dark with the gntik preset
- **AND** no extra wrapper element is rendered

#### Scenario: Locale pass-through

- **WHEN** `<KitProvider i18n={{ locale: 'es' }}>` renders a child that reads `useI18n().t('common.cancel')`
- **THEN** the child reads `Cancelar`

#### Scenario: Density, links and persistence

- **WHEN** KitProvider receives `density="compact"`, `link={RouterLink}` and `theme={{ storageKey: null }}`
- **THEN** `useDensity()` returns `compact`, Link renders RouterLink and theme persistence is disabled

### Requirement: Optional providers can be switched off

Setting `toast`, `tooltip` or `announcer` to `false` SHALL omit that provider and its rendered element, so apps can keep their own instance.

#### Scenario: Own toast setup

- **WHEN** `<KitProvider toast={false}>` renders
- **THEN** no ToastProvider or Toaster is rendered by the KitProvider

#### Scenario: Own tooltip and announcer

- **WHEN** `<KitProvider tooltip={false} announcer={false}>` renders
- **THEN** no TooltipProvider or live region is rendered by the KitProvider

### Requirement: useApp exposes toast, confirm and announce

`useApp()` SHALL return the toast API of `useToast`, the `confirm` of `useDialogs` and the `announce` of `useAnnounce` from the nearest KitProvider, and MUST throw an error naming `KitProvider` when called outside one.

#### Scenario: Confirm from a page

- **GIVEN** a page under a KitProvider
- **WHEN** it awaits `useApp().confirm('Delete project?')` and the user confirms
- **THEN** the promise resolves `true`

#### Scenario: Cancel from a page

- **WHEN** the user cancels the confirmation opened by `useApp().confirm('Delete project?')`
- **THEN** the promise resolves `false`

#### Scenario: Announce from a page

- **WHEN** a child calls `useAnnounce()('Moved')`
- **THEN** the single `[data-live-announcer="polite"]` region contains `Moved`

#### Scenario: Outside the provider

- **WHEN** a component outside any KitProvider calls `useApp()`
- **THEN** an error naming `KitProvider` is thrown

### Requirement: Nested KitProvider reuses the app-level singletons

A KitProvider inside another SHALL apply only the props it is given and MUST NOT add a second toast queue, Toaster, dialogs provider or pair of live regions.

#### Scenario: Compact panel

- **GIVEN** an outer KitProvider and an inner `<KitProvider density="compact">`
- **WHEN** a component inside the inner provider adds a toast
- **THEN** the document has one Toaster and it shows the toast
- **AND** `useDensity()` inside the inner provider returns `compact`

### Requirement: Portal container applies to every kit overlay

With `portalContainer`, every kit overlay SHALL portal into that element unless its own `container` prop is set, which MUST take precedence. This includes Dialog, AlertDialog, Drawer, BottomSheet, Popover, HoverCard, Menu, ContextMenu, Select, Combobox, MultiSelect, Tooltip, Toaster, the pickers and the full-screen Dropzone overlay. Without a portal destination, overlays SHALL default to document.body.

#### Scenario: Embedded host

- **GIVEN** `<KitProvider portalContainer={el}>`
- **WHEN** a Dialog and a Select open
- **THEN** both popups are descendants of `el`

#### Scenario: Full-screen file drop

- **GIVEN** `<KitProvider portalContainer={el}>` containing `<Dropzone fullScreen />`
- **WHEN** a file drag enters the window
- **THEN** the full-screen drop target is a descendant of `el`

#### Scenario: Explicit container wins

- **GIVEN** `<KitProvider portalContainer={el}>` and a Popover with `container={other}`
- **WHEN** the Popover opens
- **THEN** its popup is a descendant of `other`

### Requirement: Scoped mode writes nothing to the document element

With `scoped`, KitProvider SHALL apply the theme class, `color-scheme`, `lang`, `dir` and density to its own wrapper element, portal overlays into that wrapper, and MUST NOT add classes or attributes to `<html>`. Scoped mode SHALL provide context only, without CSS isolation; hosts must scope their own --primary and --background variables.

#### Scenario: Kit inside a host page

- **WHEN** `<KitProvider scoped theme={{ defaultMode: 'light' }}>` mounts in a page whose `<html>` has no kit classes
- **THEN** `<html>` still has no kit class or `data-brand` attribute
- **AND** the wrapper carries the theme and an open Dialog renders inside it

### Requirement: Setup and documentation show KitProvider

Vite and Next.js CLI init output, MCP setup guidance and example and product apps SHALL name KitProvider. The catalog SHALL show the prop-to-provider table, own-toast guidance, scoped CSS limitations and live examples. A changeset SHALL record a minor bump of @gntik-ai/ui.

#### Scenario: CLI setup

- **WHEN** init generates a Vite or Next.js app
- **THEN** its root uses KitProvider

#### Scenario: Cookie-provided SSR theme

- **WHEN** apps/example-next renders and hydrates with `theme={{ initialMode }}` from its cookie
- **THEN** hydration produces no warnings

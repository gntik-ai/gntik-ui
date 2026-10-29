## Purpose

useLocalStorage and useSessionStorage provide React state backed by browser storage, with synchronization, safe fallbacks and SSR defaults.

## ADDED Requirements

### Requirement: Stored values are read with a default and written on set

The hooks SHALL return the deserialized stored value or defaultValue when no valid value exists. setValue SHALL accept values and functional updates, persist the serialized result and update all same-document consumers. remove SHALL delete the key and restore each consumer's default. Parsed values SHALL retain referential identity until the raw stored text changes. Changing the key SHALL read the new key.

#### Scenario: First visit

- **GIVEN** no value stored under runs:density
- **WHEN** useLocalStorage('runs:density', 'comfortable') renders
- **THEN** it returns comfortable

#### Scenario: Set and remove

- **WHEN** setValue('compact') and then remove() are called
- **THEN** storage holds the JSON string compact after the first call
- **AND** the key is gone and the value is comfortable after the second

#### Scenario: Batched updates

- **WHEN** two numeric increment updaters run in one handler
- **THEN** the value increases by two

#### Scenario: Changing keys and stable objects

- **GIVEN** a deserialized object under the current key
- **WHEN** the component rerenders without a raw-text change
- **THEN** its value retains referential identity
- **WHEN** the key changes
- **THEN** it returns the value under the new key

### Requirement: Hooks with the same key stay in sync, across tabs for localStorage

Every hook using a storage/key pair SHALL receive writes by another hook in the same document. useLocalStorage SHALL apply matching storage events from other tabs and reset to defaults on clear. sync:false SHALL disable cross-tab updates. useSessionStorage SHALL ignore storage events from other documents and remain separate from localStorage.

#### Scenario: Other tab and clear

- **WHEN** another tab writes spacious under the key
- **THEN** synchronized localStorage consumers return spacious
- **AND** existing sync:false consumers keep their previous value
- **AND** a newly mounted sync:false consumer starts with spacious
- **WHEN** another tab clears localStorage with event key null
- **THEN** synchronized consumers return their defaults

#### Scenario: Session isolation

- **WHEN** a sessionStorage hook updates a key
- **THEN** another sessionStorage hook in the document receives the update
- **AND** localStorage consumers and other-document storage events do not affect that session value

### Requirement: Unavailable storage and invalid data fall back to the default

Storage access SHALL be guarded for unavailable windows and storage exceptions. Invalid JSON, throwing deserialization and rejected validation SHALL return the default without writes. Failed writes SHALL retain new state in memory and call onError. readLocalStorageValue SHALL provide these read fallbacks outside React. No runtime dependencies SHALL be added.

#### Scenario: Private mode

- **GIVEN** getItem throws SecurityError
- **WHEN** the hook renders and setValue('compact') runs
- **THEN** it first returns the default and then compact

#### Scenario: Quota failure

- **GIVEN** setItem throws QuotaExceededError
- **WHEN** a new value is set
- **THEN** rendered state updates and onError receives the error

#### Scenario: Invalid data

- **GIVEN** malformed JSON, a throwing deserialize or validate returning false
- **WHEN** the hook reads
- **THEN** the default is returned and stored text is unchanged

### Requirement: Server render and hydration use the default value

Server rendering and initial hydration MUST return defaultValue without storage access. The hook SHALL restore stored values after hydration without mismatch. Client-only renders SHALL read storage immediately.

#### Scenario: Hydration with stored data

- **GIVEN** server markup rendered with the default and a different stored value
- **WHEN** the client hydrates
- **THEN** no hydration mismatch is reported
- **AND** the stored value renders after hydration

### Requirement: Kit layouts persist through the hook with unchanged keys and formats

SidebarLayout and Resizable SHALL preserve existing public props, storage keys and formats. SidebarLayout SHALL store true/false text and retain its controlled/onChange contract. Resizable SHALL retain gntik-ui:resizable:<id> and two-decimal JSON arrays, validating count, finite non-negative numbers and a sum within one of 100. Pointer moves SHALL stay in local state; only update with persist:true SHALL write.

#### Scenario: Sidebar hydration

- **GIVEN** true stored under SidebarLayout's storageKey
- **WHEN** expanded server markup hydrates
- **THEN** no mismatch warning occurs and the collapsed rail appears

#### Scenario: Upgrade and drag

- **GIVEN** sizes stored under gntik-ui:resizable:editor by the previous release
- **WHEN** the group mounts
- **THEN** it restores valid sizes or uses defaults for invalid/count-mismatched data
- **WHEN** the pointer moves during a drag
- **THEN** no storage write occurs until release

### Requirement: Public hooks ship with documentation and release metadata

The hooks, read helper and option types SHALL be exported from @gntik-ai/ui with TSDoc, tests, live catalog documentation, one minor UI changeset and regenerated registry output. No separate hooks package entry SHALL be added.

#### Scenario: Kit consumer

- **WHEN** a consumer opens the storage catalog example
- **THEN** it demonstrates shared local state, removal, a one-shot read and session state
- **AND** documentation explains safe fallbacks, prefixed keys, sync options and SSR defaults

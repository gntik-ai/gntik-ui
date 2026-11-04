## Purpose

Router-agnostic typed list state in URL query parameters, surviving reload, shared links and navigation.

## ADDED Requirements

### Requirement: URL parameters parse to typed values with defaults

useUrlState(schema) SHALL infer each value from its codec. urlParam SHALL provide string, integer, boolean, enum, array and custom codecs. String SHALL default to empty text and array to an empty array. Scalar parameters SHALL read the first repeated key. Invalid scalar values and throwing custom parsers SHALL return defaults; arrays SHALL drop invalid items. Integers SHALL reject empty, fractional, exponent, unsafe and out-of-bounds values. Reading SHALL NOT write history.

#### Scenario: Shared link

- **GIVEN** q=api&status=failed&status=running&page=3
- **WHEN** string, array of string and integer codecs read it
- **THEN** the typed values are q api, status failed and running, and page 3 without casts

#### Scenario: Invalid values

- **GIVEN** a page value of abc, -2 with min 1, 1e3, 3.5 or empty
- **WHEN** the hook reads with default 1
- **THEN** page is 1 and the URL remains unchanged

### Requirement: Default values are left out of the URL and other parameters are kept

Writes SHALL merge patches or updater results against the current pending snapshot, compare defaults by serialized form, remove all copies of changed keys, and preserve foreign keys and hashes. An unchanged search SHALL cause no history call. Values SHALL retain identity until the search changes, including with inline schemas. Prefixes SHALL isolate keys.

#### Scenario: Clear search

- **GIVEN** /list?q=api&utm_source=x#details
- **WHEN** q is set to empty text
- **THEN** /list?utm_source=x#details remains
- **AND** removing the last key leaves no question mark

### Requirement: Typing replaces history and navigation pushes one entry

throttleMs SHALL default to 50. Values SHALL update immediately for every hook before the delayed write. Updates in a window SHALL merge into one call; any push SHALL make that call a push. History precedence SHALL be call option, key option, then replace. Failed browser writes SHALL be caught and retained in shared memory.

#### Scenario: Search while typing

- **WHEN** six q updates arrive in 300 ms ending at deploy
- **THEN** no push and at most six replaces occur
- **AND** every consumer observes each new value before the write

#### Scenario: Next page

- **GIVEN** page 3 with push history
- **WHEN** page changes to 4
- **THEN** exactly one history entry is added
- **AND** Back restores page 3

### Requirement: Navigation and lifetime govern pending writes

One store per adapter SHALL be held in a WeakMap. Its snapshot SHALL use pending search before adapter search. Subscribers SHALL observe writes and adapter notifications. Popstate SHALL discard pending writes. The last unsubscription SHALL cancel pending work; a browser write SHALL NOT land on a pathname different from the one where it was scheduled. Default listeners SHALL attach lazily and clean up.

#### Scenario: Navigation during typing

- **GIVEN** a pending query update
- **WHEN** popstate arrives or the pathname changes
- **THEN** the old update never overwrites the restored or new route

### Requirement: Adapters replace browser history and support server rendering

UrlStateAdapter SHALL expose getSearch, subscribe and setSearch. UrlStateProvider SHALL supply a memoized adapter; an explicit option SHALL win. Custom adapters SHALL own all reads and writes without browser history or popstate access. The default adapter SHALL avoid module-scope window access, return empty search on the server, preserve history.state on replace, and write pathname plus search plus hash. Custom server snapshots SHALL read getSearch. Documentation SHALL include React Router and Next.js App Router recipes, memoization, short URLs and the initial-default SSR limitation.

#### Scenario: Memory adapter

- **GIVEN** a memory adapter holding q=logs
- **WHEN** q is set to errors
- **THEN** only the memory adapter changes
- **AND** no browser history call or popstate listener occurs

#### Scenario: Hydration

- **WHEN** the default adapter renders on the server and hydrates a deep link
- **THEN** it renders defaults first without throwing or a hydration mismatch
- **AND** it subsequently restores query values

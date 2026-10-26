## Purpose

CodeBlock is a read-only code panel with a filename and language header, copy feedback, line numbers, highlighted lines, a wrap toggle, a max height and token-coloured syntax.

## ADDED Requirements

### Requirement: Provider highlighter colours blocks without a highlight prop

Under CodeHighlighterProvider, CodeBlock SHALL tokenize the whole source with the provider highlighter. A block's highlight prop SHALL retain per-line precedence; without a provider the built-in tokenizer SHALL run as before. Results SHALL be memoised by source, language and highlighter, and refreshed when a language loads.

#### Scenario: Provider at the root

- **GIVEN** a provider with YAML loaded
- **WHEN** a YAML CodeBlock renders
- **THEN** its tokens come from the provider and preserve the source text

#### Scenario: Per-block override

- **WHEN** a block inside the provider passes highlight
- **THEN** the callback receives each line and language as before
- **AND** the provider is never called

#### Scenario: No provider

- **WHEN** an existing CodeBlock renders without a provider
- **THEN** its markup remains identical

### Requirement: Highlighter tokens use safe token classes and preserve source

CodeBlock SHALL render provider tokens only through tokenClass, ignoring supplied classes, styles and colours. Unknown kinds SHALL become plain. Invalid token text or line counts SHALL fall back to the built-in tokenizer.

#### Scenario: Untrusted tokens

- **WHEN** provider tokens contain foreign styles or kinds
- **THEN** foreign fields are ignored and unknown kinds render as plain text
- **AND** only gutter spans inside code have inline styles

#### Scenario: Altered text or layout

- **WHEN** provider tokens change text or the number of lines
- **THEN** the built-in tokenizer renders the original source and line count

### Requirement: Languages load once with unchanged layout

CodeBlock SHALL use built-in tokens or plain text until load resolves true. Concurrent blocks SHALL share one promise per highlighter instance and language. Completion after unmount SHALL NOT update state.

#### Scenario: Two YAML blocks

- **GIVEN** two YAML blocks under one provider
- **WHEN** they render
- **THEN** load runs once and both blocks acquire colours without text or line count changes

### Requirement: Unavailable languages retain fallback and warn only in development

If load resolves false or rejects and the built-in tokenizer does not support the language, CodeBlock SHALL stay plain and warn once per language per page when process.env.NODE_ENV is not production.

#### Scenario: Unknown language

- **WHEN** several cobol blocks render or re-render
- **THEN** they remain plain and emit one development warning naming cobol
- **AND** production emits no warning

#### Scenario: Built-in language

- **WHEN** ts is not configured in the adapter
- **THEN** built-in colours remain and no warning is emitted

### Requirement: Lazy adapter maps grammar scopes into token kinds

The optional code-highlight-shiki entry SHALL dynamically load Shiki core, the JavaScript regex engine without WebAssembly and each grammar on demand. The core UI runtime entry SHALL contain no Shiki reference. Shiki SHALL be an optional peer. Defaults SHALL be yaml, python, go and sql, with yml, py, golang and postgresql aliases. The languages option SHALL allow additional or overriding grammar loaders.

Scopes SHALL be evaluated innermost first: comment; string; constant.numeric and constant.language as number; keyword and storage as keyword; entity.name.function and support.function as function; entity.name.type, entity.name.class, support.type and support.class as type; entity.name.tag, support.type.property-name and variable.other.property as property; punctuation; otherwise plain. More specific property-name matches SHALL precede the general support.type match.

#### Scenario: YAML keys and strings

- **WHEN** name: "api" loads as YAML
- **THEN** name uses the property class and string content uses the string class
- **AND** delimiters follow their innermost punctuation scope

#### Scenario: Python multiline strings

- **WHEN** a Python function contains a three-line triple-quoted string
- **THEN** def is a keyword, its name is a function and string content on all three lines is coloured

#### Scenario: Optional entry

- **WHEN** consumers import only the core UI entry
- **THEN** no Shiki runtime is imported

#### Scenario: Grammar or engine failure

- **WHEN** a grammar or the JavaScript regex engine cannot load
- **THEN** the adapter reports an unavailable language and CodeBlock retains its fallback

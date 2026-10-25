## Purpose

Safe, extensible Markdown for untrusted model output with GitHub-flavoured syntax, token styles and streaming fence repair.

## ADDED Requirements

### Requirement: Element overrides merge over kit renderers

Markdown SHALL merge components over its kit renderers and MUST filter URL attributes before overrides receive them. No prop SHALL override skipHtml or safeUrl.

#### Scenario: Override a quote and an unsafe link

- **WHEN** a blockquote override renders a reply with headings, a table and an unsafe link
- **THEN** the override renders the quote and headings/tables keep kit renderers
- **AND** an overridden a receives an empty href for javascript:alert(1)

### Requirement: Code renderers receive language and completion

Markdown SHALL match codeRenderers keys case-insensitively and pass code, lowercase language, streaming and complete. Complete MUST be false only for the fence closed by streaming repair. Unmapped fences SHALL keep CodeBlock.

#### Scenario: Closed and partial chart fences

- **WHEN** a streaming reply contains a closed chart fence, a ts fence and an open chart fence
- **THEN** only the open chart receives complete false and all chart renderers receive streaming true
- **AND** the ts fence retains CodeBlock

### Requirement: Only registered custom blocks consume source

Markdown SHALL render standalone registered customTags through their component with Markdown children, filtered string attributes, streaming and complete. Attributes MUST exclude style and case-insensitive on* keys. An unclosed tag MUST consume to end only while streaming. Unknown, malformed, stray and non-streaming unclosed tags MUST retain normal Markdown handling. Fenced code MUST NOT be interpreted as custom tags.

#### Scenario: Reasoning with blank lines and attributes

- **WHEN** think wraps Plan **steps**, with or without blank lines, and attributes onclick and kind
- **THEN** the registered component contains strong steps and receives only kind
- **AND** the paragraph after its closing tag renders outside it

#### Scenario: Unknown or incomplete blocks preserve prose

- **WHEN** the reply includes br, div, kbd, details, unknown paired tags, stray closing tags or an unclosed registered tag in a non-streaming reply
- **THEN** customTags never loses text visible with default rendering, including later paragraphs and text between unknown pairs
- **AND** a streaming registered partial block receives complete false and partial children

#### Scenario: Linear scan

- **WHEN** 800 lines of unregistered b elements render with customTags set
- **THEN** the custom-tag scan is linear and the source is parsed once, as without customTags

### Requirement: Plugins preserve kit order and final URL filtering

Markdown SHALL run remark-gfm before user remarkPlugins and kit HTML processing before user rehypePlugins. ReactMarkdown MUST apply safeUrl after every plugin.

#### Scenario: GFM and plugin-created unsafe links

- **WHEN** a remark spy sees a table and a rehype plugin creates a javascript link
- **THEN** the spy observes a GFM table and the table renders
- **AND** no rendered URL contains javascript

### Requirement: Opt-in HTML uses a private fixed subset

Markdown MUST skip raw HTML by default. allowHtml SHALL lazily import rehype-raw and rehype-sanitize only on first use and keep HTML skipped until loaded. The fixed raw subset SHALL be b, strong, i, em, u, s, del, sub, sup, kbd, mark, abbr with title, br, details with open and summary. All event handlers and style attributes MUST be removed. Other raw elements SHALL unwrap retaining text; only script, style, iframe, object, embed, form, media, svg, math, template and textarea SHALL drop content.

#### Scenario: Safe subset and XSS vectors

- **WHEN** allowHtml renders b and details/summary beside scripts, frames, images with onerror, styled elements and a javascript link
- **THEN** the subset renders without unsafe elements, attributes or URLs
- **AND** disabling allowHtml skips HTML again

#### Scenario: Unwrapping preserves every word

- **WHEN** raw kbd, a and code appear in the sentence Press Ctrl, see the docs and npm i
- **THEN** every word and all later paragraphs remain visible
- **AND** Markdown-generated links, code and GFM tables retain their normal behavior

### Requirement: Context and safe defaults remain stable

useMarkdownContext SHALL return the enclosing Markdown streaming state to overrides, code renderers and custom tags and false outside Markdown. Without new props, the existing DOM SHALL remain unchanged.

#### Scenario: Stream state

- **WHEN** a renderer reads context inside streaming Markdown
- **THEN** streaming is true
- **AND** it is false in non-streaming Markdown and outside the provider

### Requirement: Extensions have accessible translated documentation

MarkdownCustom SHALL demonstrate a callout, chart fence, think block, plugins, allowHtml and partial streaming using kit components and token classes. New copy MUST have en/es catalog entries. Documentation MUST warn that overrides receive untrusted text and require stable component maps and plugin arrays.

#### Scenario: Three themes

- **WHEN** the custom example renders in dark, light and high_contrast
- **THEN** axe reports no violations

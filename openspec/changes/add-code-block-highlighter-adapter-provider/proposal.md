# Change: CodeBlock provider and lazy grammar adapter

## Why

CodeBlock's built-in tokenizer handles a small language set. Per-block, per-line overrides cannot share grammar state for multiline strings. Applications need an optional whole-source highlighter that retains contrast-safe token classes.

## What changes

- Add CodeHighlighter, CodeHighlighterProvider and useCodeHighlighter to the core UI entry.
- Resolve per-line overrides first, whole-source provider tokens second and the existing tokenizer last. Validate source text, line counts and token kinds at the provider boundary.
- Share lazy loads by highlighter instance and language, with one development warning per unavailable language per page and guarded updates after unmount.
- Add the separate optional-peer code-highlight-shiki entry. Lazily import Shiki core, the JavaScript regex engine and YAML, Python, Go and SQL grammars. Map innermost TextMate scopes into existing token kinds, using a colourless internal theme.
- Document installation, custom grammars, stable instances and maxHeight for long files; show all default languages in a live example.
- Add a minor UI changeset and regenerate registry output.

## Scope and risk

Issue #222, R2. Additive and opt-in: provider-free markup and per-line highlight callbacks retain their behaviour. Built-in languages remain owned by the built-in tokenizer unless explicitly configured. No chat Markdown, editor, separate package, publishing or deployment changes. Rollback is a previous UI version pin or revert. Modern RegExp support is required by the JavaScript regex engine; failed loads retain the fallback. Long files tokenize on the main thread; results are memoised and maxHeight limits visible height.

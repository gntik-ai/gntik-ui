import type { ComponentDoc } from '../../doc';

// Preserve the lightweight metadata exported by the core runtime entry.
export const codeBlockDoc: ComponentDoc = {
  name: 'CodeBlock',
  group: 'Display',
  status: 'beta',
  description:
    'Read-only code panel with a filename / language header, a copy button ("Copied" feedback plus a polite live announcement), optional line numbers, highlighted lines, a soft-wrap toggle and a max height. Default colouring is a minimal tokenizer for ts/tsx/js/json/bash/css that only uses contrast-safe text tokens; use CodeHighlighterProvider for whole-source grammars, or pass `highlight` for a per-line override. Code is the inline variant for running text.',
  pattern: 'button · region',
  keyboard: [
    ['Tab', 'Moves through the wrap toggle, the copy button and the scrollable code region'],
    ['Enter', 'Copies the code (on the copy button) or toggles wrapping (on the wrap toggle)'],
    ['Space', 'Same as Enter'],
    ['Arrow keys', 'Scroll the focused code region'],
  ],
  tokens: [
    'card',
    'background',
    'border',
    'secondary',
    'foreground',
    'muted-foreground',
    'primary',
    'primary-text',
    'warning-text',
    'destructive-text',
    'focus-ring',
  ],
};

// The catalog and registry read `doc`; this unexported-by-core object is tree-shaken from its bundle.
export const doc: ComponentDoc = {
  ...codeBlockDoc,
  description: `Read-only code panel with optional whole-source grammars: install the optional peer with \`pnpm add shiki\`, then import \`createShikiHighlighter\` from \`@gntik-ai/ui/code-highlight-shiki\` and wrap blocks in \`<CodeHighlighterProvider highlighter={highlighter}>\`. ${codeBlockDoc.description} Keep the instance stable with useMemo or create it outside render. The adapter lazily loads YAML, Python, Go and SQL (yml/py/golang/postgresql aliases), using the JavaScript regex engine without WebAssembly. Other languages retain the built-in tokenizer; unavailable languages stay plain and warn once in development. Add grammars with \`createShikiHighlighter({ languages: { toml: loadTomlGrammar } })\`, as the live example demonstrates. Each async loader returns a Shiki LanguageInput and can also override a default grammar. Custom CodeHighlighter implementations return CodeToken[][] for the whole source or null, with optional load(language): Promise<boolean>; useCodeHighlighter reads the nearest provider. Provider tokens use tokenClass only; invalid text or line counts fall back to the built-in tokenizer. Use maxHeight for long files to keep the panel scrollable; tokenization still runs on the main thread and is memoised.`,
};

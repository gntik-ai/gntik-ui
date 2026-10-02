import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// Brand rules (CLAUDE.md "Reglas"): token classes only — no Tailwind palette colours,
// no `dark:` variants (themes swap tokens), no gradients, no hex colours in class strings.
const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white';
const BRAND_PATTERNS = [
  [`\\b(bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|divide|decoration|accent|caret)-(${PALETTE})(-\\d{2,3})?\\b`, 'Use brand token classes (bg-primary, text-muted-foreground…), not Tailwind palette colours.'],
  ['(^|\\s)dark:', 'No dark: variants — themes swap the tokens.'],
  ['\\b(bg-(linear|radial|conic|gradient)-|from-|via-)', 'No gradients (brand rule).'],
  ['(^|[\\s\\[])#[0-9a-fA-F]{3,8}\\b', 'No hex colours — use tokens.'],
];
const brandRule = [
  'error',
  ...BRAND_PATTERNS.flatMap(([re, message]) => [
    { selector: `Literal[value=/${re}/]`, message },
    { selector: `TemplateElement[value.raw=/${re}/]`, message },
  ]),
];

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', 'apps/docs/public/**', 'apps/docs/legacy-index.html', 'registry.json'] },
  js.configs.recommended,
  {
    files: ['packages/mcp/src/**/*.ts'],
    extends: [tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    // Component packages: TypeScript + React hooks + brand rules.
    files: ['packages/{ui,icons,charts,flow,editor}/**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: { globals: globals.browser },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-restricted-syntax': brandRule,
    },
  },
  {
    // Logo artwork is the one allow-listed place for literal colours.
    files: ['packages/ui/src/theme/presets.tsx', 'packages/ui/src/theme/musematic-mark.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    // Catalog sections: written against window globals (see CLAUDE.md).
    files: ['apps/docs/src/**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser, React: 'readonly', ReactDOM: 'readonly' },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'no-unused-vars': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
);

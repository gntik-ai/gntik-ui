import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DesignSystemIndex, TokenTheme } from './types.js';
import { parseTokens } from './indexer.js';

export const PALETTE_RULE =
  'Named palettes come only from @gntik-ai/tokens: green is the default, navy is opt-in. Each palette covers every light/dark colour and shadow token and passes contrast checks. High contrast and categorical accents are shared; brand.css stays frozen. Presets may select a palette; components use token classes only.';

export function paletteRules(rules?: string): string {
  return (
    '## Palette amendment\nThis palette amendment supersedes the single-green restriction in the source rules below; other source rules still apply.\n\n' +
    PALETTE_RULE +
    '\n\n## Source rules (verbatim; agent-config update pending)\n\n' +
    (rules ?? '')
  );
}

const read = (index: DesignSystemIndex, file: string) =>
  readFileSync(join(index.root, 'packages/tokens/src', file), 'utf8');

// The standalone MCP image has no tokens package dependency. Discover its snapshot's
// palettes from the published CSS entrypoint instead of maintaining another id list.
export function paletteIds(index: DesignSystemIndex): [string, ...string[]] {
  return [
    'green',
    ...[...read(index, 'palettes/index.css').matchAll(/@import\s+["']\.\/([\w-]+)\.css["']/g)].map((m) => m[1]),
  ];
}

export function paletteCss(index: DesignSystemIndex, palette: string): string {
  const common = [index.tokensCss, read(index, 'status.css'), read(index, 'pairing.css'), read(index, 'scope.css')];
  if (palette !== 'green') common.push(read(index, `palettes/${palette}.css`));
  return `/* Palettes: ${paletteIds(index).join(', ')}. Green is the default. Select with data-palette. */\n${common.join('\n')}`;
}

export function paletteThemes(index: DesignSystemIndex, palette: string): (TokenTheme & { palette: string })[] {
  const status = parseTokens(read(index, 'status.css'));
  if (palette === 'green')
    return index.themes.map((theme) => ({
      ...theme,
      palette,
      tokens: { ...theme.tokens, ...status.find((s) => s.theme === theme.theme)?.tokens },
    }));
  const paletteTokens = parseTokens(read(index, `palettes/${palette}.css`), ['light', 'dark']);
  return index.themes.map((theme) => {
    const tokens = paletteTokens.find((t) => t.theme === theme.theme)?.tokens;
    return {
      ...theme,
      palette,
      tokens:
        theme.theme === 'high_contrast'
          ? { ...theme.tokens, ...status.find((s) => s.theme === theme.theme)?.tokens }
          : { ...index.themes.find((t) => t.theme === 'light')?.tokens, ...tokens },
    };
  });
}

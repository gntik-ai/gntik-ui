import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DesignSystemIndex, TokenTheme } from './types.js';
import { parseTokens } from './indexer.js';

export const PALETTES = ['green', 'navy'] as const;
export type PaletteId = (typeof PALETTES)[number];
export const PALETTE_RULE =
  'Named palettes come only from @gntik-ai/tokens: green is the default, navy is opt-in. Each palette covers every light/dark colour and shadow token and passes contrast checks. High contrast and categorical accents are shared; brand.css stays frozen. Presets may select a palette; components use token classes only.';

export function paletteRules(rules?: string): string {
  return (
    (rules ?? '').replace(
      /Mono-brand verde \(hue 145\)\s*único color de marca|Mono-brand green/g,
      'Named kit palettes',
    ) +
    '\n\n' +
    PALETTE_RULE
  );
}

const read = (index: DesignSystemIndex, file: string) =>
  readFileSync(join(index.root, 'packages/tokens/src', file), 'utf8');

export function paletteCss(index: DesignSystemIndex, palette: PaletteId): string {
  const common = [index.tokensCss, read(index, 'status.css'), read(index, 'pairing.css'), read(index, 'scope.css')];
  if (palette !== 'green') common.push(read(index, `palettes/${palette}.css`));
  return `/* Palettes: green (default), navy. Select with data-palette. */\n${common.join('\n')}`;
}

export function paletteThemes(index: DesignSystemIndex, palette: PaletteId): (TokenTheme & { palette: PaletteId })[] {
  const status = parseTokens(read(index, 'status.css'));
  if (palette === 'green')
    return index.themes.map((theme) => ({
      ...theme,
      palette,
      tokens: { ...theme.tokens, ...status.find((s) => s.theme === theme.theme)?.tokens },
    }));
  const blocks = [
    ...read(index, `palettes/${palette}.css`)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .matchAll(/([^{}]+)\{([^{}]*)\}/g),
  ].filter(([, selector]) => !selector.trim().startsWith('@'));
  return index.themes.map((theme) => {
    const body = blocks[theme.theme === 'light' ? 0 : 1]?.[2] ?? '';
    const tokens = Object.fromEntries(
      [...body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]),
    );
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

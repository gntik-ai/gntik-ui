import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tokenHex } from '@gntik-ai/tokens/runtime';
import { BRAND_THEMES, brandThemeData, brandThemeFor, contrastRatio, defineBrandThemes, mixHex, readableOn } from './theme';
import { mockTokens } from './test/tokens';

const TOKENS = [
  'primary', 'foreground', 'muted-foreground', 'border', 'card', 'popover', 'destructive', 'info',
  'category-cyan', 'category-amber', 'category-violet', 'category-rose',
];

describe('brand themes', () => {
  beforeEach(() => {
    mockTokens();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps gntik-ui themes to Monaco theme names', () => {
    expect(brandThemeFor('dark')).toBe('gntik-dark');
    expect(brandThemeFor('light')).toBe('gntik-light');
    expect(brandThemeFor('high_contrast')).toBe('gntik-hc');
    document.documentElement.className = 'high_contrast';
    expect(brandThemeFor()).toBe('gntik-hc');
  });

  it('builds every colour from tokenHex output only', () => {
    document.documentElement.className = 'dark';
    const data = brandThemeData('dark');
    const allowed = new Set(TOKENS.map((t) => tokenHex(t)));
    const base = (hex: string) => hex.slice(0, 7);
    for (const [key, value] of Object.entries(data.colors)) {
      expect(value).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/);
      // Bracket colours are syntax text: tokens, or tokens mixed toward foreground to read.
      if (!key.startsWith('editorBracketHighlight')) expect(allowed.has(base(value))).toBe(true);
    }
    // Syntax colours are tokens, or a token mixed toward foreground until it reads on the card.
    const card = tokenHex('card');
    for (const rule of data.rules) {
      const hex = `#${rule.foreground ?? ''}`;
      expect(allowed.has(hex) || contrastRatio(hex, card) >= 4.5).toBe(true);
    }
    expect(data.colors['editor.background']).toBe(tokenHex('card'));
    expect(data.rules.find((r) => r.token === 'keyword')?.foreground).toBe(
      readableOn(tokenHex('primary'), tokenHex('card'), tokenHex('foreground')).slice(1),
    );
    expect(data.base).toBe('vs-dark');
    expect(data.inherit).toBe(true);
  });

  it('uses the right Monaco base per theme', () => {
    expect(brandThemeData('light').base).toBe('vs');
    expect(brandThemeData('high_contrast').base).toBe('hc-black');
  });

  it('registers all three themes with values resolved per theme', () => {
    const defineTheme = vi.fn();
    defineBrandThemes({ editor: { defineTheme } });
    expect(defineTheme.mock.calls.map(([name]) => name).sort()).toEqual(Object.values(BRAND_THEMES).sort());
    const bg = (name: string) =>
      (defineTheme.mock.calls.find(([n]) => n === name)?.[1] as { colors: Record<string, string> }).colors[
        'editor.background'
      ];
    expect(new Set([bg('gntik-light'), bg('gntik-dark'), bg('gntik-hc')]).size).toBe(3);
    expect(document.body.children).toHaveLength(0); // probes cleaned up
  });
});

describe('readableOn', () => {
  // The real light theme from brand.css: syntax accents on the white card.
  const css = readFileSync(resolve(import.meta.dirname, '../../tokens/src/brand.css'), 'utf8');
  const light = css.slice(0, css.indexOf('.dark{'));
  const hex = (name: string) => {
    const m = new RegExp(`--${name}:\\s*([\\d.]+) ([\\d.]+)% ([\\d.]+)%`).exec(light);
    if (!m) throw new Error(`no --${name}`);
    const [h, sat, l] = [Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100];
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const v = l - sat * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(v * 255).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  const card = hex('card');
  const fg = hex('foreground');
  it.each(['primary', 'category-amber', 'category-cyan', 'category-rose', 'category-violet'])(
    'lifts %s to AA on the light card',
    (token) => {
      expect(contrastRatio(hex(token), card)).toBeGreaterThan(1);
      expect(contrastRatio(readableOn(hex(token), card, fg), card)).toBeGreaterThanOrEqual(4.5);
    },
  );
  it('reads on the current-line highlight too', () => {
    const lineBg = mixHex(card, fg, 0x0d / 255);
    for (const token of ['primary', 'category-amber', 'category-cyan', 'category-rose']) {
      expect(contrastRatio(readableOn(hex(token), lineBg, fg), lineBg)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('keeps colours that already pass', () => {
    expect(readableOn(fg, card, fg)).toBe(fg);
  });
});

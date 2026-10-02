import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tokenHex } from '@gntik-ai/tokens/runtime';
import { BRAND_THEMES, brandThemeData, brandThemeFor, defineBrandThemes } from './theme';
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
    for (const value of Object.values(data.colors)) {
      expect(value).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/);
      expect(allowed.has(base(value))).toBe(true);
    }
    for (const rule of data.rules) {
      expect(allowed.has(`#${rule.foreground ?? ''}`)).toBe(true);
    }
    expect(data.colors['editor.background']).toBe(tokenHex('card'));
    expect(data.rules.find((r) => r.token === 'keyword')?.foreground).toBe(tokenHex('primary').slice(1));
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

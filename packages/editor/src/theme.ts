import type { editor } from 'monaco-editor';
import { currentTheme, tokenHex, type Theme } from '@gntik-ai/tokens/runtime';

/** Monaco theme names registered by `defineBrandThemes`. */
export const BRAND_THEMES = {
  dark: 'gntik-dark',
  light: 'gntik-light',
  high_contrast: 'gntik-hc',
} as const satisfies Record<Theme, string>;

export type BrandThemeName = (typeof BRAND_THEMES)[Theme];

/** The subset of the Monaco API the theme helpers touch (keeps them mock-friendly). */
export interface MonacoThemeApi {
  editor: Pick<typeof editor, 'defineTheme'>;
}

const BASE: Record<Theme, editor.BuiltinTheme> = {
  dark: 'vs-dark',
  light: 'vs',
  high_contrast: 'hc-black',
};

/** Monaco theme name for a gntik-ui theme. Defaults to the active <html> theme. */
export function brandThemeFor(theme: Theme = currentTheme()): BrandThemeName {
  return BRAND_THEMES[theme];
}

/** Syntax token → brand token. Keywords use the brand green; the rest, categorical accents. */
const RULES: ReadonlyArray<readonly [token: string, color: string, fontStyle?: string]> = [
  ['', 'foreground'],
  ['comment', 'muted-foreground', 'italic'],
  ['keyword', 'primary'],
  ['keyword.json', 'primary'],
  ['operator', 'primary'],
  ['operators', 'primary'],
  ['tag', 'primary'],
  ['string', 'category-cyan'],
  ['string.escape', 'category-amber'],
  ['string.key.json', 'primary'],
  ['string.value.json', 'category-cyan'],
  ['attribute.value', 'category-cyan'],
  ['attribute.name', 'category-violet'],
  ['number', 'category-amber'],
  ['constant', 'category-amber'],
  ['regexp', 'category-rose'],
  ['type', 'category-violet'],
  ['type.identifier', 'category-violet'],
  ['identifier', 'foreground'],
  ['delimiter', 'muted-foreground'],
  ['delimiter.bracket', 'muted-foreground'],
  ['annotation', 'category-rose'],
  ['metatag', 'category-rose'],
];

/**
 * Builds Monaco theme data from the live brand tokens read on `el`
 * (default: <html>). Every colour comes from `tokenHex`; alpha is a hex suffix.
 */
export function brandThemeData(theme: Theme, el?: Element): editor.IStandaloneThemeData {
  const c = (name: string) => tokenHex(name, el);
  const primary = c('primary');
  const muted = c('muted-foreground');
  const border = c('border');
  const fg = c('foreground');
  const card = c('card');
  const popover = c('popover');
  const destructive = c('destructive');
  const transparent = `${card}00`;

  return {
    base: BASE[theme],
    inherit: true,
    rules: RULES.map(([token, color, fontStyle]) => ({
      token,
      foreground: c(color).slice(1),
      ...(fontStyle ? { fontStyle } : {}),
    })),
    colors: {
      'editor.background': card,
      'editor.foreground': fg,
      'editorLineNumber.foreground': `${muted}59`,
      'editorLineNumber.activeForeground': primary,
      'editorCursor.foreground': primary,
      'editor.selectionBackground': `${primary}33`,
      'editor.inactiveSelectionBackground': `${primary}1f`,
      'editor.selectionHighlightBackground': `${primary}1f`,
      'editor.lineHighlightBackground': `${fg}0d`,
      'editor.lineHighlightBorder': transparent,
      'editorIndentGuide.background': `${border}99`,
      'editorIndentGuide.activeBackground': `${primary}80`,
      'editorGutter.background': card,
      'editorWhitespace.foreground': border,
      'editorBracketMatch.background': `${primary}26`,
      'editorBracketMatch.border': `${primary}99`,
      'editorBracketHighlight.foreground1': primary,
      'editorBracketHighlight.foreground2': c('category-violet'),
      'editorBracketHighlight.foreground3': c('category-cyan'),
      'editorOverviewRuler.border': transparent,
      'scrollbarSlider.background': `${muted}2e`,
      'scrollbarSlider.hoverBackground': `${muted}4d`,
      'scrollbarSlider.activeBackground': `${muted}70`,
      'editorWidget.background': popover,
      'editorWidget.border': border,
      'editorSuggestWidget.background': popover,
      'editorSuggestWidget.border': border,
      'editorSuggestWidget.selectedBackground': `${primary}26`,
      'editorSuggestWidget.highlightForeground': primary,
      'editorHoverWidget.background': popover,
      'editorHoverWidget.border': border,
      'editorGutter.modifiedBackground': c('info'),
      'editorGutter.addedBackground': primary,
      'editorGutter.deletedBackground': destructive,
      'minimap.background': card,
      'minimapSlider.background': `${muted}24`,
      'diffEditor.insertedTextBackground': `${primary}26`,
      'diffEditor.removedTextBackground': `${destructive}2e`,
      'diffEditor.insertedLineBackground': `${primary}14`,
      'diffEditor.removedLineBackground': `${destructive}14`,
      'diffEditorGutter.insertedLineBackground': `${primary}24`,
      'diffEditorGutter.removedLineBackground': `${destructive}24`,
      'diffEditor.diagonalFill': `${border}80`,
    },
  };
}

/** Theme class a probe element needs to resolve a theme's tokens. Light is `:root`. */
const PROBE_CLASS: Record<Theme, string> = { dark: 'dark', light: '', high_contrast: 'high_contrast' };

/**
 * Registers `gntik-dark`, `gntik-light` and `gntik-hc` from the live brand tokens.
 * The active theme is read from <html>; dark and high contrast are resolved on a
 * hidden probe carrying their class. Light lives on `:root`, so while another
 * theme is active it cannot be resolved exactly — call again after every theme
 * switch (the components do this through `observeTheme`).
 */
export function defineBrandThemes(monaco: MonacoThemeApi): void {
  const active = currentTheme();
  const doc = typeof document === 'undefined' ? undefined : document;
  for (const theme of Object.keys(BRAND_THEMES) as Theme[]) {
    let probe: HTMLElement | undefined;
    if (theme !== active && doc && PROBE_CLASS[theme]) {
      probe = doc.createElement('div');
      probe.className = PROBE_CLASS[theme];
      probe.hidden = true;
      doc.body.appendChild(probe);
    }
    try {
      monaco.editor.defineTheme(BRAND_THEMES[theme], brandThemeData(theme, probe));
    } finally {
      probe?.remove();
    }
  }
}

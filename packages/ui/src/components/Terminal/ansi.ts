/**
 * ANSI escape handling for Terminal: SGR (`ESC[…m`) styles become segments; every other escape
 * sequence (cursor moves, OSC titles / links, …) is dropped. Colours map to TOKEN classes only.
 */

export const ANSI_COLORS = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] as const;
export type AnsiBaseColor = (typeof ANSI_COLORS)[number];
/** The 8 normal colours and their 8 bright variants (`brightRed`…). 256 / true colours snap to these. */
export type AnsiColor = AnsiBaseColor | `bright${Capitalize<AnsiBaseColor>}`;

export interface AnsiStyle {
  fg?: AnsiColor;
  bg?: AnsiColor;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  inverse?: boolean;
  strikethrough?: boolean;
}

export interface AnsiSegment extends AnsiStyle {
  text: string;
}

const ESC = 27;
const BEL = 7;

const bright = (c: AnsiBaseColor): AnsiColor => `bright${c[0]?.toUpperCase()}${c.slice(1)}` as AnsiColor;
const color = (index: number, isBright: boolean): AnsiColor | undefined => {
  const base = ANSI_COLORS[index];
  if (!base) return undefined;
  return isBright ? bright(base) : base;
};

/** RGB (0–255) → nearest of the 16 colours: each channel on/off, bright when any channel is high. */
function snapRgb(r: number, g: number, b: number): AnsiColor | undefined {
  const index = (r >= 128 ? 1 : 0) | (g >= 128 ? 2 : 0) | (b >= 128 ? 4 : 0);
  const max = Math.max(r, g, b);
  if (index === 0) return max >= 64 ? 'brightBlack' : 'black';
  return color(index, max >= 200 && index !== 7 ? true : index === 7 && max >= 230);
}

/** xterm 256-colour index → one of the 16. */
function snap256(n: number): AnsiColor | undefined {
  if (n < 8) return color(n, false);
  if (n < 16) return color(n - 8, true);
  if (n >= 232) {
    const level = 8 + (n - 232) * 10;
    return level < 64 ? 'black' : level < 160 ? 'brightBlack' : level < 230 ? 'white' : 'brightWhite';
  }
  const cube = n - 16;
  const steps = [0, 95, 135, 175, 215, 255];
  return snapRgb(steps[Math.floor(cube / 36) % 6] ?? 0, steps[Math.floor(cube / 6) % 6] ?? 0, steps[cube % 6] ?? 0);
}

/** Applies one SGR parameter list to a style (mutates `style`). */
function applySgr(style: AnsiStyle, params: number[]) {
  if (params.length === 0) params = [0];
  for (let i = 0; i < params.length; i++) {
    const p = params[i] ?? 0;
    if (p === 0) {
      for (const key of Object.keys(style) as Array<keyof AnsiStyle>) delete style[key];
    } else if (p === 1) style.bold = true;
    else if (p === 2) style.dim = true;
    else if (p === 3) style.italic = true;
    else if (p === 4) style.underline = true;
    else if (p === 7) style.inverse = true;
    else if (p === 9) style.strikethrough = true;
    else if (p === 21 || p === 22) {
      delete style.bold;
      delete style.dim;
    } else if (p === 23) delete style.italic;
    else if (p === 24) delete style.underline;
    else if (p === 27) delete style.inverse;
    else if (p === 29) delete style.strikethrough;
    else if (p >= 30 && p <= 37) style.fg = color(p - 30, false);
    else if (p >= 90 && p <= 97) style.fg = color(p - 90, true);
    else if (p === 39) delete style.fg;
    else if (p >= 40 && p <= 47) style.bg = color(p - 40, false);
    else if (p >= 100 && p <= 107) style.bg = color(p - 100, true);
    else if (p === 49) delete style.bg;
    else if (p === 38 || p === 48) {
      const mode = params[i + 1];
      let value: AnsiColor | undefined;
      if (mode === 5) {
        value = snap256(params[i + 2] ?? 0);
        i += 2;
      } else if (mode === 2) {
        value = snapRgb(params[i + 2] ?? 0, params[i + 3] ?? 0, params[i + 4] ?? 0);
        i += 4;
      } else {
        i += 1;
      }
      if (p === 38) style.fg = value;
      else style.bg = value;
    }
  }
}

const sameStyle = (a: AnsiStyle, b: AnsiStyle) =>
  a.fg === b.fg &&
  a.bg === b.bg &&
  !!a.bold === !!b.bold &&
  !!a.dim === !!b.dim &&
  !!a.italic === !!b.italic &&
  !!a.underline === !!b.underline &&
  !!a.inverse === !!b.inverse &&
  !!a.strikethrough === !!b.strikethrough;

const snapshot = (style: AnsiStyle): AnsiStyle => {
  const out: AnsiStyle = {};
  for (const [key, value] of Object.entries(style) as Array<[keyof AnsiStyle, AnsiStyle[keyof AnsiStyle]]>) {
    if (value !== undefined && value !== false) (out as Record<string, unknown>)[key] = value;
  }
  return out;
};

/**
 * Parses text with ANSI escapes into styled segments, starting from `initial` (the style carried
 * over from earlier output). Returns the segments and the style in effect at the end.
 */
export function parseAnsiState(text: string, initial: AnsiStyle = {}): { segments: AnsiSegment[]; style: AnsiStyle } {
  const segments: AnsiSegment[] = [];
  const style: AnsiStyle = { ...initial };
  let current = snapshot(style);
  let buffer = '';
  const flush = () => {
    if (!buffer) return;
    const last = segments[segments.length - 1];
    if (last && sameStyle(last, current)) last.text += buffer;
    else segments.push({ ...current, text: buffer });
    buffer = '';
  };
  let i = 0;
  while (i < text.length) {
    const code = text.charCodeAt(i);
    if (code === ESC) {
      const kind = text[i + 1];
      if (kind === '[') {
        let j = i + 2;
        while (j < text.length && !(text.charCodeAt(j) >= 0x40 && text.charCodeAt(j) <= 0x7e)) j++;
        if (text[j] === 'm') {
          const raw = text.slice(i + 2, j);
          const params = raw === '' ? [] : raw.split(/[;:]/).map((n) => (n === '' ? 0 : Number.parseInt(n, 10) || 0));
          flush();
          applySgr(style, params);
          current = snapshot(style);
        }
        i = j + 1;
      } else if (kind === ']') {
        let j = i + 2;
        while (j < text.length && text.charCodeAt(j) !== BEL && !(text.charCodeAt(j) === ESC && text[j + 1] === '\\')) j++;
        i = text.charCodeAt(j) === BEL ? j + 1 : j + 2;
      } else {
        i += 2;
      }
      continue;
    }
    // Drop other C0 controls except tab and newline.
    if (code < 32 && code !== 9 && code !== 10) {
      i++;
      continue;
    }
    buffer += text[i];
    i++;
  }
  flush();
  return { segments, style: snapshot(style) };
}

/** Parses text with ANSI SGR escapes into styled segments (other escapes are dropped). */
export function parseAnsi(text: string, initial?: AnsiStyle): AnsiSegment[] {
  return parseAnsiState(text, initial).segments;
}

/** The text without any escape sequence. */
export function stripAnsi(text: string): string {
  return parseAnsi(text)
    .map((s) => s.text)
    .join('');
}

/**
 * ANSI colour → token text class. Only contrast-safe tokens: blue and cyan both use `text-info`
 * (the category cyan is below AA on the light theme); bright variants reuse their base token.
 */
export const ANSI_TEXT_CLASS: Record<AnsiBaseColor, string> = {
  black: 'text-muted-foreground',
  red: 'text-destructive-text',
  green: 'text-success-text',
  yellow: 'text-warning-text',
  blue: 'text-info',
  magenta: 'text-category-violet',
  cyan: 'text-info',
  white: 'text-foreground',
};

/** ANSI background → token tint (text keeps its own token, so it stays readable). */
export const ANSI_BG_CLASS: Record<AnsiBaseColor, string> = {
  black: 'bg-muted',
  red: 'bg-destructive/15',
  green: 'bg-success/15',
  yellow: 'bg-warning/15',
  blue: 'bg-info/15',
  magenta: 'bg-category-violet/15',
  cyan: 'bg-category-cyan/15',
  white: 'bg-foreground/10',
};

const baseOf = (c: AnsiColor): AnsiBaseColor =>
  (c.startsWith('bright') ? c.slice(6).toLowerCase() : c) as AnsiBaseColor;

/** Token classes for a segment's style (empty string for plain text). Inverse uses foreground / background. */
export function ansiClassName(style: AnsiStyle): string {
  const classes: string[] = [];
  if (style.inverse) classes.push('bg-foreground text-background');
  else {
    if (style.fg) classes.push(ANSI_TEXT_CLASS[baseOf(style.fg)]);
    else if (style.dim) classes.push('text-muted-foreground');
    if (style.bg) classes.push(ANSI_BG_CLASS[baseOf(style.bg)]);
  }
  if (style.bold || style.fg?.startsWith('bright')) classes.push('font-semibold');
  if (style.italic) classes.push('italic');
  if (style.underline) classes.push('underline');
  if (style.strikethrough) classes.push('line-through');
  return classes.join(' ');
}

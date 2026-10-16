/* ============================================================================
   gntik-ui-mcp · validate.ts — validador de las reglas duras del design system
   ----------------------------------------------------------------------------
   Reglas (de CLAUDE.md del catálogo):
     · Cero colores hardcodeados → siempre clases de token (bg-primary, …)
     · Sin degradados de color (la trama repeating-*-gradient con var(--…) del
       catálogo SÍ está permitida)
     · Sombras planas, sin glow
     · Los tokens gestionan el tema → sin variantes dark:
     · Tipografía Geist / Geist Mono (var(--font-…))
   ============================================================================ */

export type Severity = 'error' | 'warning';

export interface Finding {
  rule: string;
  severity: Severity;
  line: number;
  excerpt: string;
  message: string;
}

export interface ValidationReport {
  ok: boolean;
  errors: number;
  warnings: number;
  tokensUsed: number;
  findings: Finding[];
  summary: string;
}

const PALETTE =
  '(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)';
const UTIL =
  '(?:bg|text|border|ring|fill|stroke|divide|outline|decoration|placeholder|caret|accent|shadow|from|via|to)';
// Límites de clase: no confundir tokens largos ni nombres de variables CSS.
const CLASS_START = '(?<![\\w:-])(?:[\\w-]+:)*';
const CLASS_END = '(?=$|[\\s\'"`})]|/)';
const COLOR_UTIL =
  '(?:bg|text|border(?:-[xysetrbl])?|divide|outline|ring(?:-offset)?|inset-ring|shadow|inset-shadow|text-shadow|drop-shadow|decoration|placeholder|caret|accent|fill|stroke|from|via|to)';
const ARBITRARY_COLOR_RE =
  /\b(?:bg|text|border|ring|fill|stroke|shadow|outline|decoration|from|via|to)-\[(?:#|rgba?\(|hsla?\(|oklch\()/;
const EXTENDED_COLOR_RE = new RegExp(`${CLASS_START}${COLOR_UTIL}-\\[([^\\]\\r\\n]+)\\]${CLASS_END}`);
// Lista fija de CSS Color 4; transparent y currentcolor no son colores absolutos.
const NAMED_COLORS = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood ' +
    'cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod ' +
    'darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon ' +
    'darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray ' +
    'dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green ' +
    'greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon ' +
    'lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon ' +
    'lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen ' +
    'magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue ' +
    'mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite ' +
    'navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred ' +
    'papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown ' +
    'salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen ' +
    'steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
  ).split(' '),
);

function isColorValue(content: string): boolean {
  const value = content
    .replace(/^color:/i, '')
    .trim()
    .toLowerCase();
  if (value.startsWith('var(')) return false;
  return (
    /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(value) ||
    /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(.*\)$/.test(value) ||
    NAMED_COLORS.has(value)
  );
}

const TOKEN_NAMES =
  '(?:primary(?:-foreground)?|foreground|background|card(?:-foreground)?|popover(?:-foreground)?|muted(?:-foreground)?|secondary(?:-foreground)?|accent(?:-foreground)?|border|input|ring|chrome|destructive(?:-foreground)?|success|warning|info|category-[\\w-]+)';
const TOKEN_CLASS_RE = new RegExp(`\\b${UTIL}-${TOKEN_NAMES}\\b`, 'g');

interface RuleDef {
  id: string;
  severity: Severity;
  message: string;
  /** Texto anterior para conservar los informes con extendedColorChecks: false. */
  legacyMessage?: string;
  /** Devuelve índices de columna donde aplica en la línea (vacío = no aplica). */
  find(line: string, extendedColorChecks?: boolean): number[];
}

function allIdx(line: string, re: RegExp, filter?: (idx: number, line: string) => boolean): number[] {
  const out: number[] = [];
  const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let m: RegExpExecArray | null;
  while ((m = r.exec(line))) {
    if (!filter || filter(m.index, line)) out.push(m.index);
    if (m.index === r.lastIndex) r.lastIndex++;
  }
  return out;
}

export const RULES: RuleDef[] = [
  {
    id: 'hex-color',
    severity: 'error',
    message: 'Color hex hardcodeado — usa una clase de token (bg-primary, text-foreground, …)',
    find: (line) =>
      allIdx(line, /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/, (idx, l) => {
        const before = l.slice(Math.max(0, idx - 8), idx);
        if (/[\w&]$/.test(before)) return false; // &#39; · id_#…
        if (/(?:url\(|href=["'])$/.test(before)) return false; // url(#id) · href="#"
        return true;
      }),
  },
  {
    id: 'raw-color-fn',
    severity: 'error',
    message: 'Función de color con valores crudos — solo hsl(var(--token) / α)',
    find: (line) =>
      allIdx(line, /\b(?:rgba?|hsla?|oklch|oklab|color-mix)\s*\(/, (idx, l) => {
        const after = l.slice(idx).replace(/^[a-z-]+\s*\(\s*/i, '');
        return !after.startsWith('var(--');
      }),
  },
  {
    id: 'palette-class',
    severity: 'error',
    message:
      'Tailwind palette class, including bg-white, bg-black, text-white and text-black with variants and /opacity — use tokens; extendedColorChecks: false disables the new checks',
    legacyMessage: 'Clase de paleta Tailwind — se salta los tokens de marca',
    find: (line, extendedColorChecks = true) => {
      const out = allIdx(line, new RegExp(`\\b${UTIL}-${PALETTE}-\\d{2,3}\\b`));
      if (extendedColorChecks) {
        out.push(...allIdx(line, new RegExp(`${CLASS_START}(?:bg|text)-(?:white|black)${CLASS_END}`)));
      }
      return out;
    },
  },
  {
    id: 'arbitrary-color',
    severity: 'error',
    message:
      'Arbitrary colour in Tailwind colour utilities (including border-x, divide, ring-offset, inset-ring, inset-shadow, text-shadow, drop-shadow, placeholder, caret and accent): hex, rgb/rgba/hsl/hsla/hwb/lab/lch/oklab/oklch/color/color-mix and CSS Color 4 names (including white/black), with color:, variants and /opacity; var(), transparent and currentcolor are allowed — use tokens; extendedColorChecks: false disables the new checks',
    legacyMessage: 'Color arbitrario en clase Tailwind (bg-[#…], text-[rgb(…)]) — usa tokens',
    find: (line, extendedColorChecks = true) => {
      const out = allIdx(line, ARBITRARY_COLOR_RE);
      if (extendedColorChecks) {
        const extra = allIdx(line, EXTENDED_COLOR_RE, (idx, l) => {
          const match = EXTENDED_COLOR_RE.exec(l.slice(idx));
          if (!match || !isColorValue(match[1]!)) return false;
          // El matcher anterior puede empezar dentro de una variante o de inset-ring.
          return !out.some((col) => col >= idx && col < idx + match[0].length);
        });
        out.push(...extra);
      }
      return out;
    },
  },
  {
    id: 'gradient',
    severity: 'error',
    message: 'Degradado — la marca es sobria: sin degradados de color',
    find: (line) => {
      const out = allIdx(line, /\bbg-gradient-to-[trbl]{1,2}\b/);
      out.push(...allIdx(line, /(?:^|[^-\w])(?:linear|radial|conic)-gradient\(/, () => true));
      // trama del catálogo permitida: repeating-*-gradient con tokens var(--…)
      out.push(...allIdx(line, /repeating-(?:linear|radial|conic)-gradient\(/, (_i, l) => !l.includes('var(--')));
      return out;
    },
  },
  {
    id: 'glow-shadow',
    severity: 'warning',
    message: 'Posible glow — la marca usa sombras planas (shadow-sm / shadow-md del tema)',
    find: (line) => allIdx(line, /\bdrop-shadow|text-shadow|shadow-\[0[_ ]?0[_ ]/),
  },
  {
    id: 'dark-variant',
    severity: 'warning',
    message: 'Variante dark: — los tokens ya cambian con el tema; no debería hacer falta',
    find: (line) => allIdx(line, /\bdark:/),
  },
  {
    id: 'font',
    severity: 'warning',
    message: 'Tipografía fuera de marca — Geist / Geist Mono vía tokens (font-sans / font-mono)',
    find: (line) => {
      if (/Geist|var\(--/.test(line)) return [];
      const out = allIdx(line, /\bfont-serif\b/);
      out.push(...allIdx(line, /font-family\s*:|fontFamily\s*[:=]/));
      return out;
    },
  },
  {
    id: 'inline-style-color',
    severity: 'warning',
    message: 'Color en style inline — muévelo a clases de token',
    find: (line) => {
      if (!/style\s*=/.test(line) || line.includes('var(--')) return [];
      return allIdx(line, /[^-\w](?:color|background(?:-color|Color)?)\s*:/);
    },
  },
];

/* Los degradados repeating con var(--…) generan una entrada duplicada del matcher
   genérico (linear-gradient dentro de repeating-linear-gradient no matchea por el
   guard [^-\w], así que no hay duplicado real). */

export interface ValidateOptions {
  filename?: string;
  /** ids de regla a ignorar */
  allow?: string[];
  /** Cobertura ampliada de colores; false conserva la validación anterior. */
  extendedColorChecks?: boolean;
}

export function validatePage(source: string, opts: ValidateOptions = {}): ValidationReport {
  const allow = new Set(opts.allow ?? []);
  const lines = source.split('\n');
  const findings: Finding[] = [];

  lines.forEach((line, i) => {
    for (const rule of RULES) {
      if (allow.has(rule.id)) continue;
      for (const col of rule.find(line, opts.extendedColorChecks ?? true)) {
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          line: i + 1,
          excerpt: line.slice(Math.max(0, col - 40), col + 60).trim() || line.trim().slice(0, 100),
          message: opts.extendedColorChecks === false ? (rule.legacyMessage ?? rule.message) : rule.message,
        });
      }
    }
  });

  const tokensUsed = (source.match(TOKEN_CLASS_RE) ?? []).length + (source.match(/hsl\(var\(--/g) ?? []).length;

  if (!allow.has('no-tokens') && tokensUsed === 0 && lines.length > 15) {
    findings.push({
      rule: 'no-tokens',
      severity: 'warning',
      line: 1,
      excerpt: opts.filename ?? '(fuente)',
      message: 'No se detecta ninguna clase de token del design system — ¿seguro que está remaquetada?',
    });
  }

  const errors = findings.filter((f) => f.severity === 'error').length;
  const warnings = findings.length - errors;
  return {
    ok: errors === 0,
    errors,
    warnings,
    tokensUsed,
    findings,
    summary: `${errors} errores · ${warnings} avisos · ${tokensUsed} usos de tokens de marca`,
  };
}

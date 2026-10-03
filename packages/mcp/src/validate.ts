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

const TOKEN_NAMES =
  '(?:primary(?:-foreground)?|foreground|background|card(?:-foreground)?|popover(?:-foreground)?|muted(?:-foreground)?|secondary(?:-foreground)?|accent(?:-foreground)?|border|input|ring|chrome|destructive(?:-foreground)?|success|warning|info|category-[\\w-]+)';
const TOKEN_CLASS_RE = new RegExp(`\\b${UTIL}-${TOKEN_NAMES}\\b`, 'g');

interface RuleDef {
  id: string;
  severity: Severity;
  message: string;
  /** Devuelve índices de columna donde aplica en la línea (vacío = no aplica). */
  find(line: string): number[];
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
        if (/[\w&]$/.test(before)) return false;              // &#39; · id_#…
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
    message: 'Clase de paleta Tailwind — se salta los tokens de marca',
    find: (line) => allIdx(line, new RegExp(`\\b${UTIL}-${PALETTE}-\\d{2,3}\\b`)),
  },
  {
    id: 'arbitrary-color',
    severity: 'error',
    message: 'Color arbitrario en clase Tailwind (bg-[#…], text-[rgb(…)]) — usa tokens',
    find: (line) =>
      allIdx(line, /\b(?:bg|text|border|ring|fill|stroke|shadow|outline|decoration|from|via|to)-\[(?:#|rgba?\(|hsla?\(|oklch\()/),
  },
  {
    id: 'gradient',
    severity: 'error',
    message: 'Degradado — la marca es sobria: sin degradados de color',
    find: (line) => {
      const out = allIdx(line, /\bbg-gradient-to-[trbl]{1,2}\b/);
      out.push(
        ...allIdx(line, /(?:^|[^-\w])(?:linear|radial|conic)-gradient\(/, () => true),
      );
      // trama del catálogo permitida: repeating-*-gradient con tokens var(--…)
      out.push(
        ...allIdx(line, /repeating-(?:linear|radial|conic)-gradient\(/, (_i, l) => !l.includes('var(--')),
      );
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
}

export function validatePage(source: string, opts: ValidateOptions = {}): ValidationReport {
  const allow = new Set(opts.allow ?? []);
  const lines = source.split('\n');
  const findings: Finding[] = [];

  lines.forEach((line, i) => {
    for (const rule of RULES) {
      if (allow.has(rule.id)) continue;
      for (const col of rule.find(line)) {
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          line: i + 1,
          excerpt: line.slice(Math.max(0, col - 40), col + 60).trim() || line.trim().slice(0, 100),
          message: rule.message,
        });
      }
    }
  });

  const tokensUsed =
    (source.match(TOKEN_CLASS_RE) ?? []).length + (source.match(/hsl\(var\(--/g) ?? []).length;

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

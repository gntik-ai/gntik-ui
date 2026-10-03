/**
 * Minimal, dependency-free tokenizer for the default CodeBlock colouring. It is deliberately
 * small: good enough for docs snippets in ts/tsx/js/json/bash/css, not a full grammar.
 */
export type TokenKind = 'plain' | 'keyword' | 'string' | 'number' | 'comment' | 'type' | 'function' | 'property' | 'punctuation' | 'muted';

export interface CodeToken {
  kind: TokenKind;
  value: string;
}

type Rule = [TokenKind, RegExp];

const JS_KEYWORDS =
  'abstract|as|async|await|break|case|catch|class|const|continue|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|keyof|let|namespace|new|of|private|protected|public|readonly|return|satisfies|set|static|super|switch|this|throw|try|type|typeof|var|void|while|with|yield';

const STRINGS = /`(?:\\[\s\S]|[^\\`])*`?|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/y;

const JS: Rule[] = [
  ['comment', /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y],
  ['string', STRINGS],
  ['keyword', new RegExp(`\\b(?:${JS_KEYWORDS})\\b`, 'y')],
  ['number', /\b(?:true|false|null|undefined|NaN|Infinity)\b|\b(?:0[xX][\da-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?n?)\b/y],
  ['type', /\b[A-Z][\w$]*/y],
  ['function', /[a-zA-Z_$][\w$]*(?=\s*\()/y],
  ['property', /(?<=\s)[a-zA-Z_$][\w$-]*(?==[{"'])/y],
  ['plain', /[a-zA-Z_$][\w$]*/y],
  ['punctuation', /[{}()[\];,.<>/=+\-*!?:&|%^~@]+/y],
];

const JSON_RULES: Rule[] = [
  ['property', /"(?:\\.|[^"\\\n])*"(?=\s*:)/y],
  ['string', /"(?:\\.|[^"\\\n])*"?/y],
  ['number', /\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y],
  ['punctuation', /[{}[\],:]/y],
];

const BASH: Rule[] = [
  ['comment', /(?<![^\s])#[^\n]*/y],
  ['string', /"(?:\\.|[^"\\])*"?|'[^']*'?/y],
  ['type', /\$\{[^}\n]*\}?|\$[\w@#?*!-]+/y],
  ['keyword', /\b(?:if|then|else|elif|fi|for|while|until|do|done|case|esac|in|function|export|local|return|sudo)\b/y],
  ['muted', /(?<![^\s])--?[\w-]+=?/y],
  ['function', /(?<=(?:^|[|;&(]|&&|\|\|)[ \t]*)[A-Za-z_./][\w./-]*/my],
  ['number', /\b\d+(?:\.\d+)*\b/y],
  ['punctuation', /[|&;<>()=\\]+/y],
];

const CSS: Rule[] = [
  ['comment', /\/\*[\s\S]*?(?:\*\/|$)/y],
  ['string', /"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/y],
  ['keyword', /@[\w-]+|!important\b/y],
  ['property', /--[\w-]+|[a-z-]+(?=\s*:[^:])/y],
  ['function', /[\w-]+(?=\()/y],
  ['number', /#[\da-fA-F]{3,8}\b|-?\d*\.?\d+(?:px|rem|em|%|s|ms|vh|vw|deg|fr|ch)?/y],
  ['type', /[.#][\w-]+|::?[\w-]+/y],
  ['plain', /[\w-]+/y],
  ['punctuation', /[{}()[\];:,>+~*=]+/y],
];

const LANGS: Record<string, Rule[]> = {
  ts: JS, tsx: JS, js: JS, jsx: JS, typescript: JS, javascript: JS, mjs: JS, cjs: JS,
  json: JSON_RULES, jsonc: JS,
  bash: BASH, sh: BASH, shell: BASH, zsh: BASH, console: BASH,
  css: CSS,
};

/** Whether the default tokenizer knows this language. */
export function isSupportedLanguage(lang: string | undefined): boolean {
  return lang != null && lang.toLowerCase() in LANGS;
}

/** Splits code into coloured tokens. Unknown languages return one plain token. */
export function tokenize(code: string, lang: string | undefined): CodeToken[] {
  const rules = lang ? LANGS[lang.toLowerCase()] : undefined;
  if (!rules) return [{ kind: 'plain', value: code }];
  const out: CodeToken[] = [];
  const push = (kind: TokenKind, value: string) => {
    const prev = out[out.length - 1];
    if (prev && prev.kind === kind) prev.value += value;
    else out.push({ kind, value });
  };
  let i = 0;
  outer: while (i < code.length) {
    for (const [kind, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m[0].length > 0) {
        push(kind, m[0]);
        i += m[0].length;
        continue outer;
      }
    }
    push('plain', code.charAt(i));
    i += 1;
  }
  return out;
}

/** Tokenizes and splits into lines (tokens that span lines, like block comments, are cut). */
export function tokenizeLines(code: string, lang: string | undefined): CodeToken[][] {
  const lines: CodeToken[][] = [[]];
  for (const token of tokenize(code, lang)) {
    const parts = token.value.split('\n');
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1]?.push({ kind: token.kind, value: part });
    });
  }
  return lines;
}

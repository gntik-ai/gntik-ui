import { tokenClass } from './code-block.variants';
import type { CodeHighlighter } from './CodeHighlighterProvider';
import type { CodeToken, TokenKind } from './tokenize';

/** Treat third-party results as untrusted data; never change the displayed source or layout. */
export function highlightTokens(highlighter: CodeHighlighter, source: string, language: string): CodeToken[][] | null {
  try {
    const result: unknown = highlighter.tokenize(source, language);
    const sourceLines = source.split('\n');
    if (!Array.isArray(result) || result.length !== sourceLines.length) return null;
    const lines: CodeToken[][] = [];
    for (const [index, line] of result.entries()) {
      if (!Array.isArray(line)) return null;
      const tokens: CodeToken[] = [];
      for (const token of line as unknown[]) {
        if (typeof token !== 'object' || token === null || !('value' in token) || typeof token.value !== 'string') {
          return null;
        }
        const kind =
          'kind' in token && typeof token.kind === 'string' && Object.hasOwn(tokenClass, token.kind)
            ? (token.kind as TokenKind)
            : 'plain';
        tokens.push({ kind, value: token.value });
      }
      if (tokens.map((token) => token.value).join('') !== sourceLines[index]) return null;
      lines.push(tokens);
    }
    return lines;
  } catch {
    return null;
  }
}

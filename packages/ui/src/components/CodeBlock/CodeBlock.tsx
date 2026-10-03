import { Check, Copy, WrapText } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { codeBlockVariants, tokenClass } from './code-block.variants';
import { tokenizeLines } from './tokenize';

type CopyStatus = 'idle' | 'copied' | 'failed';

export interface CodeBlockProps {
  /** The source to show and copy. A single trailing newline is ignored. */
  code: string;
  /** Language id (ts, tsx, js, json, bash, css… colour the default tokenizer knows). */
  language?: string;
  /** File name shown in the header (the language shows next to it). */
  filename?: string;
  /** Gutter with line numbers (not selectable, hidden from assistive tech). */
  showLineNumbers?: boolean;
  /** 1-based line numbers to emphasise. */
  highlightLines?: readonly number[];
  /** Initial soft-wrap state; the header toggle changes it. */
  defaultWrap?: boolean;
  /** Show the wrap toggle in the header. */
  wrapToggle?: boolean;
  /** Show the copy button. */
  copyable?: boolean;
  /** Max height of the code area (px or any CSS length); the rest scrolls. */
  maxHeight?: number | string;
  /**
   * Custom highlighter (e.g. Shiki). Called once per line with that line's text and the
   * language; return the coloured nodes. Without it a minimal token-coloured tokenizer runs.
   */
  highlight?: (code: string, language: string | undefined) => ReactNode;
  /** Accessible name of the scrollable code region. Defaults to the filename or "{language} code". */
  label?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Read-only code panel: filename / language header, copy button with "Copied" feedback (and a
 * polite live announcement), optional line numbers, highlighted lines, soft-wrap toggle and a
 * max height. The code area is a focusable region so it scrolls from the keyboard.
 */
export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = false,
  highlightLines,
  defaultWrap = false,
  wrapToggle = true,
  copyable = true,
  maxHeight,
  highlight,
  label,
  className,
  ref,
}: CodeBlockProps) {
  const [wrap, setWrap] = useState(defaultWrap);
  const [status, setStatus] = useState<CopyStatus>('idle');
  const [copies, setCopies] = useState(0);
  const s = codeBlockVariants({ wrap });
  const source = code.endsWith('\n') ? code.slice(0, -1) : code;

  const lines = useMemo<ReactNode[]>(() => {
    if (highlight) return source.split('\n').map((line) => highlight(line, language));
    return tokenizeLines(source, language).map((tokens) =>
      tokens.map((t, i) => (tokenClass[t.kind] ? <span key={i} className={tokenClass[t.kind]}>{t.value}</span> : t.value)),
    );
  }, [source, language, highlight]);

  useEffect(() => {
    if (status === 'idle') return;
    const id = window.setTimeout(() => setStatus('idle'), 2000);
    return () => window.clearTimeout(id);
  }, [status, copies]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    setCopies((n) => n + 1);
  };

  const marked = new Set(highlightLines);
  const gutter = `${String(lines.length).length}ch`;
  const regionLabel = label ?? filename ?? (language ? `${language} code` : 'Code');
  const announcement = status === 'copied' ? 'Copied to clipboard' : status === 'failed' ? 'Copy failed' : '';

  return (
    <div ref={ref} className={cn(s.root(), className)}>
      <div className={s.header()}>
        <div className={s.heading()}>
          {filename && <span className={s.filename()}>{filename}</span>}
          {language && <span className={s.language()}>{language}</span>}
        </div>
        <div className={s.actions()}>
          {wrapToggle && (
            <button type="button" aria-label="Wrap lines" aria-pressed={wrap} onClick={() => setWrap((w) => !w)} className={s.button()}>
              <WrapText size={14} aria-hidden />
            </button>
          )}
          {copyable && (
            <button type="button" onClick={copy} className={cn(s.button(), status === 'copied' && s.copied())}>
              {status === 'copied' ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
              {status === 'copied' ? 'Copied' : 'Copy'}
            </button>
          )}
          <span role="status" className="sr-only">
            {announcement}
          </span>
        </div>
      </div>
      <pre
        role="region"
        aria-label={regionLabel}
        tabIndex={0}
        className={s.pre()}
        style={maxHeight != null ? { maxHeight } : undefined}
        data-language={language}
      >
        <code className={s.code()}>
          {lines.map((content, i) => (
            <span key={i} data-line={i + 1} data-highlighted={marked.has(i + 1) || undefined} className={s.line()}>
              {showLineNumbers && (
                <span aria-hidden className={s.lineNumber()} style={{ width: gutter }}>
                  {i + 1}
                </span>
              )}
              <span className={s.content()}>{content === '' || (Array.isArray(content) && content.length === 0) ? ' ' : content}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

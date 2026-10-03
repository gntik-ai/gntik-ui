import { cn } from '@gntik-ai/ui';
import { ExternalLink } from 'lucide-react';
import { Children, isValidElement, memo, type ReactNode } from 'react';
import ReactMarkdown, { defaultUrlTransform, type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { markdownStyles as s, streamingCaretClass } from './markdown.variants';

export interface MarkdownProps {
  /** Markdown source (GitHub-flavoured: tables, task lists, strikethrough, autolinks). */
  children: string;
  /** Text is still arriving: closes a dangling code fence and draws the caret. */
  streaming?: boolean;
  className?: string;
}

const SAFE_PROTOCOL = /^(https?|mailto|tel):/i;

/**
 * URL policy: relative URLs, anchors and http(s)/mailto/tel only. Everything else
 * (javascript:, data:, vbscript:, …) is dropped, on top of react-markdown's own transform.
 */
export function safeUrl(url: string): string {
  const cleaned = defaultUrlTransform(url);
  if (!cleaned) return '';
  // Ignore whitespace and control characters browsers skip ("java\tscript:").
  const compact = Array.from(cleaned)
    .filter((c) => c.charCodeAt(0) > 0x20)
    .join('');
  if (/^[a-z][a-z0-9+.-]*:/i.test(compact) && !SAFE_PROTOCOL.test(compact)) return '';
  return cleaned;
}

/**
 * Makes partial streamed markdown render sanely: a fence that has opened but not closed is
 * closed at the end, so the tail renders as code instead of flashing as paragraphs.
 */
export function repairStreamingMarkdown(text: string): string {
  const fences = text.match(/^ {0,3}(`{3,}|~{3,})/gm) ?? [];
  if (fences.length % 2 === 0) return text;
  const opener = (fences[fences.length - 1] ?? '```').trim();
  return `${text}${text.endsWith('\n') ? '' : '\n'}${opener}`;
}

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/** Drops react-markdown's `node` (hast) prop before spreading onto a DOM element. */
function omitNode<T extends { node?: unknown }>(props: T): Omit<T, 'node'> {
  const { node, ...rest } = props;
  void node;
  return rest;
}

type CodeChildProps = { className?: string; children?: ReactNode };

const components: Components = {
  h1: (p) => <h1 {...omitNode(p)} className={s.h1} />,
  h2: (p) => <h2 {...omitNode(p)} className={s.h2} />,
  h3: (p) => <h3 {...omitNode(p)} className={s.h3} />,
  h4: (p) => <h4 {...omitNode(p)} className={s.h4} />,
  h5: (p) => <h4 {...omitNode(p)} className={s.h4} />,
  h6: (p) => <h4 {...omitNode(p)} className={s.h4} />,
  p: (p) => <p {...omitNode(p)} className={s.p} />,
  ul: (p) => <ul {...omitNode(p)} className={cn(s.ul, p.className === 'contains-task-list' && 'pl-1')} />,
  ol: (p) => <ol {...omitNode(p)} className={s.ol} />,
  li: (p) => <li {...omitNode(p)} className={cn(s.li, p.className)} />,
  blockquote: (p) => <blockquote {...omitNode(p)} className={s.blockquote} />,
  hr: () => <hr className={s.hr} />,
  table: (p) => (
    <div className={s.tableWrap}>
      <table {...omitNode(p)} className={s.table} />
    </div>
  ),
  th: (p) => <th {...omitNode(p)} className={s.th} />,
  td: (p) => <td {...omitNode(p)} className={s.td} />,
  a: (props) => {
    const { href, children, ...p } = omitNode(props);
    if (!href) return <span>{children}</span>;
    if (!isExternal(href)) {
      return (
        <a href={href} className={s.link} {...p}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={s.link} {...p}>
        {children}
        <ExternalLink size={12} aria-hidden className={s.linkIcon} />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  },
  // Remote images can track readers and break layout mid-stream: show them as links.
  img: ({ src, alt }) => {
    const href = typeof src === 'string' ? src : '';
    const text = `Image: ${alt || 'untitled'}`;
    return href ? (
      <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={s.link}>
        {text}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : (
      <span className={s.image}>{text}</span>
    );
  },
  input: ({ checked, type }) =>
    type === 'checkbox' ? (
      <input type="checkbox" checked={!!checked} readOnly disabled aria-label={checked ? 'Done' : 'Not done'} className={s.checkbox} />
    ) : null,
  code: ({ className, children }) => <code className={cn(s.inlineCode, className)}>{children}</code>,
  pre: ({ children }) => {
    const child = Children.toArray(children)[0];
    if (!isValidElement<CodeChildProps>(child)) return <pre className={s.code.pre}>{children}</pre>;
    const language = /language-([\w+#.-]+)/.exec(child.props.className ?? '')?.[1];
    const code = String(Children.toArray(child.props.children).join('')).replace(/\n$/, '');
    return <CodeBlock code={code} language={language} />;
  },
};

const remarkPlugins = [remarkGfm];

/**
 * Safe markdown for model output: raw HTML is never rendered (skipped, not parsed), links are
 * restricted to http(s)/mailto/tel/relative, external links open in a new tab with a marker,
 * and fenced code gets a copy button. Partial input from a stream is tolerated.
 */
export const Markdown = memo(function Markdown({ children, streaming = false, className }: MarkdownProps) {
  const source = streaming ? repairStreamingMarkdown(children) : children;
  return (
    <div data-streaming={streaming || undefined} className={cn(s.root, streaming && streamingCaretClass, className)}>
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components} skipHtml urlTransform={safeUrl}>
        {source}
      </ReactMarkdown>
    </div>
  );
});


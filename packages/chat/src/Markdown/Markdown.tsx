import { cn, useI18n } from '@gntik-ai/ui';
import { ExternalLink } from 'lucide-react';
import { Children, createContext, isValidElement, memo, useContext, type ComponentType, type ReactNode } from 'react';
import ReactMarkdown, { defaultUrlTransform, type Components, type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { scanCustomTags, remarkCustomTags, type CustomBlock } from './customTags';
import { useHtmlSubset } from './htmlSubset';
import { markdownStyles as s, streamingCaretClass } from './markdown.variants';

export interface MarkdownProps {
  /** Markdown source (GitHub-flavoured: tables, task lists, strikethrough, autolinks). */
  children: string;
  /** Text is still arriving: closes a dangling code fence and draws the caret. */
  streaming?: boolean;
  className?: string;
  /** Stable component map, merged over the kit defaults. Receives untrusted content. */
  components?: MarkdownComponents;
  codeRenderers?: Record<string, ComponentType<MarkdownCodeRendererProps>>;
  /** Only standalone block tags registered here consume source. */
  customTags?: Record<string, ComponentType<MarkdownCustomTagProps>>;
  /** Opt in to the fixed sanitised HTML subset, loaded asynchronously. */
  allowHtml?: boolean;
  /** Stable plugin arrays, appended after the kit plugins. */
  remarkPlugins?: Options['remarkPlugins'];
  rehypePlugins?: Options['rehypePlugins'];
}

export type MarkdownComponents = Partial<Components>;
export interface MarkdownCodeRendererProps {
  code: string;
  language: string;
  streaming: boolean;
  complete: boolean;
}
export interface MarkdownCustomTagProps {
  children: ReactNode;
  attributes: Record<string, string>;
  streaming: boolean;
  complete: boolean;
}
interface RendererContextValue {
  streaming: boolean;
  codeRenderers?: Record<string, ComponentType<MarkdownCodeRendererProps>>;
  repairedOffset?: number;
  tags?: Record<string, ComponentType<MarkdownCustomTagProps>>;
  blocks?: Record<number, CustomBlock>;
}
const MarkdownContext = createContext<RendererContextValue>({ streaming: false });
/** Stream state for element overrides, code renderers and custom tags. */
export function useMarkdownContext(): { streaming: boolean } {
  return { streaming: useContext(MarkdownContext).streaming };
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
/** Screen-reader note on links that open a new tab. */
function NewTabHint() {
  const { t } = useI18n();
  return <span className="sr-only"> {t('link.external')}</span>;
}

/** Remote images can track readers and break layout mid-stream: show them as links. */
function ImageLink({ href, alt }: { href: string; alt?: string }) {
  const { t } = useI18n();
  const text = t('chat.image', { alt: alt || t('chat.untitled') });
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={s.link}>
      {text}
      <NewTabHint />
    </a>
  ) : (
    <span className={s.image}>{text}</span>
  );
}

function TaskCheckbox({ checked }: { checked: boolean }) {
  const { t } = useI18n();
  return (
    <input
      type="checkbox"
      checked={checked}
      readOnly
      disabled
      aria-label={checked ? t('chat.taskDone') : t('chat.taskNotDone')}
      className={s.checkbox}
    />
  );
}

function omitNode<T extends { node?: unknown }>(props: T): Omit<T, 'node'> {
  const { node, ...rest } = props;
  void node;
  return rest;
}

type CodeChildProps = { className?: string; children?: ReactNode };

const CodeRenderer: Components['pre'] = ({ children, node }) => {
  const { streaming, codeRenderers: renderers, repairedOffset } = useContext(MarkdownContext);
  const child = Children.toArray(children)[0];
  if (!isValidElement<CodeChildProps>(child)) return <pre className={s.code.pre}>{children}</pre>;
  const language = /language-([\w+#.-]+)/.exec(child.props.className ?? '')?.[1];
  const code = String(Children.toArray(child.props.children).join('')).replace(/\n$/, '');
  const Renderer = language ? renderers?.[language.toLowerCase()] : undefined;
  return Renderer && language ? (
    <Renderer
      code={code}
      language={language.toLowerCase()}
      streaming={streaming}
      complete={node?.position?.start.offset !== repairedOffset}
    />
  ) : (
    <CodeBlock code={code} language={language} />
  );
};

const CustomTagRenderer: Components['div'] = ({ children, node, ...props }) => {
  const { streaming, tags, blocks } = useContext(MarkdownContext);
  const id = node?.properties.dataMarkdownTag;
  const block = typeof id === 'number' || typeof id === 'string' ? blocks?.[Number(id)] : undefined;
  const Tag = block && tags?.[block.name];
  return Tag && block ? (
    <Tag attributes={block.attributes} streaming={streaming} complete={block.complete}>
      {children}
    </Tag>
  ) : (
    <div {...props}>{children}</div>
  );
};

const customTagComponents = { 'markdown-custom-tag': CustomTagRenderer };

const kitComponents: Components = {
  pre: CodeRenderer,
  h1: (p) => <h1 {...omitNode(p)} className={s.h1} />,
  h2: (p) => <h2 {...omitNode(p)} className={s.h2} />,
  h3: (p) => <h3 {...omitNode(p)} className={s.h3} />,
  h4: (p) => <h4 {...omitNode(p)} className={s.h4} />,
  h5: (p) => <h4 {...omitNode(p)} className={s.h4} />,
  h6: (p) => <h4 {...omitNode(p)} className={s.h4} />,
  p: (p) => <p {...omitNode(p)} className={s.p} />,
  ul: (p) => <ul {...omitNode(p)} className={cn(s.ul, p.className === 'contains-task-list' && 'ps-1')} />,
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
        <NewTabHint />
      </a>
    );
  },
  img: ({ src, alt }) => <ImageLink href={typeof src === 'string' ? src : ''} alt={alt} />,
  input: ({ checked, type }) => (type === 'checkbox' ? <TaskCheckbox checked={!!checked} /> : null),
  code: ({ className, children }) => <code className={cn(s.inlineCode, className)}>{children}</code>,
};

function lowercaseKeys<T>(values: Record<string, T> | undefined): Record<string, T> {
  const result: Record<string, T> = Object.create(null);
  for (const [key, value] of Object.entries(values ?? {})) result[key.toLowerCase()] = value;
  return result;
}

/**
 * Safe markdown for model output: raw HTML is skipped by default, links are
 * restricted to http(s)/mailto/tel/relative, external links open in a new tab with a marker,
 * and fenced code gets a copy button. Partial input from a stream is tolerated.
 */
function MarkdownContent({
  children,
  streaming = false,
  components,
  codeRenderers,
  remarkPlugins,
  rehypePlugins,
  htmlPlugins,
  customTags,
}: MarkdownProps & { htmlPlugins?: Options['rehypePlugins'] }) {
  const tags = lowercaseKeys(customTags);
  const custom = scanCustomTags(children, new Set(Object.keys(tags)), streaming);
  const source = streaming ? repairStreamingMarkdown(custom.source) : custom.source;
  const repairedFence =
    source === custom.source ? undefined : Array.from(custom.source.matchAll(/^ {0,3}(`{3,}|~{3,})/gm)).at(-1);
  // HAST starts the code node at the marker, after any permitted indentation.
  const repairedOffset = repairedFence ? repairedFence.index + repairedFence[0].search(/[`~]/) : -1;
  const renderers = lowercaseKeys(codeRenderers);
  return (
    <MarkdownContext.Provider
      value={{ streaming, codeRenderers: renderers, repairedOffset, tags, blocks: custom.byId }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCustomTags(custom.blocks), ...(remarkPlugins ?? [])]}
        rehypePlugins={[...(htmlPlugins ?? []), ...(rehypePlugins ?? [])]}
        components={{ ...kitComponents, ...components, ...customTagComponents }}
        skipHtml
        urlTransform={safeUrl}
      >
        {source}
      </ReactMarkdown>
    </MarkdownContext.Provider>
  );
}

export const Markdown = memo(function Markdown({
  children,
  streaming = false,
  className,
  customTags,
  allowHtml = false,
  ...props
}: MarkdownProps) {
  const htmlPlugins = useHtmlSubset(allowHtml);
  return (
    <div data-streaming={streaming || undefined} className={cn(s.root, streaming && streamingCaretClass, className)}>
      <MarkdownContent {...props} customTags={customTags} streaming={streaming} htmlPlugins={htmlPlugins}>
        {children}
      </MarkdownContent>
    </div>
  );
});

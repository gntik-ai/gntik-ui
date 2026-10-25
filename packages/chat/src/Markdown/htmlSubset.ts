import { useEffect, useState } from 'react';
import type { Options } from 'react-markdown';
import type rehypeRaw from 'rehype-raw';
import type { Options as SanitizeSchema } from 'rehype-sanitize';

type HtmlTree = Parameters<ReturnType<typeof rehypeRaw>>[0];
type HtmlFile = Parameters<ReturnType<typeof rehypeRaw>>[1];
type HtmlNode = HtmlTree['children'][number];
type HtmlElement = Extract<HtmlNode, { type: 'element' }>;
type Plugins = NonNullable<Options['rehypePlugins']>;

const subset = [
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'del',
  'sub',
  'sup',
  'kbd',
  'mark',
  'abbr',
  'br',
  'details',
  'summary',
];
const dropContent = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'audio',
  'video',
  'source',
  'track',
  'picture',
  'img',
  'svg',
  'math',
  'template',
  'textarea',
]);
// Private fixed schema: consumers cannot widen it. Markdown-generated elements keep their
// normal semantics; raw elements first pass the narrower subset policy below.
const schema: SanitizeSchema = {
  // GFM already prefixes footnote IDs. Raw tags cannot supply IDs after filterRaw
  // and the attribute allowlist, so preserve Markdown IDs and their references.
  clobber: [],
  tagNames: [
    ...subset,
    'a',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'ul',
    'ol',
    'li',
    'hr',
    'pre',
    'code',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'input',
    'img',
    'section',
    'div',
    'markdown-custom-tag',
  ],
  attributes: {
    '*': [],
    a: ['href', 'title', 'id', 'dataFootnoteRef', 'dataFootnoteBackref', 'ariaDescribedBy', 'ariaLabel'],
    abbr: ['title'],
    details: ['open'],
    'markdown-custom-tag': ['dataMarkdownTag'],
    code: [['className', /^language-/]],
    ol: ['start'],
    ul: [['className', 'contains-task-list']],
    li: ['id', ['className', 'task-list-item']],
    input: [['type', 'checkbox'], 'checked', 'disabled'],
    img: ['src', 'alt', 'title'],
    th: ['align'],
    td: ['align'],
    section: ['dataFootnotes', ['className', 'footnotes']],
    h2: ['id', ['className', 'sr-only']],
  },
  protocols: { href: ['http', 'https', 'mailto', 'tel'], src: ['http', 'https'] },
  strip: [...dropContent].filter((tag) => tag !== 'img'),
};

function origin(node: HtmlElement): string {
  return `${node.tagName}:${node.position?.start.offset}`;
}

function collectMarkdown(node: HtmlTree | HtmlNode, origins: Set<string>): void {
  if (node.type === 'element') origins.add(origin(node));
  if ('children' in node) for (const child of node.children) collectMarkdown(child, origins);
}

function filterRaw(node: HtmlTree | HtmlElement, markdown: ReadonlySet<string>): void {
  const children: typeof node.children = [];
  for (const child of node.children) {
    if (child.type === 'doctype') continue;
    if (child.type !== 'element') {
      children.push(child);
      continue;
    }
    const fromMarkdown = markdown.has(origin(child));
    if (!fromMarkdown && dropContent.has(child.tagName)) continue;
    filterRaw(child, markdown);
    if (fromMarkdown || subset.includes(child.tagName)) children.push(child);
    else children.push(...child.children);
  }
  node.children = children;
}

let loaded: Plugins | undefined;
let loading: Promise<Plugins> | undefined;
function loadHtmlSubset(): Promise<Plugins> {
  return (loading ??= Promise.all([import('rehype-raw'), import('rehype-sanitize')]).then(([raw, sanitize]) => {
    const parse = raw.default();
    const clean = sanitize.default(schema);
    loaded = [
      () => (tree: HtmlTree, file: HtmlFile) => {
        const markdown = new Set<string>();
        collectMarkdown(tree, markdown);
        const parsed = parse(tree, file);
        filterRaw(parsed, markdown);
        return clean(parsed);
      },
    ];
    return loaded;
  }));
}

/** Until both optional parsers load, ReactMarkdown continues to skip raw HTML. */
export function useHtmlSubset(enabled: boolean): Plugins | undefined {
  const [plugins, setPlugins] = useState(() => (enabled ? loaded : undefined));
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void loadHtmlSubset().then(
      (value) => {
        if (active) setPlugins(value);
      },
      () => {},
    );
    return () => {
      active = false;
    };
  }, [enabled]);
  return enabled ? plugins : undefined;
}

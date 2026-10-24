import { Alert, Badge, Card, Progress, useI18n } from '@gntik-ai/ui';
import type { ReactNode } from 'react';
import {
  Markdown,
  useMarkdownContext,
  type MarkdownCodeRendererProps,
  type MarkdownCustomTagProps,
  type MarkdownProps,
} from '../Markdown';

function Callout({ children }: { children?: ReactNode }) {
  return <Alert>{children}</Alert>;
}

function ChartFence({ code, complete }: MarkdownCodeRendererProps) {
  const { t } = useI18n();
  const { streaming } = useMarkdownContext();
  const value = Number(code);
  return (
    <Card className="my-3 space-y-2 p-3">
      <Progress
        label={t('chat.markdownChart')}
        value={Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0}
        showValue
      />
      <Badge>{t(streaming && !complete ? 'chat.markdownPartial' : 'chat.markdownComplete')}</Badge>
    </Card>
  );
}

function Reasoning({ children, complete }: MarkdownCustomTagProps) {
  const { t } = useI18n();
  return (
    <Card className="my-3 space-y-2 p-3">
      <Badge>{t(complete ? 'chat.markdownReasoning' : 'chat.markdownPartial')}</Badge>
      {children}
    </Card>
  );
}

interface ExampleNode {
  type: string;
  depth?: number;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: ExampleNode[];
}
function walk(node: ExampleNode, change: (node: ExampleNode) => void) {
  change(node);
  node.children?.forEach((child) => walk(child, change));
}
// Stable maps and plugin arrays preserve Markdown's memoisation.
const components = { blockquote: Callout };
const codeRenderers = { chart: ChartFence };
const customTags = { think: Reasoning };
const remarkPlugins: MarkdownProps['remarkPlugins'] = [
  () => (tree: ExampleNode) => {
    walk(tree, (node) => {
      if (node.type === 'heading') node.depth = 3;
    });
  },
];
const rehypePlugins: MarkdownProps['rehypePlugins'] = [
  () => (tree: ExampleNode) => {
    walk(tree, (node) => {
      if (node.tagName === 'details') node.properties = { ...node.properties, open: true };
    });
  },
];
const extensions = { components, codeRenderers, customTags, remarkPlugins, rehypePlugins };

/** Overrides receive untrusted text: validate data and render React children, never raw HTML. */
export default function MarkdownCustom() {
  const { t } = useI18n();
  return (
    <div className="max-w-2xl space-y-4">
      <Markdown {...extensions} allowHtml>
        {t('chat.markdownCustomReply')}
      </Markdown>
      <Markdown {...extensions} streaming>
        {t('chat.markdownCustomPartial')}
      </Markdown>
    </div>
  );
}

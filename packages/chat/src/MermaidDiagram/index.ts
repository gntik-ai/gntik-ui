import { createElement } from 'react';
import type { MarkdownCodeRendererProps } from '../Markdown';
import { MermaidDiagram } from './MermaidDiagram';

export { MermaidDiagram, type MermaidDiagramProps, type DiagramView } from './MermaidDiagram';
function MermaidCodeRenderer({ code, complete }: MarkdownCodeRendererProps) {
  return createElement(MermaidDiagram, { code, streaming: !complete });
}
/** Opt-in fence renderer. Closed fences render even while sibling prose streams. */
export const mermaidCodeRenderers = { mermaid: MermaidCodeRenderer };

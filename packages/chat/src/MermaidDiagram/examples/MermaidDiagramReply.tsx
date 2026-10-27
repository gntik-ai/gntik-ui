import { mermaidCodeRenderers } from '@gntik-ai/chat/mermaid';
import { Markdown } from '../../Markdown';

/** Opt in through the subpath; a closed fence renders while the reply streams. */
export default function MermaidDiagramReply() {
  return (
    <Markdown streaming codeRenderers={mermaidCodeRenderers}>
      {'```mermaid\ngraph TD; A-->B; B-->C\n```'}
    </Markdown>
  );
}

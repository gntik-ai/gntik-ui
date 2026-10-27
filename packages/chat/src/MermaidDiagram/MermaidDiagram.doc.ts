import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'MermaidDiagram',
  group: 'Display',
  status: 'beta',
  description:
    'Opt-in diagrams: install the pinned optional peer mermaid@12.2.0 and import MermaidDiagram or mermaidCodeRenderers from @gntik-ai/chat/mermaid. Pass the stable map to Markdown codeRenderers; it renders closed fences even while the reply streams, and leaves incomplete fences as code. The main chat entry never loads Mermaid. Rendering is client-only: SSR and loading show CodeBlock, followed by a Rendering diagram… status. The first complete diagram dynamically imports mermaid from the consumer app’s own chunk; no CDN is used. Strict CSP apps must allow the generated SVG’s inline styles or keep the code view. Strict security, disabled HTML labels, locked configuration and a second SVG sanitiser remove scripts, HTML foreign objects, event handlers, animation and external resources. Invalid sources fall back to code and Could not render the diagram. Colours read neutral surface and contrast-safe foreground tokens on every theme change. code is required; streaming defaults to false; defaultView is diagram; onViewChange reports user view changes; label defaults to the translated Diagram; className styles the figure. The toolbar toggles diagram/code (aria-pressed), copies source, downloads sanitised diagram.svg and adjusts zoom; drag pans. No canvas transitions run, including under reduced motion. MermaidDiagramReply demonstrates Markdown integration; MermaidDiagramStates shows code-first, custom label, className, callback, failure, streaming and Spanish strings. Full-screen viewing and PNG export are deferred.',
  primitive: 'Button',
  pattern: 'named figure with toggle buttons and a focusable viewport',
  keyboard: [
    ['Tab', 'Moves through toolbar controls, then the diagram viewport or code copy button'],
    ['Enter / Space', 'Activates the focused toolbar control'],
    ['+ / -', 'Zooms the focused viewport in or out'],
    ['0', 'Resets zoom and pan'],
    ['Arrow keys', 'Pans the focused viewport'],
  ],
  tokens: ['foreground', 'secondary', 'background', 'border', 'muted-foreground', 'focus-ring'],
};

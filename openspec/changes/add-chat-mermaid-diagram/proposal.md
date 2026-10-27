# Add opt-in Mermaid diagrams to chat

## Why

Model replies include flowcharts and sequence diagrams that currently appear as raw fenced code. Consumers need themed diagrams without loading Mermaid in the main chat entry.

## What changes

Add MermaidDiagram and mermaidCodeRenderers through the optional @gntik-ai/chat/mermaid subpath. Load the pinned Mermaid peer on demand, render with strict security and token-derived themes, and sanitise the resulting SVG. Reuse kit controls for code view, copying, SVG download, zoom and pan. Include English and Spanish labels, live examples, regression tests, registry output and a changeset.

## Scope and risk

- Change id: add-chat-mermaid-diagram; capability: chat/mermaid-diagram. All requirements are ADDED because no baseline exists.
- Depends on add-markdown-component-map-plugins; integration uses the existing codeRenderers contract without changing Markdown.
- R2: untrusted sources become SVG. Strict Mermaid configuration and post-render sanitisation block scripts, handlers, JavaScript URLs and external resources.
- Rendering is client-only; consumers bundle the optional peer. Strict CSP may require the code view because Mermaid emits inline styles.
- Other diagram languages, editing, PNG export, full-screen viewing and default Markdown registration are deferred.
- Roll back by reverting the additive change or pinning the previous chat release. No publication or deployment.

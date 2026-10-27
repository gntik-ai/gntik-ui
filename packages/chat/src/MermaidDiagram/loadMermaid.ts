import type { Mermaid } from 'mermaid';
import { sanitizeSvg } from './sanitizeSvg';

let loading: Promise<Mermaid> | undefined;
/** The optional peer is requested only by a mounted, complete diagram. */
export function loadMermaid(): Promise<Mermaid> {
  return (loading ??= import('mermaid').then((module) => module.default));
}

// Mermaid's initialise/render pair uses global configuration. Serialise it so
// sibling diagrams cannot overwrite each other's theme while rendering awaits.
let pending: Promise<unknown> = Promise.resolve();
let sequence = 0;
export function renderMermaid(
  code: string,
  id: string,
  variables: Record<string, string>,
  active: () => boolean,
): Promise<string | undefined> {
  const request = pending.then(async () => {
    if (!active()) return;
    const mermaid = await loadMermaid();
    if (!active()) return;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      themeVariables: variables,
      htmlLabels: false,
      suppressErrorRendering: true,
      logLevel: 'fatal',
      // Untrusted frontmatter/directives cannot override the renderer's policy.
      secure: [
        'secure',
        'securityLevel',
        'startOnLoad',
        'maxTextSize',
        'maxEdges',
        'suppressErrorRendering',
        'htmlLabels',
        'theme',
        'themeVariables',
        'themeCSS',
        'dompurifyConfig',
        'flowchart',
        'fontFamily',
        'logLevel',
      ],
    });
    const scratch = document.createElement('div');
    scratch.className = 'fixed start-0 top-0 invisible pointer-events-none';
    scratch.inert = true;
    scratch.setAttribute('aria-hidden', 'true');
    document.body.append(scratch);
    try {
      const result = await mermaid.render(`diagram${id}-${++sequence}`, code, scratch);
      return sanitizeSvg(result.svg);
    } finally {
      scratch.remove();
    }
  });
  pending = request.catch(() => {});
  return request;
}

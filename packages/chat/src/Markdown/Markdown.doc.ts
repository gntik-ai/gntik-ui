import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'Markdown',
  group: 'Display',
  status: 'beta',
  description:
    'Safe, token-styled Markdown with GFM, code copying and streaming fence repair. Raw HTML stays skipped by default and URL attributes always pass safeUrl, including plugin-created URLs and component overrides. components merges over kit renderers; codeRenderers matches languages case-insensitively and receives code, language, streaming and complete (false only for the repaired fence). customTags allowlists standalone block tags: children use the same Markdown pipeline, attributes exclude on* and style, and unclosed tags render only while streaming. Unknown or malformed tags stay in the normal skipped-HTML pipeline without consuming later prose. useMarkdownContext exposes streaming to every renderer. Keep component maps and plugin arrays stable to preserve memoisation. User remarkPlugins follow GFM; user rehypePlugins follow kit HTML processing. Overrides and plugins are trusted executable code receiving untrusted content: validate data, render React text/children, and never use dangerouslySetInnerHTML. allowHtml lazily imports rehype-raw and rehype-sanitize; until loaded, HTML stays skipped. Its fixed subset is b, strong, i, em, u, s, del, sub, sup, kbd, mark, abbr[title], br, details[open] and summary. Other raw elements unwrap to text; scripts, styles, frames, embeds, forms, media, SVG, MathML, template and textarea drop their contents. Event handlers and style attributes are removed. MarkdownCustom demonstrates overrides, chart fences, think tags, both plugin types, opt-in HTML and partial streaming. Copy actions show common.copyFailed when clipboard access fails; successful copies reset after 1600ms.',
  keyboard: [
    ['Tab', 'Moves through links and code-block copy buttons in reading order'],
    ['Enter', 'Follows a link or copies the focused code block'],
  ],
  tokens: ['foreground', 'muted-foreground', 'primary-text', 'secondary', 'border', 'focus-ring'],
};

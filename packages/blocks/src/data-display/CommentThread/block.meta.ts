import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Comment thread',
  family: 'data-display',
  status: 'beta',
  description:
    'Plain-text comments by default, with optional renderBody for safe Markdown, avatar, author and Timestamp, plus a reply composer (Textarea + Button, ⌘/Ctrl+Enter posts). renderBody receives the raw comment; use a safe renderer such as @gntik-ai/chat Markdown (without allowHtml). Bodies are untrusted: never inject raw HTML. composerHint overrides the catalog hint and remains the textarea’s accessible description.',
  uses: ['Avatar', 'Timestamp', 'Textarea', 'Button'],
};

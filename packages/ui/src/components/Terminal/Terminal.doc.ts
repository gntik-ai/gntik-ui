import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'Terminal',
  group: 'Display',
  status: 'beta',
  description:
    'Streamed command output (build, deploy, job logs). ANSI SGR colours map to contrast-safe tokens (`parseAnsi` is exported), `\\r` progress lines rewrite in place, and a line cap drops the oldest output. It follows the tail until the user scrolls up, then offers “Jump to latest” with the count of new lines. Optional line numbers and timestamps, a wrap toggle, copy all and search with highlighted matches. The output is a `role="log"` with aria-live off unless `live` opts in. Stream through the `ref` handle (`write`, `writeln`, `clear`) or pass `lines`.',
  pattern: 'log · button · searchbox',
  keyboard: [
    ['Tab', 'Moves through the search box, match arrows, wrap toggle, copy button and the output log'],
    ['End', 'In the log: jumps to the newest line and resumes following the tail'],
    ['Home', 'In the log: jumps to the first line and stops following'],
    ['Arrow keys / Page Up / Page Down', 'Scroll the focused log'],
    ['Ctrl+F / ⌘F', 'Inside the terminal: focuses the search box'],
    ['Enter / Shift+Enter', 'In the search box: next / previous match (scrolled into view)'],
    ['Escape', 'In the search box: clears the search'],
  ],
  tokens: ['card', 'background', 'border', 'popover', 'secondary', 'foreground', 'muted-foreground', 'destructive-text', 'success-text', 'warning-text', 'info', 'category-violet', 'warning', 'primary', 'primary-text', 'focus-ring'],
};

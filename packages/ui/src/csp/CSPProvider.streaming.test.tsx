import { renderToReadableStream } from 'react-dom/server';
import { CSPProvider, ScrollArea, PrintLayout } from '../index';

it('nonces hoisted scrollbar styles when a custom streaming renderer supplies both nonce options', async () => {
  const stream = await renderToReadableStream(
    <CSPProvider nonce="abc123">
      <ScrollArea>Content</ScrollArea>
    </CSPProvider>,
    { nonce: { script: 'abc123', style: 'abc123' } },
  );
  const markup = await new Response(stream).text();
  const parsed = new DOMParser().parseFromString(markup, 'text/html');
  expect(parsed.querySelector('style[data-href="base-ui-disable-scrollbar"]')?.getAttribute('nonce')).toBe('abc123');
});

it('supports a script-only streaming renderer by suppressing all kit styles like the Next example', async () => {
  const stream = await renderToReadableStream(
    <CSPProvider nonce="abc123" disableStyleElements>
      <PrintLayout>
        <ScrollArea>Content</ScrollArea>
      </PrintLayout>
    </CSPProvider>,
    { nonce: 'abc123' },
  );
  expect(await new Response(stream).text()).not.toContain('<style');
});

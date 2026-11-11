// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { Textarea } from './Textarea';
import { Input } from '../Input/Input';

it.each([Textarea, Input])(
  'renders counter descriptions on the server with stable ids and an empty live region',
  (Control) => {
    const html = renderToString(<Control aria-label="Note" showCount maxLength={280} defaultValue="hello" />);
    const descriptionId = /aria-describedby="([^"]+)"/.exec(html)?.[1];
    expect(descriptionId).toBeTruthy();
    expect(html).toContain(`id="${descriptionId}"`);
    expect(html).toContain('5 of 280 characters');
    expect(html).toContain('aria-live="polite" aria-atomic="true" class="sr-only"></span>');
  },
);

it('renders autosize on the server without checking support or measuring height', () => {
  vi.stubGlobal('CSS', {
    supports: () => {
      throw new Error('client-only support check');
    },
  });
  try {
    const html = renderToString(<Textarea aria-label="Prompt" autosize minRows={2} maxRows={6} />);
    expect(html).toContain('--textarea-min-rows:2');
    expect(html).toContain('--textarea-max-rows:6');
    expect(html).not.toMatch(/style="[^"]*(?:^|[";])height:/);
    expect(renderToString(<Textarea aria-label="Prompt" autosize />)).not.toContain('style=');
  } finally {
    vi.unstubAllGlobals();
  }
});

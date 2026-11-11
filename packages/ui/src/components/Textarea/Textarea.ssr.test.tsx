// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { Textarea } from './Textarea';

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

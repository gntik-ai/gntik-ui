import { renderToString } from 'react-dom/server';
import { ThemeScope } from './ThemeScope';

it('server renders a scope without a document or portal node', () => {
  vi.stubGlobal('document', undefined);
  try {
    expect(renderToString(<ThemeScope theme="light">Content</ThemeScope>)).toBe(
      '<div class="light" data-theme-scope="light">Content</div>',
    );
  } finally {
    vi.unstubAllGlobals();
  }
});

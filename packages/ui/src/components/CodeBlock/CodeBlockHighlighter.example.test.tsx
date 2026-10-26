import { render, screen, waitFor, within } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { ThemeProvider, type ResolvedTheme } from '../../theme/ThemeProvider';
import CodeBlockHighlighter from './examples/CodeBlockHighlighter';
import { doc } from './CodeBlock.doc';

it('documents the optional adapter in the metadata shared by the catalog and registry', () => {
  const discoverySummary = doc.description.split('. ')[0];
  expect(discoverySummary).toContain('pnpm add shiki');
  expect(discoverySummary).toContain('@gntik-ai/ui/code-highlight-shiki');
  expect(doc.description).toContain('languages');
  expect(doc.description).toContain('maxHeight');
});

it.each<ResolvedTheme>(['dark', 'light', 'high_contrast'])(
  'the highlighter example loads real grammars and passes axe in %s',
  async (theme) => {
    const { container } = render(
      <ThemeProvider defaultMode={theme} storageKey={null}>
        <CodeBlockHighlighter />
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(within(screen.getByRole('region', { name: 'service.yaml' })).getByText('name')).toHaveClass(
        'text-primary-text',
      );
      expect(screen.getByText('greet')).toHaveClass('font-medium', 'text-foreground');
      expect(screen.getByText('SELECT')).toHaveClass('text-primary-text');
      expect(within(screen.getByRole('region', { name: 'config.toml' })).getByText('"api"')).toHaveClass(
        'text-warning-text',
      );
    });
    expect(container.querySelectorAll('pre code')).toHaveLength(5);
    for (const code of container.querySelectorAll('pre code')) {
      for (const styled of code.querySelectorAll('[style]')) expect(styled).toHaveAttribute('aria-hidden', 'true');
    }
    await expectNoAxeViolations();
  },
);

import { render, screen, waitFor, within } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { ThemeProvider, type ResolvedTheme } from '../../theme/ThemeProvider';
import CodeBlockHighlighter from './examples/CodeBlockHighlighter';

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
    });
    expect(container.querySelectorAll('pre code')).toHaveLength(4);
    for (const code of container.querySelectorAll('pre code')) {
      for (const styled of code.querySelectorAll('[style]')) expect(styled).toHaveAttribute('aria-hidden', 'true');
    }
    await expectNoAxeViolations();
  },
);

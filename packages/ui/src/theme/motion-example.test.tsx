import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../test/a11y';
import { ThemeProvider } from './ThemeProvider';
import ThemeProviderMotion from './examples/ThemeProviderMotion';

it.each(['dark', 'light', 'high_contrast'] as const)(
  'motion preview keeps the %s theme and is axe clean',
  async (theme) => {
    const { container } = render(
      <ThemeProvider defaultMode={theme} storageKey={null} motionStorageKey={null}>
        <ThemeProviderMotion />
      </ThemeProvider>,
    );
    const scope = screen.getByTestId('motion-scope');
    expect(scope.classList.contains('dark')).toBe(theme === 'dark');
    expect(scope.classList.contains('high_contrast')).toBe(theme === 'high_contrast');
    expect(scope.style.colorScheme).toBe(theme === 'light' ? 'light' : 'dark');
    await expectNoAxeViolations(container);
  },
);

it('demonstrates the runtime helpers observing a local scope', async () => {
  const { screen, fireEvent, waitFor } = await import('@testing-library/react');
  render(<ThemeProviderMotion />);
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Reduced motion'));
  fireEvent.click(screen.getByRole('switch', { name: 'Reduce motion' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('System motion preference'));
});

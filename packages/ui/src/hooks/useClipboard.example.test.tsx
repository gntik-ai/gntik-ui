import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ClipboardExample from './examples/useClipboardExample';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.className = '';
});

it.each(['dark', 'light', 'high_contrast'])(
  'copies from a closed row menu, restores focus and announces (%s)',
  async (theme) => {
    document.documentElement.className = theme;
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    const exec = vi.fn(() => true);
    Object.defineProperty(document, 'execCommand', { configurable: true, value: exec });
    render(<ClipboardExample />);
    const trigger = screen.getByRole('button', { name: 'More actions' });
    await expectNoAxeViolations();
    await user.tab();
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Copy ID' })).toHaveFocus());
    await expectNoAxeViolations();
    await user.click(await screen.findByRole('menuitem', { name: 'Copy ID' }));
    await waitFor(() => expect(screen.queryByRole('menuitem')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(exec).toHaveBeenCalledWith('copy');
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
    await expectNoAxeViolations();
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');
    exec.mockReturnValue(false);
    await user.click(screen.getByRole('menuitem', { name: 'Copy as cURL' }));
    await waitFor(() => expect(document.querySelector('[aria-live="assertive"]')).toHaveTextContent('Copy failed'));
    await expectNoAxeViolations();
  },
);

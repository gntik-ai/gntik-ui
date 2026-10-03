import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { InspectorLayout, InspectorToggle } from './InspectorLayout';
import InspectorLayoutProperties from './examples/InspectorLayoutProperties';

function mockMatchMedia(matches: boolean) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

describe('InspectorLayout', () => {
  // The setup polyfill reports every media query as unmatched; default these tests to large screens.
  let restoreMedia: () => void = () => {};
  beforeEach(() => {
    restoreMedia = mockMatchMedia(true);
  });
  afterEach(() => restoreMedia());

  it('renders the open panel as a labelled complementary landmark', () => {
    render(<InspectorLayoutProperties />);
    expect(screen.getByRole('complementary', { name: 'Properties' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle properties' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('Enter on the toggle closes and reopens the panel', async () => {
    const user = userEvent.setup();
    render(<InspectorLayoutProperties />);
    const toggle = screen.getByRole('button', { name: 'Toggle properties' });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard(' ');
    expect(screen.getByRole('complementary', { name: 'Properties' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('complementary')).toHaveFocus());
  });

  it('Escape closes the unpinned panel and returns focus to the toggle', async () => {
    const user = userEvent.setup();
    render(<InspectorLayoutProperties />);
    const close = screen.getByRole('button', { name: 'Close panel' });
    close.focus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle properties' })).toHaveFocus();
  });

  it('the pin button docks the panel; Escape no longer closes a pinned panel', async () => {
    const user = userEvent.setup();
    render(<InspectorLayoutProperties />);
    const pin = screen.getByRole('button', { name: 'Pin panel' });
    expect(pin).toHaveAttribute('aria-pressed', 'false');
    pin.focus();
    await user.keyboard('{Enter}');
    expect(pin).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('complementary')).toHaveAttribute('data-pinned');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('complementary', { name: 'Properties' })).toBeInTheDocument();
  });

  it('small screens: the panel is a bottom drawer closed by Escape', async () => {
    const restore = mockMatchMedia(false);
    try {
      const user = userEvent.setup();
      render(
        <InspectorLayout panelTitle="Details" panel={<p>Body</p>} defaultOpen={false}>
          <InspectorToggle />
        </InspectorLayout>,
      );
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
      const toggle = screen.getByRole('button', { name: 'Toggle panel' });
      await user.click(toggle);
      expect(await screen.findByRole('dialog', { name: 'Details' })).toBeInTheDocument();
      await expectNoAxeViolations();
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    } finally {
      restore();
    }
  });

  it('has no axe violations', async () => {
    render(<InspectorLayoutProperties />);
    await expectNoAxeViolations();
  });
});

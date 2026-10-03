import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SkipLink, VisuallyHidden } from './VisuallyHidden';
import SkipLinkPage from './examples/SkipLinkPage';
import VisuallyHiddenLabel from './examples/VisuallyHiddenLabel';

describe('VisuallyHidden', () => {
  it('hides visually but keeps the accessible name', () => {
    render(<VisuallyHiddenLabel />);
    const link = screen.getByRole('link', { name: 'Download INV-0042' });
    expect(link.querySelector('span')).toHaveClass('sr-only');
  });

  it('focusable variant reveals on focus; render swaps the element', () => {
    render(
      <>
        <VisuallyHidden focusable data-testid="f">x</VisuallyHidden>
        <VisuallyHidden render={<h2 />}>Filters</VisuallyHidden>
      </>,
    );
    expect(screen.getByTestId('f')).toHaveClass('sr-only', 'focus:not-sr-only', 'focus-within:not-sr-only');
    expect(screen.getByRole('heading', { level: 2, name: 'Filters' })).toHaveClass('sr-only');
  });
});

describe('SkipLink', () => {
  it('Tab reveals it as the first stop; Enter moves focus to the target', async () => {
    const user = userEvent.setup();
    render(<SkipLinkPage />);
    await user.tab();
    const link = screen.getByRole('link', { name: 'Skip to main content' });
    expect(link).toHaveFocus();
    expect(link).toHaveClass('sr-only', 'focus:not-sr-only');
    await user.keyboard('{Enter}');
    // The demo target is a div (a docs page already has its own <main>).
    const main = document.getElementById('skip-link-demo-main');
    expect(main).toHaveFocus();
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('keeps an already focusable target as is and respects a prevented onClick', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <>
        <SkipLink targetId="t">Skip</SkipLink>
        <button id="t" type="button">Target</button>
      </>,
    );
    await user.click(screen.getByRole('link', { name: 'Skip' }));
    expect(screen.getByRole('button', { name: 'Target' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Target' })).not.toHaveAttribute('tabindex');
    rerender(
      <>
        <SkipLink targetId="t" onClick={(e) => e.preventDefault()}>Skip</SkipLink>
        <button id="t" type="button">Target</button>
      </>,
    );
    await user.click(screen.getByRole('link', { name: 'Skip' }));
    expect(screen.getByRole('link', { name: 'Skip' })).toHaveFocus();
  });

  it('examples have no axe violations', async () => {
    render(<><SkipLinkPage /><VisuallyHiddenLabel /></>);
    await expectNoAxeViolations();
  });
});

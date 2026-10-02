import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Link } from './Link';
import LinkVariants from './examples/LinkVariants';
import LinkRouter from './examples/LinkRouter';

describe('Link', () => {
  it('renders an anchor with brand styles and merges className', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<Link ref={ref} href="/docs" className="font-semibold">Docs</Link>);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveClass('text-primary-text', 'hover:underline', 'font-semibold');
    expect(link).not.toHaveClass('font-medium');
    expect(ref.current).toBe(link);
  });

  it('Enter follows the link', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(<Link href="/projects" onClick={onClick}>Projects</Link>);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Tab moves focus to and from the link', async () => {
    const user = userEvent.setup();
    render(<><Link href="/a">First</Link><Link href="/b">Second</Link></>);
    await user.tab();
    expect(screen.getByRole('link', { name: 'First' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Second' })).toHaveFocus();
  });

  it('external links open in a new tab with a hint and safe rel', () => {
    render(<Link href="https://example.com" external>Help</Link>);
    const link = screen.getByRole('link', { name: /^Help\s*\(opens in a new tab\)$/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses the LinkProvider router link for internal links only', () => {
    render(<LinkRouter />);
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('data-router-link');
    expect(screen.getByRole('link', { name: /Status page/ })).not.toHaveAttribute('data-router-link');
  });

  it('render swaps the element', () => {
    render(<Link render={<button type="button" />}>As button</Link>);
    expect(screen.getByRole('button', { name: 'As button' })).toHaveClass('text-primary-text');
  });

  it('examples have no axe violations', async () => {
    render(<><LinkVariants /><LinkRouter /></>);
    await expectNoAxeViolations();
  });
});

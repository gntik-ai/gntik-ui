import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Breadcrumbs } from './Breadcrumbs';
import BreadcrumbsBasic from './examples/BreadcrumbsBasic';
import BreadcrumbsCollapsed from './examples/BreadcrumbsCollapsed';

describe('Breadcrumbs', () => {
  it('renders a labelled nav with an ordered list and marks the current page', () => {
    render(<BreadcrumbsBasic />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const list = within(nav).getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    const current = screen.getByText('web-frontend').closest('[aria-current]');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'web-frontend' })).not.toBeInTheDocument();
  });

  it('Tab moves through the links but not the current page', async () => {
    const user = userEvent.setup();
    render(<BreadcrumbsBasic />);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Deployments' })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('Enter follows the focused link', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: MouseEvent) => e.preventDefault());
    render(<Breadcrumbs items={[{ label: 'Projects', href: '/projects' }, { label: 'Billing' }]} />);
    const link = screen.getByRole('link', { name: 'Projects' });
    link.addEventListener('click', onClick);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('collapses middle items; Enter / Space on the ellipsis reveals them and focuses the first', async () => {
    const user = userEvent.setup();
    render(<BreadcrumbsCollapsed />);
    expect(screen.queryByRole('link', { name: 'Projects' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Members' })).toBeInTheDocument();
    await user.tab();
    await user.tab();
    const more = screen.getByRole('button', { name: 'Show 2 more levels' });
    expect(more).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('button', { name: /Show/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'eu-west-1' })).toBeInTheDocument();
  });

  it('Space also expands the trail', async () => {
    const user = userEvent.setup();
    render(<BreadcrumbsCollapsed />);
    screen.getByRole('button', { name: 'Show 2 more levels' }).focus();
    await user.keyboard(' ');
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus();
  });

  it('examples have no axe violations (collapsed and expanded)', async () => {
    const user = userEvent.setup();
    render(<><BreadcrumbsBasic /><BreadcrumbsCollapsed /></>);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: 'Show 2 more levels' }));
    await expectNoAxeViolations();
  });
});

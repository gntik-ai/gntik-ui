import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Page } from './Page';
import PageSettings from './examples/PageSettings';
import PageWidths from './examples/PageWidths';

describe('Page', () => {
  it('renders the simple header as an h1 with description and actions', () => {
    render(<PageSettings />);
    expect(screen.getByRole('heading', { level: 1, name: 'Project settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add domain' })).toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('a custom header replaces the simple one', () => {
    render(<Page header={<div>Custom header</div>} title="Ignored" />);
    expect(screen.getByText('Custom header')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('Tab follows the reading order, ending in the sticky action bar', async () => {
    const user = userEvent.setup();
    render(<PageSettings />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Add domain' })).toHaveFocus();
    await user.tab();
    await user.tab();
    const save = screen.getByRole('button', { name: 'Save changes' });
    expect(save).toHaveFocus();
    expect(screen.getByRole('region', { name: 'Page actions' })).toContainElement(save);
    await user.keyboard('{Enter}');
    expect(screen.getByText('Changes saved')).toBeInTheDocument();
  });

  it('switches width', async () => {
    const user = userEvent.setup();
    const { container } = render(<PageWidths />);
    await user.click(screen.getByRole('button', { name: 'wide' }));
    expect(container.querySelector('[data-width]')).toHaveAttribute('data-width', 'wide');
  });

  it('examples have no axe violations', async () => {
    const { unmount } = render(<PageSettings />);
    await expectNoAxeViolations();
    unmount();
    render(<PageWidths />);
    await expectNoAxeViolations();
  });
});

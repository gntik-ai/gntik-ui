import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Toolbar, ToolbarButton, ToolbarEnd, ToolbarSeparator, ToolbarStart } from './Toolbar';
import ToolbarTable from './examples/ToolbarTable';
import ToolbarBulkActions from './examples/ToolbarBulkActions';

function Basic({ onBold }: { onBold?: () => void }) {
  return (
    <>
      <button type="button">Before</button>
      <Toolbar aria-label="Format" variant="floating">
        <ToolbarStart>
          <ToolbarButton onClick={onBold}>Bold</ToolbarButton>
          <ToolbarButton>Italic</ToolbarButton>
        </ToolbarStart>
        <ToolbarSeparator />
        <ToolbarEnd>
          <ToolbarButton>Link</ToolbarButton>
        </ToolbarEnd>
      </Toolbar>
      <button type="button">After</button>
    </>
  );
}

const btn = (name: string) => screen.getByRole('button', { name });

describe('Toolbar', () => {
  it('exposes role toolbar with its label, orientation and a separator', () => {
    render(<Basic />);
    const toolbar = screen.getByRole('toolbar', { name: 'Format' });
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('ArrowRight / ArrowLeft move focus between items across lanes (roving tabindex) and wrap', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.tab();
    await user.tab();
    expect(btn('Bold')).toHaveFocus();
    expect(btn('Italic')).toHaveAttribute('tabindex', '-1');
    await user.keyboard('{ArrowRight}');
    expect(btn('Italic')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(btn('Link')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(btn('Bold')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(btn('Link')).toHaveFocus();
  });

  it('Tab / Shift+Tab leave the toolbar (one Tab stop)', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.tab();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(btn('Italic')).toHaveFocus();
    await user.tab();
    expect(btn('After')).toHaveFocus();
    await user.tab({ shift: true });
    expect(btn('Italic')).toHaveFocus();
    await user.tab({ shift: true });
    expect(btn('Before')).toHaveFocus();
  });

  it('Enter / Space activate the focused button', async () => {
    const user = userEvent.setup();
    const onBold = vi.fn();
    render(<Basic onBold={onBold} />);
    btn('Bold').focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onBold).toHaveBeenCalledTimes(2);
  });

  it('input, icon-only button and link are toolbar items', async () => {
    const user = userEvent.setup();
    render(<ToolbarTable />);
    const search = screen.getByRole('textbox', { name: 'Search deployments' });
    await user.tab();
    expect(search).toHaveFocus();
    await user.keyboard('api');
    expect(screen.getByText('Results for “api”')).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(btn('Filters')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(btn('Export CSV')).toHaveFocus();
    expect(btn('New deployment')).toHaveClass('bg-primary');
  });

  it('examples have no axe violations', async () => {
    render(<><ToolbarTable /><ToolbarBulkActions /></>);
    expect(screen.getByRole('link', { name: 'View members' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });
});

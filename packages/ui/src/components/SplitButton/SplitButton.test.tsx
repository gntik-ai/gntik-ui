import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SplitButton } from './SplitButton';
import SplitButtonBasic from './examples/SplitButtonBasic';
import SplitButtonVariants from './examples/SplitButtonVariants';

function setup() {
  const onClick = vi.fn();
  const onDraft = vi.fn();
  const onClose = vi.fn();
  render(
    <SplitButton onClick={onClick} actions={[{ label: 'Save as draft', onSelect: onDraft }, { label: 'Save and close', onSelect: onClose }]}>
      Save
    </SplitButton>,
  );
  return { onClick, onDraft, onClose, action: screen.getByRole('button', { name: 'Save' }), trigger: screen.getByRole('button', { name: 'More options' }) };
}

describe('SplitButton', () => {
  it('renders two buttons in a group; the menu button advertises its menu', () => {
    const { action, trigger } = setup();
    expect(screen.getByRole('group')).toContainElement(action);
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(action).not.toHaveAttribute('aria-haspopup');
  });

  it('Tab moves from the action to the menu button; Enter and Space run the action', async () => {
    const user = userEvent.setup();
    const { onClick, action, trigger } = setup();
    await user.tab();
    expect(action).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
    await user.tab();
    expect(trigger).toHaveFocus();
  });

  it.each([['{Enter}'], [' '], ['{ArrowDown}']])('%s on the menu button opens the menu on the first item', async (key) => {
    const user = userEvent.setup();
    const { trigger } = setup();
    trigger.focus();
    await user.keyboard(key);
    const menu = await screen.findByRole('menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Save as draft' })).toHaveFocus());
  });

  it('arrows move between items; Enter runs one and closes the menu', async () => {
    const user = userEvent.setup();
    const { trigger, onClose, onClick } = setup();
    trigger.focus();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Save as draft' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Save and close' })).toHaveFocus());
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Save as draft' })).toHaveFocus());
    await user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('Escape closes the menu and returns focus to the menu button', async () => {
    const user = userEvent.setup();
    const { trigger } = setup();
    trigger.focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('matches Button variants and sizes; disabled disables both halves', () => {
    render(
      <SplitButton variant="secondary" size="sm" disabled menuLabel="More">
        Run
      </SplitButton>,
    );
    const action = screen.getByRole('button', { name: 'Run' });
    expect(action).toHaveClass('h-8', 'rounded-e-none', 'border-border');
    expect(action).toBeDisabled();
    const trigger = screen.getByRole('button', { name: 'More' });
    expect(trigger).toHaveClass('size-8', 'rounded-s-none');
    expect(trigger).toBeDisabled();
  });

  it('examples have no axe violations (menu open too)', async () => {
    const user = userEvent.setup();
    render(
      <>
        <SplitButtonBasic />
        <SplitButtonVariants />
      </>,
    );
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: 'More deploy options' }));
    await screen.findByRole('menu');
    await expectNoAxeViolations();
  });
});

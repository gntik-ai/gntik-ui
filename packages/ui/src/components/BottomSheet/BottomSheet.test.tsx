import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Button } from '../Button';
import { BottomSheet, BottomSheetContent, BottomSheetTrigger, type BottomSheetSnapPoint } from './BottomSheet';
import BottomSheetDetails from './examples/BottomSheetDetails';
import BottomSheetFilters from './examples/BottomSheetFilters';

function setup() {
  const user = userEvent.setup();
  const onSnapPointChange = vi.fn<(p: BottomSheetSnapPoint | null) => void>();
  render(
    <BottomSheet snapPoints={[0.3, 0.6, 1]} onSnapPointChange={onSnapPointChange}>
      <BottomSheetTrigger render={<Button />}>Open sheet</BottomSheetTrigger>
      <BottomSheetContent title="Sheet" description="Details">
        <button type="button">Inside</button>
      </BottomSheetContent>
    </BottomSheet>,
  );
  return { user, onSnapPointChange, trigger: screen.getByRole('button', { name: 'Open sheet' }) };
}

describe('BottomSheet', () => {
  it('opens from the keyboard as a labelled dialog and moves focus inside', async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard('{Enter}');
    const sheet = await screen.findByRole('dialog', { name: 'Sheet' });
    expect(sheet).toHaveAccessibleDescription('Details');
    expect(sheet).toHaveAttribute('data-swipe-direction', 'down');
    await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true));
  });

  it('handle: ArrowUp / ArrowDown / Home / End move between snap points', async () => {
    const { user, trigger, onSnapPointChange } = setup();
    await user.click(trigger);
    const handle = await screen.findByRole('button', { name: 'Resize sheet' });
    expect(handle).toHaveAccessibleDescription('Arrow Up expands, Arrow Down collapses.');
    handle.focus();
    await user.keyboard('{ArrowUp}');
    expect(onSnapPointChange).toHaveBeenLastCalledWith(0.6);
    await user.keyboard('{End}');
    expect(onSnapPointChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByRole('status')).toHaveTextContent('Sheet expanded.');
    await user.keyboard('{ArrowDown}');
    expect(onSnapPointChange).toHaveBeenLastCalledWith(0.6);
    await user.keyboard('{Home}');
    expect(onSnapPointChange).toHaveBeenLastCalledWith(0.3);
    expect(screen.getByRole('status')).toHaveTextContent('Sheet at height 1 of 3.');
  });

  it('handle: Enter / Space cycle the heights', async () => {
    const { user, trigger, onSnapPointChange } = setup();
    await user.click(trigger);
    const handle = await screen.findByRole('button', { name: 'Resize sheet' });
    handle.focus();
    await user.keyboard('{Enter}');
    expect(onSnapPointChange).toHaveBeenLastCalledWith(0.6);
    await user.keyboard(' ');
    expect(onSnapPointChange).toHaveBeenLastCalledWith(1);
    await user.keyboard('{Enter}');
    expect(onSnapPointChange).toHaveBeenLastCalledWith(0.3);
  });

  it('Tab stays inside; Escape closes and returns focus to the trigger', async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const sheet = await screen.findByRole('dialog');
    for (let i = 0; i < 4; i++) {
      await user.tab();
      await waitFor(() => expect(sheet.contains(document.activeElement)).toBe(true));
    }
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('examples have no axe violations (open)', async () => {
    const user = userEvent.setup();
    render(
      <>
        <BottomSheetFilters />
        <BottomSheetDetails />
      </>,
    );
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: 'Filter deployments' }));
    await screen.findByRole('dialog', { name: 'Filter deployments' });
    await expectNoAxeViolations();
  });
});

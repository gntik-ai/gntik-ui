import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { TimeSlotPicker } from './TimeSlotPicker';

describe('TimeSlotPicker', () => {
  it('renders a radio group with taken slots disabled', async () => {
    const { container } = render(<TimeSlotPicker description="Wednesday, April 15" />);
    expect(screen.getByRole('group', { name: 'Available times' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(25);
    expect(screen.getByRole('radio', { name: /^09:00/ })).toBeDisabled();
    await expectNoAxeViolations(container);
  });

  it('selects by click and by arrow keys', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TimeSlotPicker onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: '10:00' }));
    expect(screen.getByRole('radio', { name: '10:00' })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('10:00');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '10:30' })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('10:30');
  });
});

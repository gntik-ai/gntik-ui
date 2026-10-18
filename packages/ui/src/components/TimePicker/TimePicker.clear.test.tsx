import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimePicker } from './TimePicker';

it.each([12, 24] as const)(
  'clears every TimePicker segment on a %s-hour clock and focuses hours',
  async (hourCycle) => {
    const calls: unknown[] = [];
    const { container } = render(
      <TimePicker
        clearable
        withSeconds
        hourCycle={hourCycle}
        defaultValue="09:30:00"
        aria-label="Start"
        name="time"
        onValueChange={(v) => calls.push(v)}
        onClear={() => calls.push('clear')}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear Start' }));
    expect(calls).toEqual([null, 'clear']);
    for (const segment of screen.getAllByRole('spinbutton')) expect(segment).toHaveAttribute('data-placeholder');
    expect(screen.getByRole('spinbutton', { name: 'Hours' })).toHaveFocus();
    expect(container.querySelector('input[name="time"]')).toHaveValue('');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  },
);
it.each([{ disabled: true }, { readOnly: true }, { defaultValue: null }, { clearable: false }])(
  'hides TimePicker clear for %o',
  (props) => {
    render(<TimePicker clearable defaultValue="09:30" aria-label="Start" {...props} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  },
);

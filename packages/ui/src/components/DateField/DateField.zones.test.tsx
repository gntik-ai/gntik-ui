import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, FieldLabel } from '../Field';
import { DateField } from './DateField';
import { DateRangeField } from './DateRangeField';

describe('DateField 12-hour period', () => {
  it('emits a typed date-time once, after the period is entered', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateField locale="en-US" granularity="minute" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('100120260230');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('spinbutton', { name: 'AM/PM' })).toHaveAttribute('aria-valuetext', 'Empty');
    await user.keyboard('p');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1, 14, 30));
  });

  it('emits a pasted date-time and a pasted date without waiting for the period', () => {
    const onValueChange = vi.fn();
    render(<DateField locale="en-US" granularity="minute" onValueChange={onValueChange} />);
    const month = screen.getByRole('spinbutton', { name: 'Month' });
    fireEvent.paste(month, { clipboardData: { getData: () => '2026-10-01T14:30' } });
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 1, 14, 30));
    expect(screen.getByRole('spinbutton', { name: 'AM/PM' })).toHaveTextContent('PM');
    fireEvent.paste(month, { clipboardData: { getData: () => '03/04/2026' } });
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 4, 0, 0));
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });
});

describe('DateField zoned wall time', () => {
  beforeAll(() => vi.stubEnv('TZ', 'America/New_York'));
  afterAll(() => vi.unstubAllEnvs());

  it('types a wall time that does not exist on the host clock as the same UTC wall time', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <DateField
        locale="sv-SE"
        granularity="minute"
        hourCycle={24}
        timeZone="UTC"
        name="at"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole('spinbutton', { name: 'Year' }));
    await user.keyboard('202603080230');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(Date.UTC(2026, 2, 8, 2, 30)));
    expect(container.querySelector('input[name="at"]')).toHaveValue('2026-03-08T02:30');
  });

  it('shows a UTC instant on the UTC wall clock and submits it in UTC with the utc prop', () => {
    const { container } = render(
      <DateField
        locale="sv-SE"
        granularity="minute"
        hourCycle={24}
        utc
        forceLeadingZeros
        name="at"
        defaultValue={new Date(Date.UTC(2026, 2, 8, 2, 30))}
      />,
    );
    expect(screen.getAllByRole('spinbutton').map((s) => s.textContent)).toEqual(['2026', '03', '08', '02', '30']);
    expect(container.querySelector('input[name="at"]')).toHaveValue('2026-03-08T02:30');
  });

  it('compares min and max on the zone calendar day', async () => {
    const user = userEvent.setup();
    render(
      <DateField
        locale="sv-SE"
        utc
        max={new Date(Date.UTC(2026, 2, 8, 23, 0))}
        defaultValue={new Date(Date.UTC(2026, 2, 8, 1, 0))}
      />,
    );
    expect(screen.getByRole('group').hasAttribute('data-invalid')).toBe(false);
    await user.click(screen.getByRole('spinbutton', { name: 'Day' }));
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('group')).toHaveAttribute('data-invalid');
  });

  it('writes UTC hidden inputs for a range with the utc prop', () => {
    const { container } = render(
      <DateRangeField
        locale="sv-SE"
        granularity="minute"
        hourCycle={24}
        utc
        name="window"
        defaultValue={{ start: new Date(Date.UTC(2026, 2, 8, 2, 30)), end: new Date(Date.UTC(2026, 2, 9, 23, 45)) }}
      />,
    );
    expect(container.querySelector('input[name="window-start"]')).toHaveValue('2026-03-08T02:30');
    expect(container.querySelector('input[name="window-end"]')).toHaveValue('2026-03-09T23:45');
  });
});

describe('DateField group validity', () => {
  it('marks the group aria-invalid for an out-of-bounds typed date', async () => {
    const user = userEvent.setup();
    render(<DateField locale="en-US" max={new Date(2026, 11, 31)} />);
    const group = screen.getByRole('group');
    expect(group).not.toHaveAttribute('aria-invalid');
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('01052027');
    expect(group).toHaveAttribute('aria-invalid', 'true');
  });

  it.each([
    ['DateField', <DateField key="a" locale="en-US" defaultValue={new Date(2026, 9, 1)} />],
    [
      'DateRangeField',
      <DateRangeField key="b" locale="en-US" defaultValue={{ start: new Date(2026, 9, 1), end: null }} />,
    ],
  ])('reflects an inherited Field invalid on %s before and after an edit', async (_name, control) => {
    const user = userEvent.setup();
    render(
      <Field invalid>
        <FieldLabel>Window</FieldLabel>
        {control}
      </Field>,
    );
    const group = screen.getByRole('group', { name: 'Window' });
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('data-invalid');
    screen.getAllByRole('spinbutton').forEach((s) => expect(s).toHaveAttribute('aria-invalid', 'true'));
    await user.click(screen.getAllByRole('spinbutton')[1]!);
    await user.keyboard('{ArrowUp}');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    screen.getAllByRole('spinbutton').forEach((s) => expect(s).toHaveAttribute('aria-invalid', 'true'));
  });
});

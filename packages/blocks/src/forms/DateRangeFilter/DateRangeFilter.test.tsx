import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DateRangeFilter } from './DateRangeFilter';

const today = new Date(2026, 5, 15);

describe('DateRangeFilter', () => {
  it('renders the last 7 days by default', async () => {
    const { container } = render(<DateRangeFilter today={today} />);
    const field = screen.getByRole('combobox', { name: 'Date range' });
    expect((field as HTMLInputElement).value).toMatch(/Jun 9/);
    await expectNoAxeViolations(container);
  });

  it('applies a preset and clears', async () => {
    const onValueChange = vi.fn();
    render(<DateRangeFilter today={today} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Date range' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Today' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: today, end: today });
    await userEvent.click(screen.getByRole('button', { name: 'Clear date range' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: null, end: null });
    expect(screen.getByRole('combobox', { name: 'Date range' })).toHaveValue('');
  });
});

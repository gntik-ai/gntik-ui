import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import InputClearable from './examples/InputClearable';
import TextareaClearable from '../Textarea/examples/TextareaClearable';
import SelectClearable from '../Select/examples/SelectClearable';
import DatePickerClearable from '../DatePicker/examples/DatePickerClearable';
import TimePickerClearable from '../TimePicker/examples/TimePickerClearable';

it.each(['dark', 'light', 'high_contrast'])('clearable examples have no axe violations in %s', async (theme) => {
  document.documentElement.className = theme === 'light' ? '' : theme;
  render(
    <>
      <InputClearable />
      <TextareaClearable />
      <SelectClearable />
      <DatePickerClearable />
      <TimePickerClearable />
    </>,
  );
  await expectNoAxeViolations();
  await userEvent.click(screen.getByRole('combobox', { name: 'Region' }));
  await screen.findByRole('listbox');
  await expectNoAxeViolations();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  await userEvent.click(screen.getByRole('combobox', { name: 'Expiry' }));
  await screen.findByRole('dialog');
  await expectNoAxeViolations();
});

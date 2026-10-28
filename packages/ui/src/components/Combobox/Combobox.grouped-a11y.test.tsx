import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import ComboboxGrouped from './examples/ComboboxGrouped';
import MultiSelectGrouped from '../MultiSelect/examples/MultiSelectGrouped';

it.each(['dark', 'light', 'high_contrast'])(
  'grouped examples are axe clean closed, open and filtered in %s',
  async (theme) => {
    document.documentElement.classList.add(theme);
    try {
      for (const [Example, labels] of [
        [ComboboxGrouped, ['City by region', 'Remote city by region']],
        [MultiSelectGrouped, ['Cities by region']],
      ] as const) {
        const user = userEvent.setup();
        const view = render(<Example />);
        await expectNoAxeViolations();
        for (const name of labels) {
          const input = screen.getByRole('combobox', { name });
          await user.click(input);
          await screen.findByRole('group', { name: 'Europe' });
          await expectNoAxeViolations();
          await user.type(input, 'par');
          await waitFor(() => expect(screen.queryByText('Americas')).not.toBeInTheDocument());
          await expectNoAxeViolations();
          await user.clear(input);
          await user.type(input, 'zzz');
          await waitFor(() => expect(screen.queryByText('Europe')).not.toBeInTheDocument());
          await expectNoAxeViolations();
          await user.keyboard('{Escape}');
        }
        view.unmount();
      }
    } finally {
      document.documentElement.classList.remove(theme);
    }
  },
);

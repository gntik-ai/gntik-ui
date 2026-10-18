import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import ComboboxVirtualized from '../Combobox/examples/ComboboxVirtualized';
import MultiSelectVirtualized from '../MultiSelect/examples/MultiSelectVirtualized';
import TransferListVirtualized from '../TransferList/examples/TransferListVirtualized';

// CSS and per-theme contrast are covered by virtualized-options.a11y.spec.js in a browser.
it('virtualized examples have accessible structure, closed and open', async () => {
  const user = userEvent.setup();
  render(
    <>
      <ComboboxVirtualized />
      <MultiSelectVirtualized />
      <TransferListVirtualized />
    </>,
  );
  await expectNoAxeViolations();
  for (const name of ['Nodes (10,000 options)', 'Remote nodes (5,000 options)', 'Nodes (5,000 options)']) {
    await user.click(screen.getByRole('combobox', { name }));
    await screen.findByRole('option', { name: 'node-1' });
    await expectNoAxeViolations();
    await user.keyboard('{Escape}');
  }
});

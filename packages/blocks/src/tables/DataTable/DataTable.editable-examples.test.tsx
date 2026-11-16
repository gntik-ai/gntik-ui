import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import EditableRows from './examples/editable-rows';
import DataTableFieldArray from '../../../../ui/examples/data-table-field-array';

it.each(['dark', 'light', 'high_contrast'])(
  'keeps the row/cell examples accessible in %s, including editors, errors, bulk and delete',
  async (theme) => {
    document.documentElement.className = theme;
    const user = userEvent.setup();
    const { container } = render(
      <I18nProvider locale="en">
        <EditableRows />
      </I18nProvider>,
    );
    await expectNoAxeViolations(container);
    const table = screen.getByRole('table', { name: 'Row editing and save all' });
    await user.click(within(table).getByRole('button', { name: 'Edit api-gateway' }));
    const quota = within(table).getByRole('spinbutton', { name: 'Quota for api-gateway' });
    await user.clear(quota);
    await user.type(quota, '900{Enter}');
    expect(quota).toHaveAccessibleDescription('Exceeds the plan limit');
    await expectNoAxeViolations(container);
    await user.click(within(table).getByRole('button', { name: 'Cancel' }));
    await user.click(within(table).getByRole('button', { name: 'Actions for api-gateway' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(screen.getByRole('alertdialog', { name: 'Delete api-gateway?' })).toBeVisible();
    await expectNoAxeViolations(document.body);
  },
);

it.each(['dark', 'light', 'high_contrast'])('binds row edits and additions to the form array in %s', async (theme) => {
  document.documentElement.className = theme;
  const user = userEvent.setup();
  const { container } = render(
    <I18nProvider locale="en">
      <DataTableFieldArray />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Edit api-gateway' }));
  await user.type(screen.getByRole('textbox', { name: 'Name for api-gateway' }), '-updated{Enter}');
  expect(screen.getByText('api-gateway-updated')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Edit api-gateway-updated' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Add row' }));
  await user.type(screen.getByRole('textbox', { name: 'Name for Add row' }), 'new-item{Enter}');
  expect(screen.getByText('new-item')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Submit form' }));
  expect(await screen.findByText('Form submitted')).toBeVisible();
  await expectNoAxeViolations(container);
});

it('deletes a form-array row without submitting the surrounding form', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale="en">
      <DataTableFieldArray />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Actions for api-gateway' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
  const dialog = screen.getByRole('alertdialog', { name: 'Delete api-gateway?' });
  await user.type(within(dialog).getByRole('textbox'), 'api-gateway');
  await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
  await vi.waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  expect(screen.queryByRole('button', { name: 'Edit api-gateway' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Edit billing' })).toBeVisible();
  expect(screen.queryByText('Form submitted')).toBeNull();
});

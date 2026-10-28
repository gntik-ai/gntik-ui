import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';

it('does not move focus again when a cancelled pending cell save resolves', async () => {
  const user = userEvent.setup();
  let resolve!: () => void;
  const onCellEdit = vi.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  render(
    <>
      <DataTable
        rows={[{ id: 'one', name: 'Support agent' }]}
        columns={[{ id: 'name', header: 'Name', accessor: (row) => row.name, editable: true }]}
        paginated={false}
        onCellEdit={onCellEdit}
      />
      <button type="button">After</button>
    </>,
  );
  await user.click(screen.getByRole('button', { name: 'Support agent' }));
  await user.type(screen.getByRole('textbox'), 'x{Enter}{Escape}');
  expect(screen.getByRole('button', { name: 'Support agent' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'After' }));
  await act(async () => resolve());
  expect(onCellEdit).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
});

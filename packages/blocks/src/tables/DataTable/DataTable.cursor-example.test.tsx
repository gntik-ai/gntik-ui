import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import type { TableDataParams, TableDataResult } from '../../hooks/useTableData';
import CursorLoadMoreExample from './examples/cursor-load-more';

it.each(['dark', 'light', 'high_contrast'] as const)(
  'appends, retries and exhausts the cursor example accessibly in %s',
  async (theme) => {
    const user = userEvent.setup();
    const getRows = vi
      .fn<(params: TableDataParams<{ search: string }>) => Promise<TableDataResult<{ id: number; name: string }>>>()
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'First item' }], nextCursor: 'c2' })
      .mockRejectedValueOnce(new Error('Service unavailable'))
      .mockResolvedValueOnce({ rows: [{ id: 2, name: 'Second item' }], nextCursor: null });
    const { container } = render(
      <ThemeProvider defaultMode={theme} storageKey={null}>
        <CursorLoadMoreExample getRows={getRows} />
      </ThemeProvider>,
    );
    await screen.findByText('First item');
    expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole('button', { name: 'Load more' }));
    expect((await screen.findAllByText('Service unavailable')).length).toBeGreaterThan(0);
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText('Second item');
    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(getRows.mock.calls.map(([params]) => params.cursor)).toEqual([null, 'c2', 'c2']);
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
    await act(async () => {});
    await expectNoAxeViolations(container);
  },
);

it('demonstrates an error and retry through the live preview controls', async () => {
  const user = userEvent.setup();
  render(<CursorLoadMoreExample />);
  await screen.findByText('Item 1');
  await user.click(screen.getByRole('checkbox', { name: 'Fail next request' }));
  await user.click(screen.getByRole('button', { name: 'Load more' }));
  expect((await screen.findAllByText('Request failed. Try again.')).length).toBeGreaterThan(0);
  expect(screen.getByText('Item 1')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  await screen.findByText('Item 35');
  expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
});

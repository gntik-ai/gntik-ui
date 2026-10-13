import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginationFooter } from './PaginationFooter';
import { paginationLabels } from '../__tests__/labels-fixtures';
import { assertInventory, baseline, checkAxe, themes } from '../__tests__/matrix';

for (const mode of ['default', 'en', 'es'] as const)
  for (const theme of themes) {
    it(`all pagination states: ${mode}/${theme}`, async () => {
      document.documentElement.className = theme;
      const user = userEvent.setup();
      const states: ReturnType<typeof baseline>[] = [];
      const observe = () => {
        if (mode === 'default') states.push(baseline());
      };
      const l = paginationLabels[mode === 'es' ? 'es' : 'en'];
      const rangeSummary = vi.fn(l.rangeSummary);
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();
      const { rerender } = render(
        <PaginationFooter
          total={97}
          noun="A"
          labels={mode === 'default' ? undefined : { ...l, rangeSummary }}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />,
      );
      const check = async (from: number, to: number) => {
        expect(screen.getByRole('combobox', { name: l.rowsPerPage })).toBeInTheDocument();
        expect(screen.getByRole('navigation', { name: l.pagination('A') })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: l.previous })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: l.next })).toBeInTheDocument();
        const live = document.querySelector('[aria-live]')!;
        expect(live.textContent).toBe(l.rangeSummary(from, to, 97));
        if (mode !== 'default') expect(rangeSummary).toHaveBeenLastCalledWith(from, to, 97);
        for (const button of screen
          .getAllByRole('button')
          .filter((element) => /^\d+$/.test(element.textContent ?? ''))) {
          expect(button).toHaveAccessibleName(l.page(Number(button.textContent)));
        }
        assertInventory(
          [
            l.rowsPerPage,
            l.pagination('A'),
            l.previous,
            l.next,
            l.rangeSummary(from, to, 97),
            ...Array.from({ length: 10 }, (_, i) => l.page(i + 1)),
            ...(mode === 'default' ? [`${from}–${to}`, 'of', '97'] : []),
          ],
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '25', '50', '100'],
        );
        await checkAxe();
        observe();
      };
      await check(1, 10);
      screen.getByRole('button', { name: l.next }).focus();
      await user.keyboard('{Enter}');
      await check(11, 20);
      expect(onPageChange).toHaveBeenLastCalledWith(2);
      await user.click(screen.getByRole('button', { name: l.previous }));
      await check(1, 10);
      expect(onPageChange).toHaveBeenLastCalledWith(1);
      await user.click(screen.getByRole('button', { name: l.page(3) }));
      await check(21, 30);
      expect(onPageChange).toHaveBeenLastCalledWith(3);
      await user.click(screen.getByRole('combobox', { name: l.rowsPerPage }));
      await screen.findByRole('option', { name: '25' });
      await check(21, 30);
      await user.click(screen.getByRole('option', { name: '25' }));
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      await check(1, 25);
      expect(onPageSizeChange).toHaveBeenLastCalledWith(25);
      expect(onPageChange).toHaveBeenLastCalledWith(1);
      if (mode !== 'default') {
        rerender(<PaginationFooter total={0} labels={{ ...l, rangeSummary }} />);
        expect(rangeSummary).toHaveBeenLastCalledWith(0, 0, 0);
      } else {
        rerender(<PaginationFooter total={0} />);
        expect(document.querySelector('[aria-live]')?.textContent).toBe('0–0 of 0');
        await checkAxe();
        observe();
      }
      if (mode === 'default')
        await expect(
          [...states, { callbacks: { page: onPageChange.mock.calls, size: onPageSizeChange.mock.calls } }]
            .map((state) => JSON.stringify(state))
            .join('\n') + '\n',
        ).toMatchFileSnapshot(`../__tests__/baselines/dde54ce-pagination-${theme}.jsonl`);
    }, 120000);
  }

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';
import { defaultFilterBarLabels, filterLabels } from '../__tests__/labels-fixtures';
import { assertInventory, baseline, checkAxe, themes } from '../__tests__/matrix';

for (const mode of ['default', 'en', 'es'] as const)
  for (const theme of themes) {
    it(`all filter states: ${mode}/${theme}`, async () => {
      document.documentElement.className = theme;
      const user = userEvent.setup();
      const states: ReturnType<typeof baseline>[] = [];
      const observe = () => {
        if (mode === 'default') states.push(baseline());
      };
      const l = mode === 'default' ? defaultFilterBarLabels : filterLabels[mode];
      const resultCount = vi.fn(l.resultCount);
      const removeFilter = vi.fn(l.removeFilter);
      const onFiltersChange = vi.fn();
      const onQueryChange = vi.fn();
      const onViewChange = vi.fn();
      const props = {
        fields: [{ id: 'kind', label: 'Kind', options: ['A', 'B'] }],
        defaultFilters: [],
        views: [{ value: 'a', label: 'Choice A', filters: [{ field: 'kind', value: 'A' }] }],
        onFiltersChange,
        onQueryChange,
        onViewChange,
        labels: mode === 'default' ? undefined : { ...l, resultCount, removeFilter },
      };
      const { rerender } = render(<FilterBar {...props} resultCount={1} />);
      const check = async (count = 1) => {
        expect(screen.getByRole('search', { name: l.region })).toBeInTheDocument();
        expect(screen.getByRole('searchbox', { name: l.search })).toHaveAttribute('placeholder', l.placeholder);
        expect(screen.getByRole('combobox', { name: l.savedView })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: l.addFilter })).toHaveTextContent(l.addFilter);
        expect(document.querySelector('[aria-live]')?.textContent).toBe(
          mode === 'default' && count === 1234 ? '1,234 results' : l.resultCount(count),
        );
        if (mode !== 'default') expect(resultCount).toHaveBeenLastCalledWith(count);
        if (screen.queryByRole('list')) {
          expect(screen.getByRole('list', { name: l.activeFilters })).toBeInTheDocument();
          expect(screen.getByText(l.filters)).toBeInTheDocument();
          expect(screen.getByRole('button', { name: l.clearAll })).toHaveTextContent(l.clearAll);
          for (const button of screen
            .getAllByRole('button')
            .filter(
              (element) =>
                element.parentElement?.hasAttribute('data-token-remove') ||
                element
                  .getAttribute('aria-label')
                  ?.startsWith(mode === 'es' ? 'Quitar ' : mode === 'en' ? 'Custom Remove filter ' : 'Remove filter '),
            )) {
            const value = button.getAttribute('aria-label')?.endsWith('B') ? 'B' : 'A';
            expect(button).toHaveAccessibleName(l.removeFilter('Kind', value));
          }
        }
        assertInventory(
          [
            l.region,
            l.search,
            l.placeholder,
            l.savedView,
            l.savedViews,
            l.addFilter,
            l.activeFilters,
            l.filters,
            l.clearAll,
            l.removeFilter('Kind', 'A'),
            l.removeFilter('Kind', 'B'),
            l.resultCount(count),
            ...(mode === 'default'
              ? [count === 1234 ? '1,234' : String(count), count === 1 ? 'result' : 'results']
              : []),
          ],
          ['Kind', 'Kind:', 'A', 'B', 'Choice A'],
        );
        await checkAxe();
        observe();
      };
      await check();
      expect(screen.getByRole('combobox', { name: l.savedView })).toHaveTextContent(l.savedViews);
      await user.click(screen.getByRole('combobox', { name: l.savedView }));
      await screen.findByRole('option', { name: 'Choice A' });
      await check();
      await user.click(screen.getByRole('option', { name: 'Choice A' }));
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      await check();
      expect(onViewChange).toHaveBeenCalledWith(props.views[0]);
      await user.click(screen.getByRole('button', { name: l.addFilter }));
      await screen.findByRole('menuitemcheckbox', { name: 'B' });
      await check();
      await user.click(screen.getByRole('menuitemcheckbox', { name: 'B' }));
      await check();
      expect(onFiltersChange).toHaveBeenLastCalledWith([
        { field: 'kind', value: 'A' },
        { field: 'kind', value: 'B' },
      ]);
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
      const remove = screen.getByRole('button', { name: l.removeFilter('Kind', 'B') });
      if (mode !== 'default') expect(removeFilter).toHaveBeenCalledWith('Kind', 'B');
      remove.focus();
      expect(remove).toHaveFocus();
      await check();
      await user.keyboard('{Enter}');
      await check();
      expect(onFiltersChange).toHaveBeenLastCalledWith([{ field: 'kind', value: 'A' }]);
      await user.type(screen.getByRole('searchbox', { name: l.search }), 'query');
      await user.click(screen.getByRole('button', { name: l.clearAll }));
      await check();
      expect(onFiltersChange).toHaveBeenLastCalledWith([]);
      expect(onQueryChange).toHaveBeenLastCalledWith('');
      expect(screen.queryByRole('list')).toBeNull();
      rerender(<FilterBar {...props} resultCount={1234} />);
      await check(1234);
      if (mode === 'default')
        await expect(
          [
            ...states,
            {
              callbacks: {
                filters: onFiltersChange.mock.calls,
                query: onQueryChange.mock.calls,
                view: onViewChange.mock.calls,
              },
            },
          ]
            .map((state) => JSON.stringify(state))
            .join('\n') + '\n',
        ).toMatchFileSnapshot(`../__tests__/baselines/dde54ce-filters-${theme}.jsonl`);
    }, 120000);
  }

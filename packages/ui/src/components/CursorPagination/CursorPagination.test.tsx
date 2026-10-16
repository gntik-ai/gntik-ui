import { render, screen, waitFor } from '@testing-library/react';
import { I18nProvider } from '../../i18n/I18nProvider';
import userEvent from '@testing-library/user-event';
import { CursorPagination } from './CursorPagination';

function propContract() {
  // @ts-expect-error the availability mode is a closed union
  <CursorPagination {...base} unavailableBehaviour="removed" />;
  // @ts-expect-error loadingLabel accepts only string or null
  <CursorPagination {...base} loadingLabel={42} />;
  // @ts-expect-error loadingLabel does not accept markup
  <CursorPagination {...base} loadingLabel={<span>Loading</span>} />;
  // @ts-expect-error count-form labels are required
  <CursorPagination hasPrevious hasNext onPrevious={() => {}} onNext={() => {}} shownCount={25} />;
  // @ts-expect-error select labels are required when options are given
  <CursorPagination {...base} pageSizeOptions={[10, 25]} pageSize={10} onPageSizeChange={() => {}} />;
}
void propContract;

const base = {
  hasPrevious: true,
  hasNext: true,
  onPrevious: vi.fn(),
  onNext: vi.fn(),
  summary: '25 records loaded',
};

describe('CursorPagination', () => {
  it('renders the optional select, keeps it enabled while busy and emits a numeric page size via keyboard', async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    const { rerender } = render(<CursorPagination {...base} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    rerender(
      <CursorPagination
        {...base}
        busy
        pageSize={10}
        pageSizeOptions={[10, 25, 50]}
        onPageSizeChange={onPageSizeChange}
        labels={{ rowsPerPage: 'Rows per response', rowsPerPageLabel: 'Choose response size' }}
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Choose response size' });
    expect(screen.getByText('Rows per response')).toBeVisible();
    expect(select).toBeEnabled();
    expect(select).not.toHaveAttribute('aria-busy');
    await user.tab();
    expect(select).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveFocus();
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(select).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('option', { name: '25' })).toHaveAttribute('data-highlighted'));
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(screen.getByRole('option', { name: '10' })).toHaveAttribute('data-highlighted'));
    await user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(onPageSizeChange).toHaveBeenCalledExactlyOnceWith(25);
    expect(select).toHaveFocus();
    await user.keyboard(' ');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(select).toHaveFocus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(select).toHaveFocus();
  });

  it('restores focus when the removed select owns focus in its open popup', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CursorPagination
        {...base}
        pageSize={10}
        pageSizeOptions={[10, 25]}
        onPageSizeChange={vi.fn()}
        labels={{ rowsPerPage: 'Rows', rowsPerPageLabel: 'Response size' }}
      />,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    rerender(<CursorPagination {...base} busy />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next page' })).toHaveFocus());
  });

  it.each(['next', 'previous', 'root'] as const)(
    'restores a removed focused select to %s, including while busy',
    (target) => {
      const { rerender } = render(
        <CursorPagination
          {...base}
          unavailableBehaviour="hidden"
          busy
          hasNext={target === 'next'}
          hasPrevious={target === 'previous'}
          pageSize={10}
          pageSizeOptions={[10, 25]}
          onPageSizeChange={vi.fn()}
          labels={{ rowsPerPage: 'Rows', rowsPerPageLabel: 'Response size' }}
        />,
      );
      screen.getByRole('combobox').focus();
      rerender(
        <CursorPagination
          {...base}
          unavailableBehaviour="hidden"
          busy
          hasNext={target === 'next'}
          hasPrevious={target === 'previous'}
        />,
      );
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      expect(
        target === 'root'
          ? screen.getByRole('navigation')
          : screen.getByRole('button', {
              name: target === 'next' ? 'Next page' : 'Previous page',
            }),
      ).toHaveFocus();
    },
  );

  it('uses the select when the last focused navigation control is hidden and retains select focus on other updates', () => {
    const size = {
      pageSize: 10,
      pageSizeOptions: [10, 25],
      onPageSizeChange: vi.fn(),
      labels: { rowsPerPage: 'Rows', rowsPerPageLabel: 'Response size' },
    };
    const { rerender } = render(
      <CursorPagination {...base} {...size} unavailableBehaviour="hidden" hasPrevious={false} />,
    );
    screen.getByRole('button', { name: 'Next page' }).focus();
    rerender(
      <CursorPagination {...base} {...size} unavailableBehaviour="hidden" hasPrevious={false} hasNext={false} busy />,
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveFocus();
    rerender(<CursorPagination {...base} {...size} unavailableBehaviour="hidden" busy />);
    expect(select).toHaveFocus();
  });

  it.each([
    [97, '97 records in total'],
    [null, '25 records shown'],
    [undefined, '25 records shown'],
    [0, '25 records shown'],
    [-1, '25 records shown'],
  ])('uses only the consumer exact total or response count (total=%s)', (total, expected) => {
    const { summary: _summary, ...navigation } = base;
    void _summary;
    render(
      <CursorPagination
        {...navigation}
        shownCount={25}
        total={total}
        labels={{
          shownSummary: (count) => `${count} records shown`,
          totalSummary: (count) => `${count} records in total`,
        }}
      />,
    );
    expect(screen.getByRole('status').textContent).toBe(expected);
    expect(screen.queryByText(/1[–-]25|page \d|of 97/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it.each([false, true])(
    'moves a removed focused Next to Previous, then to the root, even with busy=%s',
    async (busy) => {
      const user = userEvent.setup();
      const { rerender } = render(<CursorPagination {...base} unavailableBehaviour="hidden" />);
      await user.tab();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Next page' })).toHaveFocus();
      rerender(<CursorPagination {...base} unavailableBehaviour="hidden" hasNext={false} busy={busy} />);
      expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous page' })).toHaveFocus();
      rerender(
        <CursorPagination {...base} unavailableBehaviour="hidden" hasNext={false} hasPrevious={false} busy={busy} />,
      );
      expect(screen.getByRole('navigation')).toHaveFocus();
      expect(screen.getByRole('navigation')).toHaveAttribute('tabindex', '-1');
      expect(document.body).not.toHaveFocus();
    },
  );

  it('prefers Next when Previous is removed and does not move focus outside or off a retained control', async () => {
    const user = userEvent.setup();
    const view = (hasPrevious: boolean, hasNext: boolean, busy = false) => (
      <>
        <button>Outside</button>
        <CursorPagination
          {...base}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          busy={busy}
          unavailableBehaviour="hidden"
        />
      </>
    );
    const { rerender } = render(view(true, true));
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    rerender(view(false, false, true));
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
    rerender(view(true, true));
    await user.tab();
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveFocus();
    rerender(view(false, true, true));
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveFocus();
    rerender(view(true, true));
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveFocus();
  });

  it('mounts the empty b002 region without text writes and retains it through busy and unchanged commits', async () => {
    const records: MutationRecord[] = [];
    const observer = new MutationObserver((batch) => records.push(...batch));
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    const { rerender, unmount } = render(<CursorPagination {...base} summary={null} loadingLabel={null} />);
    const status = screen.getByRole('status');
    await Promise.resolve();
    for (const busy of [true, true, false, false]) {
      rerender(<CursorPagination {...base} summary={null} loadingLabel={null} busy={busy} />);
      await Promise.resolve();
      expect(screen.getByRole('status')).toBe(status);
      expect(status).toBeEmptyDOMElement();
    }
    expect(records.filter((record) => record.target === status || status.contains(record.target))).toHaveLength(0);
    observer.disconnect();
    unmount();
    expect(status).not.toBeInTheDocument();
  });

  it('keeps focus when a rendered control becomes unavailable in disabled mode', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CursorPagination {...base} />);
    await user.tab();
    await user.tab();
    const next = screen.getByRole('button', { name: 'Next page' });
    expect(next).toHaveFocus();
    rerender(<CursorPagination {...base} hasNext={false} />);
    expect(next).toHaveFocus();
    expect(next).toHaveAttribute('aria-disabled', 'true');
  });

  it('updates the persistent status exactly once per changed text and never for unchanged commits', async () => {
    const { rerender } = render(<CursorPagination {...base} summary="Summary A" />);
    const status = screen.getByRole('status');
    const changes = vi.fn();
    const observer = new MutationObserver(changes);
    observer.observe(status, { childList: true, characterData: true, subtree: true });
    await Promise.resolve();
    expect(changes).not.toHaveBeenCalled();
    for (const [props, expected, mutations] of [
      [{ summary: 'Summary A' }, 'Summary A', 0],
      [{ summary: 'Summary A', busy: true }, 'Loading…', 1],
      [{ summary: 'Summary A', loading: true }, 'Loading…', 0],
      [{ summary: 'Summary B' }, 'Summary B', 1],
      [
        {
          summary: (
            <>
              {'Summary '}
              {'C'}
            </>
          ),
        },
        'Summary C',
        1,
      ],
      [
        {
          summary: (
            <>
              {'Summary '}
              {'C'}
            </>
          ),
        },
        'Summary C',
        0,
      ],
      [{ summary: null }, '', 1],
      [{ summary: null, busy: true, loadingLabel: null }, '', 0],
      [{ summary: null, loadingLabel: null }, '', 0],
      [{ summary: null, busy: true }, 'Loading…', 1],
      [{ summary: null, busy: true, loadingLabel: 'Fetching records' }, 'Fetching records', 1],
      [{ summary: 'Still visible', busy: true, loadingLabel: null }, 'Still visible', 1],
    ] as const) {
      changes.mockClear();
      rerender(<CursorPagination {...base} {...props} />);
      await Promise.resolve();
      expect(screen.getByRole('status')).toBe(status);
      expect(status.textContent).toBe(expected);
      expect(changes).toHaveBeenCalledTimes(mutations);
      if (mutations) expect(changes.mock.calls[0]?.[0]).toHaveLength(1);
    }
    observer.disconnect();
  });

  it.each([
    ['en', 'Pagination', 'Previous page', 'Next page', 'Loading…'],
    ['es', 'Paginación', 'Página anterior', 'Página siguiente', 'Cargando…'],
  ])('resolves flat labels before labels members before the %s catalog', (locale, nav, previous, next, loading) => {
    const { rerender } = render(
      <I18nProvider locale={locale}>
        <CursorPagination {...base} busy />
      </I18nProvider>,
    );
    expect(screen.getByRole('navigation', { name: nav })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: previous })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: next })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(loading);
    for (const flat of [false, true]) {
      for (const nested of [false, true]) {
        rerender(
          <I18nProvider locale={locale}>
            <CursorPagination
              {...base}
              {...(flat ? { ariaLabel: 'Flat nav', previousLabel: 'Flat previous', nextLabel: 'Flat next' } : {})}
              labels={nested ? { navLabel: 'Nested nav', previous: 'Nested previous', next: 'Nested next' } : undefined}
            />
          </I18nProvider>,
        );
        expect(
          screen.getByRole('navigation', { name: flat ? 'Flat nav' : nested ? 'Nested nav' : nav }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: flat ? 'Flat previous' : nested ? 'Nested previous' : previous }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: flat ? 'Flat next' : nested ? 'Nested next' : next }),
        ).toBeInTheDocument();
      }
    }
  });

  it.each(['loading', 'busy'] as const)(
    '%s keeps focus on Next and blocks click, Enter and Space on both controls',
    async (flag) => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      const onPrevious = vi.fn();
      const onNext = vi.fn();
      const props = { ...base, onPrevious, onNext };
      const { rerender } = render(<CursorPagination {...props} />);
      await user.tab();
      await user.tab();
      const next = screen.getByRole('button', { name: 'Next page' });
      expect(next).toHaveFocus();
      rerender(<CursorPagination {...props} {...{ [flag]: true }} />);
      expect(next).toHaveFocus();
      expect(screen.getByRole('navigation')).not.toHaveAttribute('aria-busy');
      for (const button of screen.getAllByRole('button')) {
        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(button).toHaveAttribute('aria-busy', 'true');
        expect(button).not.toHaveAttribute('disabled');
        await user.click(button);
        await user.keyboard('{Enter} ');
      }
      expect(onPrevious).not.toHaveBeenCalled();
      expect(onNext).not.toHaveBeenCalled();
    },
  );

  it('keeps unavailable controls in forward and reverse Tab order without activating them', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(<CursorPagination {...base} hasPrevious={false} hasNext={false} onPrevious={onPrevious} onNext={onNext} />);
    const previous = screen.getByRole('button', { name: 'Previous page' });
    const next = screen.getByRole('button', { name: 'Next page' });
    await user.tab();
    expect(previous).toHaveFocus();
    await user.keyboard('{Enter} ');
    await user.tab();
    expect(next).toHaveFocus();
    await user.keyboard('{Enter} ');
    await user.tab({ shift: true });
    expect(previous).toHaveFocus();
    await user.click(previous);
    await user.click(next);
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(onPrevious).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('names the navigation, keeps one status and emits once per click, Enter and Space without owning state', async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(<CursorPagination {...base} onPrevious={onPrevious} onNext={onNext} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).not.toHaveAttribute('aria-busy');
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('25 records loaded');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
    for (const [name, handler] of [
      ['Previous page', onPrevious],
      ['Next page', onNext],
    ] as const) {
      await user.click(screen.getByRole('button', { name }));
      expect(handler).toHaveBeenCalledTimes(1);
      await user.keyboard('{Enter}');
      expect(handler).toHaveBeenCalledTimes(2);
      await user.keyboard(' ');
      expect(handler).toHaveBeenCalledTimes(3);
    }
    expect(screen.getByRole('status')).toHaveTextContent('25 records loaded');
  });
});

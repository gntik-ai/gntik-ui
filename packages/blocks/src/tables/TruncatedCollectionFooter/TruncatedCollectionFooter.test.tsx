import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@gntik-ai/ui';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { TruncatedCollectionFooter, type TruncatedCollectionFooterProps } from './TruncatedCollectionFooter';
import ExactExample from './examples/exact';
import HasMoreExample from './examples/has-more';

// Compile-time checks of the public presentation-only contract.
function propContract() {
  // @ts-expect-error visibleCount and hasMore are required for consumers
  <TruncatedCollectionFooter />;
  // @ts-expect-error no total is accepted
  <TruncatedCollectionFooter visibleCount={37} hasMore={false} total={97} />;
  // @ts-expect-error no page count is accepted
  <TruncatedCollectionFooter visibleCount={37} hasMore={false} pageCount={10} />;
  // @ts-expect-error no current page is accepted
  <TruncatedCollectionFooter visibleCount={37} hasMore={false} page={1} />;
  // @ts-expect-error no navigation handlers are accepted
  <TruncatedCollectionFooter visibleCount={37} hasMore={false} onPageChange={() => {}} />;
  // @ts-expect-error no event handlers are accepted
  <TruncatedCollectionFooter visibleCount={37} hasMore={false} onClick={() => {}} />;
}
void propContract;

describe('TruncatedCollectionFooter', () => {
  it('shows the exact loaded count without a truncation note', () => {
    const { container } = render(<TruncatedCollectionFooter visibleCount={37} hasMore={false} />);
    expect(screen.getByText('37', { exact: true })).toBeVisible();
    expect(container).not.toHaveTextContent('+');
    expect(screen.queryByText(/Only the first/)).not.toBeInTheDocument();
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });

  it('shows a lower bound and a readable, linkable truncation note', () => {
    const { container } = render(<TruncatedCollectionFooter visibleCount={100} hasMore={true} noteId="loaded-note" />);
    expect(screen.getByText('100+', { exact: true })).toBeVisible();
    expect(screen.getByText('items:')).toBeVisible();
    const note = screen.getByText('Only the first 100 items are shown; more exist.');
    expect(note).toHaveAttribute('id', 'loaded-note');
    expect(container.querySelector('[aria-hidden], [aria-live]')).toBeNull();
  });

  it('lets consumers replace every visible string with plain text nodes', () => {
    const { container } = render(
      <TruncatedCollectionFooter
        visibleCount={100}
        hasMore={true}
        summaryLabel="Loaded records"
        formatCount={(count, hasMore) => <span>{hasMore ? `At least ${count}` : `Exactly ${count}`}</span>}
        truncationNote={(count) => <span>{`Showing ${count} records from the first page.`}</span>}
        className="gap-2.5"
      />,
    );
    expect(screen.getByText('Loaded records')).toBeVisible();
    expect(screen.getByText('At least 100')).toBeVisible();
    expect(screen.getByText('Showing 100 records from the first page.')).toBeVisible();
    expect(container).not.toHaveTextContent('items:');
    expect(container).not.toHaveTextContent('Only the first');
    expect(container.firstElementChild).toHaveClass('gap-2.5');
  });

  it('formats counts in the chosen locale and uses the supplied noun', () => {
    render(<TruncatedCollectionFooter visibleCount={12345} hasMore={true} noun="records" locale="de-DE" />);
    expect(screen.getByText('12.345+', { exact: true })).toBeVisible();
    expect(screen.getByText('records:')).toBeVisible();
    expect(screen.getByText('Only the first 12.345 records are shown; more exist.')).toBeVisible();
  });

  it('inherits Spanish defaults and number formatting from the provider', () => {
    render(
      <I18nProvider locale="es">
        <TruncatedCollectionFooter visibleCount={12345} hasMore={true} />
      </I18nProvider>,
    );
    expect(screen.getByText('12.345+', { exact: true })).toBeVisible();
    expect(screen.getByText('elementos:')).toBeVisible();
    expect(screen.getByText('Solo se muestran los primeros 12.345 elementos; hay más.')).toBeVisible();
  });

  it('renders a meaningful no-props catalogue preview at runtime', () => {
    // The JavaScript preview loader passes no props; consumers still require both inputs.
    render(<TruncatedCollectionFooter {...({} as TruncatedCollectionFooterProps)} />);
    expect(screen.getByText('37', { exact: true })).toBeVisible();
    expect(screen.getByText('items:')).toBeVisible();
    expect(screen.queryByText(/Only the first/)).not.toBeInTheDocument();
  });

  it('accepts a static note and an empty label without restoring default copy', () => {
    render(
      <TruncatedCollectionFooter
        visibleCount={100}
        hasMore={true}
        summaryLabel={null}
        truncationNote="More records exist outside this view."
      />,
    );
    expect(screen.getByText('More records exist outside this view.')).toBeVisible();
    expect(screen.queryByText('items:')).not.toBeInTheDocument();
  });

  it('does not render or evaluate the note when the loaded count is exact', () => {
    const { container } = render(
      <TruncatedCollectionFooter
        visibleCount={37}
        hasMore={false}
        formatCount={(count, hasMore) => `${count}${hasMore ? ' or more' : ' exact'}`}
        truncationNote={() => {
          throw new Error('The exact state must not evaluate its note');
        }}
        noteId="absent-note"
      />,
    );
    expect(screen.getByText('37 exact')).toBeVisible();
    expect(container.querySelector('#absent-note')).toBeNull();
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });

  it.each([
    ['en', 'item:', 'Only the first 1 item is shown; more exist.'],
    ['es', 'elemento:', 'Solo se muestra el primer 1 elemento; hay más.'],
  ])('uses singular catalogue defaults in %s', (locale, label, note) => {
    render(
      <I18nProvider locale={locale}>
        <TruncatedCollectionFooter visibleCount={1} hasMore={true} />
      </I18nProvider>,
    );
    expect(screen.getByText(label)).toBeVisible();
    expect(screen.getByText(note)).toBeVisible();
  });

  it.each([true, false])('has no controls, navigation or Tab stops with hasMore=%s', async (hasMore) => {
    const user = userEvent.setup();
    const { container } = render(<TruncatedCollectionFooter visibleCount={100} hasMore={hasMore} />);
    for (const role of ['navigation', 'button', 'link', 'combobox', 'textbox']) {
      expect(screen.queryAllByRole(role)).toHaveLength(0);
    }
    expect(container.querySelector('button, a, input, select, textarea, [tabindex], [contenteditable]')).toBeNull();
    expect(container.querySelector('[aria-hidden], [aria-live]')).toBeNull();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  for (const theme of ['dark', 'light', 'high_contrast']) {
    it.each([
      ['exact', ExactExample],
      ['has-more', HasMoreExample],
    ] as const)(`has no axe violations in ${theme} / %s`, async (_state, Example) => {
      const previousTheme = document.documentElement.className;
      document.documentElement.className = theme;
      try {
        const { container } = render(<Example />);
        await expectNoAxeViolations(container);
      } finally {
        document.documentElement.className = previousTheme;
      }
    });
  }
});

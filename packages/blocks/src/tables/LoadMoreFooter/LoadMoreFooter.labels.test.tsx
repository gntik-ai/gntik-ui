import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@gntik-ai/ui';
import { LoadMoreFooter, type LoadMoreFooterProps } from './LoadMoreFooter';
import { expectNoAxeViolations } from '../../test/a11y';

describe('LoadMoreFooter copy and accessibility', () => {
  it('inherits Spanish defaults, including retry, summary and append announcements', () => {
    const wrap = (props: LoadMoreFooterProps) => (
      <I18nProvider locale="es">
        <LoadMoreFooter {...props} />
      </I18nProvider>
    );
    const { container, rerender } = render(wrap({ hasMore: true, loadedCount: 3 }));
    expect(screen.getByRole('group', { name: 'Cargar más elementos' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cargar más' })).toBeVisible();
    expect(screen.getByText(/3 elementos cargados/)).toBeVisible();
    expect(screen.getByText('Hay más elementos disponibles.')).toBeVisible();
    rerender(wrap({ hasMore: true, loading: true }));
    expect(screen.getByRole('button', { name: 'Cargando…' })).toBeVisible();
    rerender(wrap({ hasMore: true, error: 'E1' }));
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeVisible();
    rerender(wrap({ hasMore: true, lastAppend: { seq: 1, count: 2 } }));
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('2 elementos añadidos.');
  });

  it('uses every supplied label exactly and preserves empty overrides', () => {
    const labels = {
      loadMore: 'Fetch again',
      loading: 'Fetching records',
      retry: 'Repeat request',
      group: 'Records footer',
      moreAvailable: 'Another batch exists',
      summary: (n: number) => `Seen ${n}`,
      loadedAnnouncement: (n: number) => `Appended ${n}`,
    };
    const wrap = (props: LoadMoreFooterProps) => (
      <I18nProvider locale="es">
        <LoadMoreFooter hasMore labels={labels} {...props} />
      </I18nProvider>
    );
    const { container, rerender } = render(wrap({ loadedCount: 7 }));
    expect(screen.getByRole('group', { name: 'Records footer' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Fetch again' })).toBeVisible();
    expect(screen.getByText(/Seen 7/)).toBeVisible();
    expect(screen.getByText('Another batch exists')).toBeVisible();
    rerender(wrap({ loading: true }));
    expect(screen.getByRole('button', { name: 'Fetching records' })).toBeVisible();
    rerender(wrap({ error: 'E1' }));
    expect(screen.getByRole('button', { name: 'Repeat request' })).toBeVisible();
    rerender(wrap({ lastAppend: { seq: 1, count: 4 } }));
    expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe('Appended 4');
    rerender(wrap({ labels: { ...labels, moreAvailable: '', summary: () => '' } }));
    expect(screen.queryByText('Another batch exists')).toBeNull();
    expect(screen.queryByText(/elementos cargados/)).toBeNull();
  });

  for (const theme of ['dark', 'light', 'high_contrast']) {
    it.each([
      { nextCursor: 'c1' },
      { nextCursor: 'c1', loading: true },
      { nextCursor: 'c1', error: 'Request failed' },
      { hasMore: true, error: 'Request failed' },
      { nextCursor: null, error: 'Request failed' },
      { hasMore: false },
    ])(`has no axe violations in ${theme} with %j`, async (props) => {
      document.documentElement.className = theme;
      const { container } = render(<LoadMoreFooter {...props} />);
      await expectNoAxeViolations(container);
    });
  }
});

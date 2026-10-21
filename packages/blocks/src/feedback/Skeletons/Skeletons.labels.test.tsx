import { render, screen } from '@testing-library/react';
import { I18nProvider, es } from '@gntik-ai/ui';
import { ListSkeleton, PageSkeleton, TableSkeleton } from './Skeletons';

it.each([
  [TableSkeleton, 'loading.table', 'Loading table'],
  [ListSkeleton, 'loading.list', 'Loading list'],
  [PageSkeleton, 'loading.page', 'Loading page'],
] as const)('audits catalog and explicit loading labels for %s', (Skeleton, key, english) => {
  const { rerender } = render(<Skeleton />);
  expect(screen.getByRole('status').textContent).toBe(english);
  rerender(
    <I18nProvider locale="es">
      <Skeleton />
    </I18nProvider>,
  );
  expect(screen.getByRole('status').textContent).toBe(es[key]);
  rerender(
    <I18nProvider locale="es">
      <Skeleton label="Caller loading text" />
    </I18nProvider>,
  );
  expect(screen.getByRole('status').textContent).toBe('Caller loading text');
});

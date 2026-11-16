import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UrlPagination from './examples/url-pagination';
import { expectNoAxeViolations } from '../../test/a11y';
import WithoutPageSize from '../PaginationFooter/examples/without-page-size';

afterEach(() => {
  history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

it('restores URL pages and sizes on popstate and writes one history entry per action', async () => {
  const user = userEvent.setup();
  history.replaceState(null, '', '/?page=3&pageSize=10');
  const push = vi.spyOn(history, 'pushState');
  render(<UrlPagination />);
  expect(screen.getByText('21–30')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByText('31–40')).toBeInTheDocument();
  expect(new URLSearchParams(location.search).get('page')).toBe('4');
  await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
  await user.click(await screen.findByRole('option', { name: '25' }));
  expect(screen.getByText('26–50')).toBeInTheDocument();
  expect(new URLSearchParams(location.search).get('page')).toBe('2');
  expect(new URLSearchParams(location.search).get('pageSize')).toBe('25');
  expect(push).toHaveBeenCalledTimes(2);
  history.replaceState(null, '', '/?page=3&pageSize=10');
  fireEvent(window, new PopStateEvent('popstate'));
  expect(screen.getByText('21–30')).toBeInTheDocument();
  expect(push).toHaveBeenCalledTimes(2);
});

it.each(['dark', 'light', 'high_contrast'])('pagination examples have accessible structure in %s', async (theme) => {
  document.documentElement.className = theme;
  const { container } = render(
    <>
      <UrlPagination />
      <WithoutPageSize />
    </>,
  );
  await expectNoAxeViolations(container);
});

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Pagination } from './Pagination';
import { getPageRange } from './pageRange';
import PaginationNumbered from './examples/PaginationNumbered';
import PaginationTableFooter from './examples/PaginationTableFooter';

function Controlled({ initial = 1, pageCount = 10 }: { initial?: number; pageCount?: number }) {
  const [page, setPage] = useState(initial);
  return <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />;
}

describe('getPageRange', () => {
  it('lists every page when they fit', () => {
    expect(getPageRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageRange(1, 0)).toEqual([]);
  });
  it('adds ellipses around the current page and keeps a constant length', () => {
    expect(getPageRange(1, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 10]);
    expect(getPageRange(4, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 10]);
    expect(getPageRange(5, 10)).toEqual([1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10]);
    expect(getPageRange(10, 10)).toEqual([1, 'ellipsis-start', 6, 7, 8, 9, 10]);
    expect(getPageRange(20, 42, 2)).toHaveLength(9);
  });
});

describe('Pagination', () => {
  it('is a labelled nav; the current page has aria-current and edges disable the arrows', () => {
    render(<Controlled />);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(within(nav).getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(within(nav).getByRole('button', { name: 'Next page' })).toBeEnabled();
  });

  it('Tab reaches every enabled control in order', async () => {
    const user = userEvent.setup();
    render(<Controlled initial={5} />);
    const order = ['Previous page', 'Page 1', 'Page 4', 'Page 5', 'Page 6', 'Page 10', 'Next page'];
    for (const name of order) {
      await user.tab();
      expect(screen.getByRole('button', { name })).toHaveFocus();
    }
  });

  it('Enter / Space activate the focused control', async () => {
    const user = userEvent.setup();
    render(<Controlled initial={5} />);
    screen.getByRole('button', { name: 'Page 6' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Page 6' })).toHaveAttribute('aria-current', 'page');
    screen.getByRole('button', { name: 'Next page' }).focus();
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Page 7' })).toHaveAttribute('aria-current', 'page');
    screen.getByRole('button', { name: 'Previous page' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Page 6' })).toHaveAttribute('aria-current', 'page');
  });

  it('does not call onPageChange for the current page', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination page={3} pageCount={5} onPageChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Page 5' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('compact variant shows the range and pages with the arrows', async () => {
    const user = userEvent.setup();
    render(<PaginationTableFooter />);
    const nav = screen.getByRole('navigation', { name: 'Deployments pagination' });
    expect(nav).toHaveTextContent('1–10 of 97');
    await user.click(within(nav).getByRole('button', { name: 'Next page' }));
    expect(nav).toHaveTextContent('11–20 of 97');
    for (let i = 0; i < 9; i++) await user.click(within(nav).getByRole('button', { name: 'Next page' }));
    expect(nav).toHaveTextContent('91–97 of 97');
    expect(within(nav).getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('examples have no axe violations', async () => {
    render(<><PaginationNumbered /><PaginationTableFooter /></>);
    await expectNoAxeViolations();
  });
});

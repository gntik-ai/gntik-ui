import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../../test/a11y';
import QuickFilterExample from './examples/quick-filter';

afterEach(() => vi.useRealTimers());

describe('DataTable quick filter example', () => {
  it('searches the client table by owner email, a hidden opted-in column and an accent-free term', () => {
    vi.useFakeTimers();
    render(<QuickFilterExample />);
    const field = screen.getByRole('searchbox', { name: 'Search Deployments' });
    // The first status belongs to the client table; the others to the collapsed and the server one.
    const status = () => screen.getAllByRole('status')[0]!.textContent;
    for (const [text, expected] of [
      ['ana@example.test', '6 rows match'],
      ['funcion', '3 rows match'],
      ['gold', '9 rows match'],
      ['eu-west gold', '3 rows match'],
      // Requests opt out of the search.
      ['1237', ''],
    ] as const) {
      fireEvent.change(field, { target: { value: text } });
      act(() => void vi.advanceTimersByTime(300));
      expect(status()).toBe(expected === '' ? '0 rows match' : expected);
    }
  });

  it('starts the second table as a collapsed search button', () => {
    render(<QuickFilterExample />);
    expect(screen.getByRole('button', { name: 'Search Releases' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('has no axe violations', async () => {
    const { container } = render(<QuickFilterExample />);
    await expectNoAxeViolations(container);
  });
});

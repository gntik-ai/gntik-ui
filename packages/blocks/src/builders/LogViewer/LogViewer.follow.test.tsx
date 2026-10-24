import { act, fireEvent, render, screen } from '@testing-library/react';
import { LogViewer } from './LogViewer';
import { makeLogLines } from './fixtures';

afterEach(() => vi.restoreAllMocks());

it('preserves an upward scroll when row measurement commits before the browser scroll event', () => {
  let rowHeight = 24;
  const rect = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const result = rect.call(this);
    return this.matches('[data-slot="log-line"]') ? { ...result, height: rowHeight } : result;
  });
  const lines = makeLogLines(40);
  const view = render(<LogViewer lines={lines} wrap height={240} />);
  const log = screen.getByRole('log');
  const follow = screen.getByRole('switch', { name: 'Follow' });
  expect(log.scrollTop).toBeGreaterThan(0);
  expect(follow).toBeChecked();

  // The browser changes scrollTop immediately, but dispatches scroll later.
  log.scrollTop = 0;
  rowHeight = 48;
  act(() => view.rerender(<LogViewer lines={lines} wrap height={240} />));
  fireEvent.scroll(log);

  expect(follow).not.toBeChecked();
  expect(log.scrollTop).toBe(0);
});

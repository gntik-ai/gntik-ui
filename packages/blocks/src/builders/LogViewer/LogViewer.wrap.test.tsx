import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { LogViewer } from './LogViewer';
import { makeLogLines } from './fixtures';

afterEach(() => vi.unstubAllGlobals());
afterEach(() => vi.restoreAllMocks());

it('preserves the fixed row attributes and English names with wrap unset or false', () => {
  const lines = makeLogLines(20);
  const { rerender } = render(<LogViewer lines={lines} />);
  const attributes = () =>
    [...screen.getByRole('log').querySelectorAll('[data-slot="log-line"]')].map((row) => ({
      className: row.className,
      style: row.getAttribute('style'),
      chip: row.children[1]!.textContent,
    }));
  const original = attributes();
  expect(original).toHaveLength(20);
  expect(original[0]).toEqual({
    className: 'group absolute inset-x-0 flex items-center gap-2.5 px-3 hover:bg-secondary/50',
    style: 'top: 0px; height: 24px;',
    chip: 'INFO',
  });
  expect(original[19]!.style).toBe('top: 456px; height: 24px;');
  expect(original.map((row) => row.chip)).toEqual([
    'INFO',
    'DEBUG',
    'INFO',
    'WARN',
    'INFO',
    'ERROR',
    'INFO',
    'DEBUG',
    'WARN',
    'INFO',
    'INFO',
    'DEBUG',
    'INFO',
    'WARN',
    'INFO',
    'ERROR',
    'INFO',
    'DEBUG',
    'WARN',
    'INFO',
  ]);
  expect(
    [...screen.getByRole('group', { name: 'Log levels' }).querySelectorAll('button')].map(
      (button) => button.textContent,
    ),
  ).toEqual(['debug4', 'info10', 'warn4', 'error2']);
  rerender(<LogViewer lines={lines} wrap={false} />);
  expect(attributes()).toEqual(original);
});

it('measures rows by identity across filters and appends and disconnects observers', () => {
  const observers = new Set<{ update: () => void; nodes: Set<Element> }>();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      nodes = new Set<Element>();
      constructor(readonly update: () => void) {
        observers.add(this);
      }
      observe(node: Element) {
        this.nodes.add(node);
      }
      unobserve(node: Element) {
        this.nodes.delete(node);
      }
      disconnect() {
        observers.delete(this);
        this.nodes.clear();
      }
    },
  );
  const rect = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const result = rect.call(this);
    if (this.matches('[data-slot="log-line"]')) {
      return {
        ...result,
        height: this.textContent?.includes('Message 0') ? 72 : this.textContent?.includes('Message 1') ? 48 : 24,
      };
    }
    return result;
  });
  const lines = makeLogLines(4).map((line, i) => ({
    ...line,
    level: (['debug', 'warn', 'info', 'error'] as const)[i]!,
    message: `Message ${i}`,
  }));
  const { rerender, unmount } = render(<LogViewer lines={lines} wrap height={240} defaultFollow={false} />);
  const log = screen.getByRole('log');
  expect(log.firstElementChild).toHaveStyle({ height: '168px' });
  expect(screen.getByText('Message 2').closest('[data-slot="log-line"]')).toHaveStyle({ top: '120px' });
  fireEvent.click(screen.getByRole('button', { name: /^debug/ }));
  expect(log.firstElementChild).toHaveStyle({ height: '96px' });
  expect(screen.getByText('Message 2').closest('[data-slot="log-line"]')).toHaveStyle({ top: '48px' });
  rerender(
    <LogViewer
      lines={[...lines, { ...lines[2]!, id: 'appended', message: 'Appended' }]}
      wrap
      height={240}
      defaultFollow={false}
    />,
  );
  act(() => {
    for (const observer of observers) observer.update();
  });
  expect(log.firstElementChild).toHaveStyle({ height: '120px' });
  expect(screen.getByText('Appended').closest('[data-slot="log-line"]')).toHaveStyle({ top: '96px' });
  expect(log.querySelectorAll('[data-slot="log-line"]')).toHaveLength(4);
  unmount();
  expect(observers.size).toBe(0);
});

it.each(['noop', 'absent'])(
  'wraps the full message and uses contiguous estimated rows with %s ResizeObserver',
  (observer) => {
    if (observer === 'absent') vi.stubGlobal('ResizeObserver', undefined);
    const message = 'A long message '.repeat(36).slice(0, 500);
    const lines = makeLogLines(20).map((line, i) => ({ ...line, message: i === 0 ? message : `Message ${i}` }));
    const { rerender } = render(<LogViewer lines={lines} wrap defaultFollow={false} height={72} overscan={0} />);
    const span = screen.getByText(message);
    expect(span).not.toHaveClass('truncate');
    expect(span).toHaveClass('whitespace-pre-wrap', 'break-words');
    expect(span.textContent).toBe(message);
    const log = screen.getByRole('log');
    const rowMessages = () =>
      [...log.querySelectorAll('[data-slot="log-line"]')].map((row) => row.querySelector('.flex-1')!.textContent);
    expect(rowMessages()).toEqual([message, 'Message 1', 'Message 2']);
    log.scrollTop = 72;
    fireEvent.scroll(log);
    expect(rowMessages()).toEqual(['Message 3', 'Message 4', 'Message 5']);
    expect(log.firstElementChild).toHaveStyle({ height: '480px' });
    rerender(<LogViewer lines={lines} wrap={false} defaultFollow={false} height={72} overscan={0} />);
    expect(screen.getByText('Message 3')).toHaveClass('truncate');
  },
);

it('keeps following as rows are measured and appended until the user scrolls up', () => {
  const lines = makeLogLines(20);
  const { rerender } = render(<LogViewer lines={lines} wrap height={72} />);
  const log = screen.getByRole('log');
  expect(log.scrollTop).toBe(408);
  const rect = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const result = rect.call(this);
    return this.matches('[data-slot="log-line"]') ? { ...result, height: 48 } : result;
  });
  rerender(<LogViewer lines={makeLogLines(21)} wrap height={72} />);
  expect(log.scrollTop).toBeGreaterThan(432);
  expect(log.scrollTop).toBe(Number((log.firstElementChild as HTMLElement).style.height.replace('px', '')) - 72);
  fireEvent.scroll(log);
  expect(screen.getByRole('switch', { name: 'Follow' })).toBeChecked();
  log.scrollTop -= 48;
  fireEvent.scroll(log);
  expect(screen.getByRole('switch', { name: 'Follow' })).not.toBeChecked();
});

it('preserves search marks, selection, English copying, keyboard access and accessibility while wrapping', async () => {
  const user = userEvent.setup();
  const line = { ...makeLogLines(1)[0]!, message: 'Full searchable message '.repeat(24) };
  const onSelectLine = vi.fn();
  render(<LogViewer lines={[line]} wrap onSelectLine={onSelectLine} labels={{ levels: { info: 'Notice' } }} />);
  await user.type(screen.getByRole('searchbox'), 'searchable');
  expect(screen.getByRole('log').querySelectorAll('mark')).toHaveLength(24);
  fireEvent.click(screen.getByRole('log').querySelector('[data-slot="log-line"]')!);
  expect(onSelectLine).toHaveBeenLastCalledWith(line);
  screen.getByRole('log').focus();
  await user.tab();
  expect(screen.getByRole('button', { name: `Inspect event ${line.timestamp}` })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('button', { name: `Copy line ${line.timestamp}` })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(await navigator.clipboard.readText()).toBe(`${line.timestamp} INFO [api] ${line.message}`);
  await expectNoAxeViolations();
});

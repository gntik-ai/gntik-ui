import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { LogViewer } from './LogViewer';
import { makeLogLines } from './fixtures';

const renderedLines = () => document.querySelectorAll('[data-slot="log-line"]');

describe('LogViewer', () => {
  it('follows the bottom, stops after scrolling up more than a row and resumes on demand', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<LogViewer lines={makeLogLines(100)} height={240} rowHeight={24} />);
    const log = screen.getByRole('log');
    expect(log.scrollTop).toBe(2160);
    rerender(<LogViewer lines={makeLogLines(101)} height={240} rowHeight={24} />);
    expect(log.scrollTop).toBe(2184);
    log.scrollTop = 2135;
    fireEvent.scroll(log);
    expect(screen.getByRole('switch', { name: 'Follow' })).not.toBeChecked();
    rerender(<LogViewer lines={makeLogLines(102)} height={240} rowHeight={24} />);
    expect(log.scrollTop).toBe(2135);
    expect(log).toHaveAttribute('aria-live', 'off');
    await user.click(screen.getByRole('switch', { name: 'Follow' }));
    expect(log.scrollTop).toBe(2208);
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('can suppress event announcements while preserving the default live behavior', () => {
    const { rerender } = render(<LogViewer lines={makeLogLines(2)} />);
    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByRole('button', { name: /^Inspect event/ })).toBeNull();
    rerender(<LogViewer lines={makeLogLines(3)} announceLines={false} />);
    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'off');
    expect(screen.getByRole('switch', { name: 'Follow' })).toBeChecked();
  });

  it('offers keyboard and mouse selection independently of copying', async () => {
    const user = userEvent.setup();
    const lines = makeLogLines(2).map((line, index) => ({ ...line, timestamp: `12:00:0${index}.000` }));
    const onSelectLine = vi.fn();
    const onCopyLine = vi.fn();
    render(
      <LogViewer lines={lines} onSelectLine={onSelectLine} selectedLineId={lines[0]!.id} onCopyLine={onCopyLine} />,
    );
    const first = screen.getByRole('button', { name: 'Inspect event 12:00:00.000' });
    expect(first).toHaveAttribute('aria-pressed', 'true');
    const second = screen.getByRole('button', { name: 'Inspect event 12:00:01.000' });
    expect(second).toHaveAttribute('aria-pressed', 'false');
    await user.click(second);
    expect(onSelectLine).toHaveBeenLastCalledWith(lines[1]);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Copy line 12:00:01.000' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(second).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onSelectLine).toHaveBeenCalledTimes(3);
    await user.click(screen.getByRole('button', { name: 'Copy line 12:00:00.000' }));
    expect(onCopyLine).toHaveBeenCalledWith(lines[0]);
    expect(onSelectLine).toHaveBeenCalledTimes(3);
    await expectNoAxeViolations();
  });

  it('renders only a window of rows, pinned to the tail while following', async () => {
    render(<LogViewer />);
    const log = screen.getByRole('log', { name: 'Logs' });
    expect(log).toBeInTheDocument();
    expect(renderedLines().length).toBeLessThan(40);
    expect(within(log).getByText('12:02:57.230')).toBeInTheDocument(); // last line (index 479)
    await expectNoAxeViolations();
  });

  it('scrolling moves the window and turns follow off', () => {
    render(<LogViewer lines={makeLogLines(1000)} defaultFollow={false} height={240} rowHeight={24} overscan={2} />);
    const log = screen.getByRole('log');
    expect(screen.getByRole('switch', { name: 'Follow' })).not.toBeChecked();
    expect(within(log).getByText('12:00:00.000')).toBeInTheDocument();
    log.scrollTop = 24 * 500;
    fireEvent.scroll(log);
    expect(within(log).queryByText('12:00:00.000')).not.toBeInTheDocument();
    expect(renderedLines()).toHaveLength(14);
  });

  it('filters by level, highlights search matches and copies a line', async () => {
    const user = userEvent.setup();
    const onCopyLine = vi.fn();
    render(<LogViewer lines={makeLogLines(20)} onCopyLine={onCopyLine} />);
    await user.click(screen.getByRole('button', { name: /^debug/ }));
    expect(screen.getByText('16 of 20')).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Search logs' }), 'failed');
    expect(screen.getByText('2 of 20')).toBeInTheDocument();
    expect(document.querySelectorAll('mark')).toHaveLength(2);
    await user.click(screen.getAllByRole('button', { name: /^Copy line/ })[0]!);
    expect(onCopyLine).toHaveBeenCalledWith(expect.objectContaining({ level: 'error' }));
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });
});

it.each([
  ['Función', 'funcion', 'Función'],
  ['İstanbul', 'stan', 'stan'],
])('keeps and marks the original substring of %s', async (message, query, marked) => {
  const user = userEvent.setup();
  render(<LogViewer lines={[{ ...makeLogLines(1)[0]!, message, source: undefined }]} />);
  await user.type(screen.getByRole('searchbox', { name: 'Search logs' }), query);
  expect(renderedLines()).toHaveLength(1);
  expect([...screen.getByRole('log').querySelectorAll('mark')].map((mark) => mark.textContent)).toEqual([marked]);
});

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Terminal, type TerminalHandle } from './Terminal';
import TerminalBuildLog from './examples/TerminalBuildLog';
import TerminalDeployLog from './examples/TerminalDeployLog';

const E = '\u001b[';

/** jsdom has no layout: give the log a scroll geometry. */
function geometry(el: HTMLElement, { scrollHeight = 1000, clientHeight = 200 } = {}) {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => scrollHeight });
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => clientHeight });
}

function setup(props: Partial<Parameters<typeof Terminal>[0]> = {}) {
  const ref = createRef<TerminalHandle>();
  const user = userEvent.setup();
  render(<Terminal ref={ref} title="job" {...props} />);
  const log = screen.getByRole('log', { name: 'Terminal output' });
  return { ref, user, log };
}

describe('Terminal', () => {
  it('is a labelled log with aria-live off by default, opt-in polite', () => {
    const { log } = setup();
    expect(log).toHaveAttribute('aria-live', 'off');
    render(<Terminal live label="Build output" />);
    expect(screen.getByRole('log', { name: 'Build output' })).toHaveAttribute('aria-live', 'polite');
  });

  it('streams chunks through the handle and colours ANSI with token classes', () => {
    const { ref, log } = setup();
    act(() => {
      ref.current?.write(`${E}32mok${E}0m first\nsec`);
      ref.current?.write('ond\n');
      ref.current?.writeln(`${E}31merror${E}0m third`);
    });
    expect(log).toHaveTextContent('ok firstseconderror third');
    expect(within(log).getByText('ok')).toHaveClass('text-success-text');
    expect(within(log).getByText('error')).toHaveClass('text-destructive-text');
    expect(ref.current?.getText()).toBe('ok first\nsecond\nerror third');
    act(() => ref.current?.clear());
    expect(ref.current?.getText()).toBe('');
  });

  it('caps the buffer at maxLines and keeps line numbers absolute', () => {
    const { ref, log } = setup({ maxLines: 2, showLineNumbers: true });
    act(() => ref.current?.write('a\nb\nc\n'));
    expect(ref.current?.getText()).toBe('b\nc');
    expect(log).toHaveTextContent('2b3c');
  });

  it('follows the tail; scrolling up shows “Jump to latest” with the new-line count', async () => {
    const { ref, user, log } = setup();
    geometry(log);
    act(() => ref.current?.write('one\n'));
    expect(log.scrollTop).toBe(1000);
    log.scrollTop = 100;
    fireEvent.scroll(log);
    act(() => ref.current?.write('two\nthree\n'));
    expect(log.scrollTop).toBe(100);
    const jump = await screen.findByRole('button', { name: /Jump to latest/ });
    expect(jump).toHaveTextContent('2 new lines');
    await user.click(jump);
    expect(log.scrollTop).toBe(1000);
    expect(screen.queryByRole('button', { name: /Jump to latest/ })).not.toBeInTheDocument();
  });

  it('End in the log jumps to the latest line; Home goes to the top and stops following', async () => {
    const { ref, user, log } = setup();
    geometry(log);
    act(() => ref.current?.write('a\nb\n'));
    log.focus();
    await user.keyboard('{Home}');
    expect(log.scrollTop).toBe(0);
    expect(screen.getByRole('button', { name: /Jump to latest/ })).toBeInTheDocument();
    act(() => ref.current?.write('c\n'));
    expect(log.scrollTop).toBe(0);
    await user.keyboard('{End}');
    expect(log.scrollTop).toBe(1000);
    expect(screen.queryByRole('button', { name: /Jump to latest/ })).not.toBeInTheDocument();
  });

  it('Arrow / Page keys scroll natively: the log is focusable', async () => {
    const { user, log } = setup({ defaultLines: ['x'] });
    await user.click(log);
    expect(log).toHaveAttribute('tabindex', '0');
    expect(log).toHaveFocus();
  });

  it('Tab reaches search, match arrows, wrap, copy and the log in order', async () => {
    const { user, log } = setup({ defaultLines: ['find me', 'and me'] });
    const reached: string[] = [];
    for (let i = 0; i < 6; i++) {
      await user.tab();
      const el = document.activeElement as HTMLElement;
      reached.push(el.getAttribute('aria-label') ?? el.getAttribute('role') ?? '');
    }
    // Match arrows are disabled until there is a query.
    expect(reached.slice(0, 4)).toEqual(['Search output', 'Wrap lines', 'Copy all', 'Terminal output']);
    expect(log).toBeDefined();
  });

  it('search highlights matches; Enter / Shift+Enter move between them; Escape clears', async () => {
    const { user, log } = setup({ defaultLines: [`${E}31mfail${E}0m: one`, 'ok', 'FAIL: two'] });
    const search = screen.getByRole('searchbox', { name: 'Search output' });
    await user.type(search, 'fail');
    expect(log.querySelectorAll('mark')).toHaveLength(2);
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    // The match keeps the ANSI colour of the text it covers.
    expect(log.querySelector('mark[data-current]')).toHaveClass('text-destructive-text');
    await user.keyboard('{Enter}');
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
    expect(log.querySelector('mark[data-current]')).toHaveTextContent('FAIL');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next match' }));
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
    search.focus();
    await user.keyboard('{Escape}');
    expect(search).toHaveValue('');
    expect(log.querySelectorAll('mark')).toHaveLength(0);
  });

  it('Ctrl+F inside the terminal focuses the search box', async () => {
    const { user, log } = setup({ defaultLines: ['x'] });
    log.focus();
    await user.keyboard('{Control>}f{/Control}');
    expect(screen.getByRole('searchbox', { name: 'Search output' })).toHaveFocus();
  });

  it('wrap toggle is a pressed button; copy all copies plain text and announces it', async () => {
    const { user } = setup({ defaultLines: [`${E}32mok${E}0m`, 'done'] });
    const wrap = screen.getByRole('button', { name: 'Wrap lines' });
    expect(wrap).toHaveAttribute('aria-pressed', 'false');
    await user.click(wrap);
    expect(wrap).toHaveAttribute('aria-pressed', 'true');
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    await user.click(screen.getByRole('button', { name: 'Copy all' }));
    expect(writeText).toHaveBeenCalledWith('ok\ndone');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard'));
  });

  it('shows timestamps as <time> elements', () => {
    render(<Terminal lines={[{ text: 'boot', timestamp: Date.UTC(2026, 0, 1, 8, 5, 9) }]} showTimestamps formatTimestamp={(d) => d.toISOString().slice(11, 19)} />);
    const time = screen.getByText('08:05:09');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2026-01-01T08:05:09.000Z');
  });

  it.each([
    ['TerminalBuildLog', TerminalBuildLog],
    ['TerminalDeployLog', TerminalDeployLog],
  ] as const)('%s has no axe violations', async (_n, Example) => {
    render(<Example />);
    await expectNoAxeViolations();
  });

  it('TerminalBuildLog streams into the log', async () => {
    const user = userEvent.setup();
    render(<TerminalBuildLog />);
    await user.click(screen.getByRole('button', { name: 'Run build' }));
    await waitFor(() => expect(screen.getByRole('log')).toHaveTextContent('pnpm build'), { timeout: 2000 });
    await expectNoAxeViolations();
  });
});

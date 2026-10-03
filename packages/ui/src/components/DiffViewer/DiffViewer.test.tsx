import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DiffViewer } from './DiffViewer';
import { diffJson, diffLines, diffStats, diffWords, stableStringify } from './diff';
import { collapsibleRanges } from './diff-view';
import DiffViewerJson from './examples/DiffViewerJson';
import DiffViewerText from './examples/DiffViewerText';

const lines = (n: number, prefix = 'line') => Array.from({ length: n }, (_, i) => `${prefix} ${i + 1}`).join('\n');

describe('diffLines', () => {
  it('produces a minimal script with removed before added and line numbers', () => {
    const out = diffLines('a\nb\nc\nd', 'a\nB\nc\nd\ne');
    expect(out.map((l) => [l.type, l.text, l.oldLine, l.newLine])).toEqual([
      ['unchanged', 'a', 1, 1],
      ['removed', 'b', 2, undefined],
      ['added', 'B', undefined, 2],
      ['unchanged', 'c', 3, 3],
      ['unchanged', 'd', 4, 4],
      ['added', 'e', undefined, 5],
    ]);
    expect(diffStats(out)).toEqual({ added: 2, removed: 1 });
  });

  it('handles empty sides, trailing newlines and identical texts', () => {
    expect(diffLines('', '')).toEqual([]);
    expect(diffLines('', 'x\n').map((l) => l.type)).toEqual(['added']);
    expect(diffLines('x\ny\n', '').map((l) => l.type)).toEqual(['removed', 'removed']);
    expect(diffLines('same\n', 'same').map((l) => l.type)).toEqual(['unchanged']);
  });

  it('finds the LCS on interleaved edits', () => {
    const a = 'A B C A B B A'.split(' ').join('\n');
    const b = 'C B A B A C'.split(' ').join('\n');
    const out = diffLines(a, b);
    expect(out.filter((l) => l.type === 'unchanged')).toHaveLength(4);
    // Rebuilding both sides from the script gives the inputs back.
    expect(out.filter((l) => l.type !== 'added').map((l) => l.text).join('\n')).toBe(a);
    expect(out.filter((l) => l.type !== 'removed').map((l) => l.text).join('\n')).toBe(b);
  });

  it('can ignore whitespace and case', () => {
    expect(diffLines('a  b', 'a b', { ignoreWhitespace: true }).map((l) => l.type)).toEqual(['unchanged']);
    expect(diffLines('ABC', 'abc', { ignoreCase: true }).map((l) => l.type)).toEqual(['unchanged']);
  });

  it('diffWords marks only the changed words', () => {
    const { old, new: next } = diffWords('port: 8080', 'port: 8443');
    expect(old).toEqual([{ text: 'port: ', changed: false }, { text: '8080', changed: true }]);
    expect(next).toEqual([{ text: 'port: ', changed: false }, { text: '8443', changed: true }]);
  });

  it('JSON is compared with stable key order', () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: [{ z: 1, y: 2 }] } })).toBe('{\n  "a": {\n    "c": [\n      {\n        "y": 2,\n        "z": 1\n      }\n    ],\n    "d": 2\n  },\n  "b": 1\n}');
    expect(diffStats(diffJson({ a: 1, b: 2 }, '{"b":2,"a":1}'))).toEqual({ added: 0, removed: 0 });
  });

  it('collapses only long unchanged runs, keeping context', () => {
    const out = diffLines(lines(20), lines(20).replace('line 10', 'line ten'));
    expect(collapsibleRanges(out, 3)).toEqual([
      [0, 6],
      [14, 21],
    ]);
    expect(collapsibleRanges(out, Infinity)).toEqual([]);
  });
});

describe('DiffViewer', () => {
  it('marks changes with +/− markers and screen-reader text, not colour alone', () => {
    render(<DiffViewer oldValue={'a\nb'} newValue={'a\nc'} />);
    const region = screen.getByRole('region', { name: 'Diff' });
    const removed = region.querySelector('[data-type="removed"]')!;
    const added = region.querySelector('[data-type="added"]')!;
    expect(removed).toHaveClass('bg-destructive/10');
    expect(removed).toHaveTextContent('Removed line 2: b');
    expect(removed).toHaveTextContent('−');
    expect(added).toHaveTextContent('Added line 2: c');
    expect(added).toHaveTextContent('+');
    expect(screen.getByText('1 addition')).toHaveClass('sr-only');
    expect(screen.getByText('1 deletion')).toHaveClass('sr-only');
  });

  it('highlights changed words inside paired lines', () => {
    const { container } = render(<DiffViewer oldValue="port: 8080" newValue="port: 8443" />);
    const marked = [...container.querySelectorAll('[data-changed]')].map((el) => el.textContent);
    expect(marked).toEqual(['8080', '8443']);
  });

  it('Tab reaches the view switch and the region; arrows and Enter switch the layout', async () => {
    const user = userEvent.setup();
    const onModeChange = vi.fn();
    render(<DiffViewer oldValue={'a\nb'} newValue={'a\nc'} oldLabel="v1" newLabel="v2" onModeChange={onModeChange} />);
    await user.tab();
    const unified = screen.getByRole('button', { name: 'Unified' });
    expect(unified).toHaveFocus();
    expect(unified).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{ArrowRight}');
    const split = screen.getByRole('button', { name: 'Split' });
    expect(split).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onModeChange).toHaveBeenLastCalledWith('split');
    expect(split).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelector('[data-mode="split"]')).toBeInTheDocument();
    await user.keyboard('{ArrowLeft} ');
    expect(onModeChange).toHaveBeenLastCalledWith('unified');
    await user.tab();
    expect(screen.getByRole('region', { name: 'Diff' })).toHaveFocus();
  });

  it('split view puts removed lines left and added lines right', () => {
    const { container } = render(<DiffViewer mode="split" oldValue={'x\nold'} newValue={'x\nnew'} oldLabel="before.txt" newLabel="after.txt" />);
    const row = container.querySelector('[data-type="changed"]')!;
    const [left, right] = row.children;
    expect(left).toHaveAttribute('data-type', 'removed');
    expect(right).toHaveAttribute('data-type', 'added');
    expect(screen.getAllByText('before.txt')).toHaveLength(1);
  });

  it('Enter / Space on "Expand N lines" reveals the run and focuses the region', async () => {
    const user = userEvent.setup();
    render(<DiffViewer oldValue={lines(20)} newValue={lines(20).replace('line 10', 'line ten')} showModeToggle={false} />);
    const region = screen.getByRole('region', { name: 'Diff' });
    expect(within(region).queryByText('line 1')).not.toBeInTheDocument();
    const first = screen.getByRole('button', { name: 'Expand 6 lines' });
    await user.tab();
    expect(region).toHaveFocus();
    await user.tab();
    expect(first).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(within(region).getByText('line 1')).toBeInTheDocument();
    await waitFor(() => expect(region).toHaveFocus());
    screen.getByRole('button', { name: 'Expand 7 lines' }).focus();
    await user.keyboard(' ');
    expect(within(region).getByText('line 20')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Expand/ })).not.toBeInTheDocument();
  });

  it('says when there are no changes', () => {
    render(<DiffViewer oldValue={'{"a":1}'} newValue={{ a: 1 }} format="json" />);
    expect(screen.getByText('No changes')).toBeInTheDocument();
  });

  it('examples have no axe violations (both layouts)', async () => {
    const user = userEvent.setup();
    render(
      <>
        <DiffViewerText />
        <DiffViewerJson />
      </>,
    );
    await expectNoAxeViolations();
    await user.click(screen.getAllByRole('button', { name: 'Split' })[0]!);
    await expectNoAxeViolations();
  });
});

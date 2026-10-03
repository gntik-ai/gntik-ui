import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import JsonViewerDepth from './examples/JsonViewerDepth';
import JsonViewerPayload from './examples/JsonViewerPayload';
import { joinPath, matchAncestors } from './json-model';
import { JsonViewer } from './JsonViewer';

const node = (name: string | RegExp) => screen.getByRole('treeitem', { name });

function mockClipboard() {
  const writeText = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

describe('JsonViewer', () => {
  it('builds paths and finds matches', () => {
    expect(joinPath('', 'a')).toBe('a');
    expect(joinPath('a', 0)).toBe('a[0]');
    expect(joinPath('a', 'content-type')).toBe('a["content-type"]');
    expect([...matchAncestors({ a: { b: [{ c: 'needle' }] } }, 'NEED')]).toEqual(['a', 'a.b', 'a.b[0]']);
  });

  it('renders a tree with type-coloured values', () => {
    render(<JsonViewer data={{ s: 'x', n: 1, b: true, z: null, o: { k: 1 }, a: [1, 2] }} />);
    expect(screen.getByRole('tree', { name: 'JSON' })).toBeInTheDocument();
    expect(screen.getByText('"x"')).toHaveClass('text-warning-text');
    expect(screen.getAllByText('1')[0]).toHaveClass('text-destructive-text');
    expect(screen.getByText('true')).toHaveClass('text-foreground');
    expect(screen.getByText('null')).toHaveClass('text-muted-foreground');
    expect(node(/^o:\s*\{ \} 1 key/)).toHaveAttribute('aria-expanded', 'true');
    expect(node(/^a:\s*\[ \] 2 items/)).toHaveAttribute('aria-expanded', 'true');
    const classes = Array.from(document.querySelectorAll('[class]')).map((el) => el.getAttribute('class')).join(' ');
    expect(classes).not.toMatch(/text-(primary|success|warning|destructive|info)(?![-\w])/);
  });

  it('arrow keys navigate and collapse / expand containers', async () => {
    const user = userEvent.setup();
    render(<JsonViewerDepth />);
    await user.tab();
    expect(node(/^type:/)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    const data = node(/^data:/);
    expect(data).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(data).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(node(/^invoice:/)).toHaveFocus();
    await user.keyboard('{End}');
    expect(node(/^customer:/)).toHaveFocus();
  });

  it('maxDepth renders deeper containers as non-expandable summaries', () => {
    render(<JsonViewerDepth />);
    const address = node(/^customer:/);
    expect(address).not.toHaveAttribute('aria-expanded');
    expect(address).toHaveTextContent('{ } 2 keys');
  });

  it('search highlights matches and expands their ancestors', async () => {
    const user = userEvent.setup();
    render(<JsonViewerPayload />);
    expect(node(/^containers:/)).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('treeitem', { name: /^memory:/ })).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Search keys and values' }), '256');
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
    expect(marks[0]).toHaveClass('text-warning-chip-text');
    expect(node(/^memory:\s*"256Mi"/)).toBeInTheDocument();
  });

  it('Enter selects a node; the toolbar copies its path and value', async () => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    render(<JsonViewerPayload />);
    const copyPath = screen.getByRole('button', { name: 'Copy path' });
    expect(copyPath).toBeDisabled();
    node(/^labels:/).focus();
    await user.keyboard('{ArrowRight}{ArrowDown}{ArrowDown}{Enter}');
    expect(node(/^cost-center:/)).toHaveAttribute('aria-selected', 'true');
    await user.click(copyPath);
    expect(writeText).toHaveBeenLastCalledWith('labels["cost-center"]');
    await user.click(screen.getByRole('button', { name: 'Copy value' }));
    expect(writeText).toHaveBeenLastCalledWith('"cc-204"');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard'));
  });

  it('Space selects and typeahead jumps to a key', async () => {
    const user = userEvent.setup();
    render(<JsonViewerPayload />);
    within(screen.getByRole('tree')).getAllByRole('treeitem')[0]!.focus();
    await user.keyboard('reg');
    expect(node(/^region:/)).toHaveFocus();
    await user.keyboard(' ');
    expect(node(/^region:/)).toHaveAttribute('aria-selected', 'true');
  });

  it('has no axe violations', async () => {
    render(
      <>
        <JsonViewerPayload />
        <JsonViewerDepth />
      </>,
    );
    await expectNoAxeViolations();
  });
});

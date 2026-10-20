import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import JsonViewerCapped from './examples/JsonViewerCapped';
import JsonViewerDepth from './examples/JsonViewerDepth';
import JsonViewerEmpty from './examples/JsonViewerEmpty';
import JsonViewerPayload from './examples/JsonViewerPayload';
import JsonViewerUnicodeBoundary from './examples/JsonViewerUnicodeBoundary';
import { joinPath, matchAncestors } from './json-model';
import { JsonViewer } from './JsonViewer';

const node = (name: string | RegExp) => screen.getByRole('treeitem', { name });

function mockClipboard() {
  const writeText = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

describe('JsonViewer', () => {
  it('keeps the existing tree for under-cap objects and exactly 4096-unit strings', () => {
    const data = { a: { b: 1 } };
    const { rerender } = render(<JsonViewer data={data} />);
    const original = screen.getByRole('tree').textContent;
    rerender(<JsonViewer data={data} maxDisplayChars={4096} />);
    expect(screen.getByRole('tree').textContent).toBe(original);
    const exact = 'a'.repeat(4094) + '😀';
    rerender(<JsonViewer data={exact} maxDisplayChars={4096} />);
    expect(screen.getByRole('tree').textContent).toBe('"' + exact + '"');
    expect(screen.queryByText('Truncated')).not.toBeInTheDocument();
    const quoted = '"'.repeat(4096);
    rerender(<JsonViewer data={quoted} maxDisplayChars={4096} />);
    expect(screen.getByRole('tree').textContent).toBe(JSON.stringify(quoted));
    expect(screen.queryByText('Truncated')).not.toBeInTheDocument();
    rerender(<JsonViewer data={'a'.repeat(4095) + '😀'} maxDisplayChars={4096} />);
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    expect(screen.getByRole('region').textContent).toBe('a'.repeat(4095) + '…');
    expect(screen.getByRole('region').textContent).not.toMatch(/[\uD800-\uDFFF]/);
    expect(screen.getByText('Truncated')).toBeVisible();
    rerender(<JsonViewer data={'a'.repeat(5000)} />);
    expect(screen.getByRole('tree').textContent).toBe('"' + 'a'.repeat(5000) + '"');
  });

  it('enables copying with no tree selection and translates the full-copy hint', async () => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    render(<JsonViewer data="abcdef" maxDisplayChars={4} labels={{ copyFullHint: 'Copies the entire payload' }} />);
    expect(screen.getByText('Copies the entire payload')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Copy path' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Copy value' }));
    expect(writeText).toHaveBeenCalledWith('abcdef');
  });

  it.each(['dark', 'light', 'high_contrast'])(
    'has no axe violations in the capped, empty and uncapped examples (%s)',
    async (theme) => {
      document.documentElement.className = theme === 'light' ? '' : theme;
      try {
        render(
          <>
            <JsonViewerCapped />
            <JsonViewerEmpty />
            <JsonViewerUnicodeBoundary />
            <JsonViewerDepth />
          </>,
        );
        await expectNoAxeViolations();
      } finally {
        document.documentElement.className = '';
      }
    },
  );

  it.each([null, undefined, ''])('shows default or custom empty content only in capped mode (%s)', (data) => {
    const { rerender } = render(<JsonViewer data={data} maxDisplayChars={4096} />);
    expect(screen.getByText('—')).toHaveClass('text-muted-foreground');
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    expect(screen.queryByText('Truncated')).not.toBeInTheDocument();
    rerender(<JsonViewer data={data} maxDisplayChars={4096} emptyContent={<span>No value</span>} />);
    expect(screen.getByText('No value')).toBeVisible();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
    rerender(<JsonViewer data={data} emptyContent="No value" />);
    expect(screen.getByRole('tree')).toHaveTextContent(data === '' ? '""' : 'null');
    expect(screen.queryByText('No value')).not.toBeInTheDocument();
  });

  it('lets Tab reach the named, height-bounded fallback scroll region', async () => {
    const user = userEvent.setup();
    render(<JsonViewer data={'line\n'.repeat(1000)} maxDisplayChars={4096} maxHeight={160} label="Result payload" />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Copy value' })).toHaveFocus();
    await user.tab();
    const body = screen.getByRole('region', { name: 'Result payload' });
    expect(body).toHaveFocus();
    expect(body).toHaveStyle({ maxHeight: '160px' });
    expect(body).toHaveClass('overflow-auto');
    await user.keyboard('{ArrowDown}{ArrowUp}{PageDown}');
    expect(body).toHaveFocus();
  });

  it.each(['"abcdef"', { a: 'abcdef' }])('copies the full measured value in the truncated view (%s)', async (data) => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    const { rerender } = render(<JsonViewer data={{ a: 1 }} />);
    node(/^a:/).focus();
    await user.keyboard('{Enter}');
    rerender(<JsonViewer data={data} maxDisplayChars={4} />);
    expect(screen.getByRole('button', { name: 'Copy path' })).toBeDisabled();
    expect(screen.getByText('Copy value copies the full, untruncated value')).toBeVisible();
    const copyValue = screen.getByRole('button', { name: 'Copy value' });
    expect(copyValue).toBeEnabled();
    await user.click(copyValue);
    expect(writeText).toHaveBeenLastCalledWith(typeof data === 'string' ? '"abcdef"' : '{\n  "a": "abcdef"\n}');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard'));
  });

  it('shows capped pretty JSON with a visible translatable indicator instead of a tree', () => {
    const data = { payload: 'x'.repeat(5000) };
    const { container, rerender } = render(
      <JsonViewer data={data} maxDisplayChars={4096} label="Result payload" search="payload" />,
    );
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    expect(container.querySelector('pre')?.textContent).toBe('{\n  "payload": "' + 'x'.repeat(4080) + '…');
    expect(screen.getByText('Truncated')).toBeVisible();
    expect(container.querySelector('mark')).toBeNull();
    rerender(
      <JsonViewer data={data} maxDisplayChars={4096} labels={{ truncated: 'Display limit reached' }} toolbar={false} />,
    );
    expect(screen.getByText('Display limit reached')).toBeVisible();
  });

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
    const classes = Array.from(document.querySelectorAll('[class]'))
      .map((el) => el.getAttribute('class'))
      .join(' ');
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

it.each([
  ['Función', 'funcion', 'Función'],
  ['İstanbul', 'stan', 'stan'],
])('marks original offsets in %s and reveals ancestors', (text, search, marked) => {
  render(<JsonViewer data={{ outer: { name: text } }} defaultExpandDepth={0} search={search} />);
  expect(screen.getByRole('treeitem', { name: new RegExp('name:') })).toBeInTheDocument();
  expect([...document.querySelectorAll('mark')].map((mark) => mark.textContent)).toEqual([marked]);
});

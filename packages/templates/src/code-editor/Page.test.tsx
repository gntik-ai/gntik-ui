import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MonacoLoader } from '@gntik-ai/editor';
import { expectNoAxeViolations } from '../test/a11y';
import CodeEditorPage from './Page';
import { filesToTree } from './data';

/** Minimal Monaco stand-in (same approach as the CodePanel block tests). */
function mockMonaco() {
  const model = (value: string) => ({ getValue: () => value, setValue: vi.fn(), onDidChangeContent: () => ({ dispose: vi.fn() }), dispose: vi.fn() });
  const editor = {
    defineTheme: vi.fn(),
    setTheme: vi.fn(),
    setModelLanguage: vi.fn(),
    remeasureFonts: vi.fn(),
    createModel: vi.fn((value: string) => model(value)),
    create: vi.fn((_el: HTMLElement, opts: { value?: string }) => {
      const m = model(opts.value ?? '');
      return {
        getModel: () => m,
        getValue: () => m.getValue(),
        setValue: vi.fn(),
        onDidChangeModelContent: () => ({ dispose: vi.fn() }),
        updateOptions: vi.fn(),
        layout: vi.fn(),
        dispose: vi.fn(),
        setPosition: vi.fn(),
        revealLineInCenter: vi.fn(),
        focus: vi.fn(),
      };
    }),
    createDiffEditor: vi.fn(() => ({ setModel: vi.fn(), getModel: () => null, updateOptions: vi.fn(), layout: vi.fn(), dispose: vi.fn() })),
  };
  return { editor, loader: (() => Promise.resolve({ editor })) as unknown as MonacoLoader };
}

describe('CodeEditorPage', () => {
  it('renders the editor chrome, file tree and code panel', { timeout: 15000 }, async () => {
    const m = mockMonaco();
    render(<CodeEditorPage loader={m.loader} />);
    expect(screen.getByRole('main', { name: 'projects-api editor' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'projects-api' })).toBeInTheDocument();
    expect(screen.getByRole('tree', { name: 'Files' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /handler\.ts/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    await waitFor(() => expect(m.editor.create).toHaveBeenCalled());
    await expectNoAxeViolations();
  });

  it('opens a file from the tree as the active tab', { timeout: 15000 }, async () => {
    const m = mockMonaco();
    render(<CodeEditorPage loader={m.loader} />);
    await userEvent.click(within(screen.getByRole('treeitem', { name: /deploy\.yaml/ })).getByText('deploy.yaml'));
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tab', { name: /deploy\.yaml/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('deletes a file from its context menu', { timeout: 15000 }, async () => {
    const m = mockMonaco();
    const onDeleteFile = vi.fn();
    render(<CodeEditorPage loader={m.loader} onDeleteFile={onDeleteFile} />);
    fireEvent.contextMenu(within(screen.getByRole('treeitem', { name: /query\.ts/ })).getByText('query.ts'));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete file' }));
    expect(onDeleteFile).toHaveBeenCalledWith('src/query.ts');
    expect(screen.queryByRole('treeitem', { name: /query\.ts/ })).toBeNull();
    expect(screen.getAllByRole('tab')).toHaveLength(1);
  });

  it('builds a folders-first tree from paths', () => {
    expect(filesToTree(['b.md', 'src/a.ts', 'src/lib/c.ts']).map((n) => n.id)).toEqual(['src/', 'b.md']);
  });
});

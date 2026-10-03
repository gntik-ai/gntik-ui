import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MonacoLoader } from '@gntik-ai/editor';
import { expectNoAxeViolations } from '../../test/a11y';
import { CodePanel } from './CodePanel';
import ControlledCodePanel from './examples/controlled';

/** Minimal Monaco stand-in (same approach as the @gntik-ai/editor tests). */
function mockMonaco() {
  const created: Array<{ value: string; language?: string; revealLineInCenter: ReturnType<typeof vi.fn> }> = [];
  const model = (value: string) => ({ getValue: () => value, setValue: vi.fn(), onDidChangeContent: () => ({ dispose: vi.fn() }), dispose: vi.fn() });
  const editor = {
    defineTheme: vi.fn(),
    setTheme: vi.fn(),
    setModelLanguage: vi.fn(),
    remeasureFonts: vi.fn(),
    createModel: vi.fn((value: string) => model(value)),
    create: vi.fn((_el: HTMLElement, opts: { value?: string; language?: string }) => {
      const m = model(opts.value ?? '');
      const ed = {
        value: opts.value ?? '',
        language: opts.language,
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
      created.push(ed);
      return ed;
    }),
    createDiffEditor: vi.fn(() => ({ setModel: vi.fn(), getModel: () => null, updateOptions: vi.fn(), layout: vi.fn(), dispose: vi.fn() })),
  };
  const loader = (() => Promise.resolve({ editor })) as unknown as MonacoLoader;
  return { editor, loader, created };
}

describe('CodePanel', () => {
  it('renders file tabs, the active editor and the problems list', async () => {
    const m = mockMonaco();
    render(<CodePanel loader={m.loader} />);
    expect(screen.getByRole('tab', { name: /handler\.ts/ })).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(m.editor.create).toHaveBeenCalledTimes(1));
    expect(m.created[0]?.language).toBe('typescript');
    expect(screen.getByRole('list', { name: 'Problems' }).children).toHaveLength(3);
    expect(screen.getByText('1 error · 1 warning')).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('switches files, opens the diff view and jumps to a problem', async () => {
    const user = userEvent.setup();
    const m = mockMonaco();
    const onProblemSelect = vi.fn();
    render(<CodePanel loader={m.loader} onProblemSelect={onProblemSelect} />);
    await waitFor(() => expect(m.editor.create).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: 'Diff' }));
    await waitFor(() => expect(m.editor.createDiffEditor).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('tab', { name: /deploy\.yaml/ }));
    await waitFor(() => expect(m.created.at(-1)?.language).toBe('yaml'));
    expect(screen.getByRole('button', { name: 'Diff' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Expected 0 arguments/ }));
    expect(onProblemSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }));
    expect(screen.getByRole('tab', { name: /handler\.ts/ })).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(m.created.at(-1)?.revealLineInCenter).toHaveBeenCalledWith(5));
  });

  it('supports a controlled active file', async () => {
    const user = userEvent.setup();
    const m = mockMonaco();
    const onActiveFileChange = vi.fn();
    const { rerender } = render(<CodePanel loader={m.loader} activeFile="deploy.yaml" onActiveFileChange={onActiveFileChange} />);
    expect(screen.getByRole('tab', { name: /deploy\.yaml/ })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: /settings\.json/ }));
    expect(onActiveFileChange).toHaveBeenLastCalledWith('settings.json');
    // Stays on the controlled value until the parent updates it.
    expect(screen.getByRole('tab', { name: /deploy\.yaml/ })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('button', { name: /Expected 0 arguments/ }));
    expect(onActiveFileChange).toHaveBeenLastCalledWith('src/handler.ts');
    rerender(<CodePanel loader={m.loader} activeFile="settings.json" onActiveFileChange={onActiveFileChange} />);
    expect(screen.getByRole('tab', { name: /settings\.json/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders the problems heading at the requested level', async () => {
    const m = mockMonaco();
    const { unmount } = render(<CodePanel loader={m.loader} />);
    expect(screen.getByRole('heading', { name: 'Problems' }).tagName).toBe('H3');
    unmount();
    render(<ControlledCodePanel />);
    expect(screen.getByRole('heading', { name: 'Problems' }).tagName).toBe('H4');
    expect(screen.getByRole('tab', { name: /deploy\.yaml/ })).toHaveAttribute('aria-selected', 'true');
    await expectNoAxeViolations();
  });
});

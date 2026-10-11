import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MonacoLoader } from '@gntik-ai/editor';
import { expectNoAxeViolations } from '../../test/a11y';
import { CodePanel } from './CodePanel';
import ControlledCodePanel from './examples/controlled';

/** Minimal Monaco stand-in (same approach as the @gntik-ai/editor tests). */
function mockMonaco() {
  const created: Array<{
    value: string;
    language?: string;
    revealLineInCenter: ReturnType<typeof vi.fn>;
  }> = [];
  const markerListeners = new Set<() => void>();
  let modelMarkers: Array<{
    owner: string;
    resource: { toString: () => string };
    severity: number;
    message: string;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  }> = [];
  const resource = { toString: () => 'inmemory://test/1' };
  const model = (value: string) => ({
    uri: resource,
    getValue: () => value,
    setValue: vi.fn(),
    onDidChangeContent: () => ({ dispose: vi.fn() }),
    dispose: vi.fn(),
  });
  const editor = {
    getModelMarkers: vi.fn(() => modelMarkers),
    onDidChangeMarkers: (listener: () => void) => {
      markerListeners.add(listener);
      return { dispose: () => markerListeners.delete(listener) };
    },
    setModelMarkers: vi.fn((_model: unknown, owner: string, markers: typeof modelMarkers) => {
      modelMarkers = [
        ...modelMarkers.filter((m) => m.owner !== owner),
        ...markers.map((m) => ({ ...m, owner, resource })),
      ];
      markerListeners.forEach((listener) => listener());
    }),
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
    createDiffEditor: vi.fn(() => ({
      setModel: vi.fn(),
      getModel: () => null,
      getModifiedEditor: () => ({
        getModel: () => model('count: wrong'),
        setPosition: vi.fn(),
        revealLineInCenter: vi.fn(),
        focus: vi.fn(),
      }),
      updateOptions: vi.fn(),
      layout: vi.fn(),
      dispose: vi.fn(),
    })),
  };
  const loader = (() => Promise.resolve({ editor })) as unknown as MonacoLoader;
  return {
    editor,
    loader,
    created,
    resource,
    emitMarkers: (markers: typeof modelMarkers) => {
      modelMarkers = markers;
      markerListeners.forEach((listener) => listener());
    },
  };
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
    const { rerender } = render(
      <CodePanel loader={m.loader} activeFile="deploy.yaml" onActiveFileChange={onActiveFileChange} />,
    );
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

it('merges markers from all Monaco owners and consumer markers and reports only validity transitions', async () => {
  const m = mockMonaco();
  const validity = vi.fn();
  const ready = vi.fn();
  const files = [{ path: 'flow.yaml', language: 'yaml', content: 'count: wrong' }];
  const semantic = [
    {
      id: 'semantic',
      owner: 'semantic-worker',
      file: 'flow.yaml',
      line: 1,
      severity: 'warning' as const,
      message: 'Missing terminal step',
    },
  ];
  const { rerender, unmount } = render(
    <CodePanel
      loader={m.loader}
      files={files}
      problems={[]}
      markers={semantic}
      onValidityChange={validity}
      onMonacoReady={ready}
      readOnly
    />,
  );
  await waitFor(() => expect(m.editor.create).toHaveBeenCalledOnce());
  expect(m.editor.create).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ readOnly: true }));
  await waitFor(() => expect(ready).toHaveBeenCalledOnce());
  expect(screen.getByRole('list', { name: 'Problems' })).toHaveTextContent('Missing terminal step');
  validity.mockClear();
  const error = {
    owner: 'yaml',
    resource: m.resource,
    severity: 8,
    message: 'Expected integer',
    startLineNumber: 1,
    startColumn: 8,
    endLineNumber: 1,
    endColumn: 13,
  };
  act(() => m.emitMarkers([error, { ...error, owner: 'other-worker', message: 'Invalid reference' }]));
  expect(screen.getByRole('list', { name: 'Problems' })).toHaveTextContent('Expected integer');
  expect(screen.getByRole('list', { name: 'Problems' })).toHaveTextContent('Invalid reference');
  expect(validity).toHaveBeenCalledExactlyOnceWith(false);
  act(() => m.emitMarkers([error]));
  expect(validity).toHaveBeenCalledTimes(1);
  act(() => m.emitMarkers([]));
  expect(validity).toHaveBeenLastCalledWith(true);
  expect(validity).toHaveBeenCalledTimes(2);
  rerender(
    <CodePanel
      loader={m.loader}
      files={files}
      problems={[]}
      markers={[]}
      onValidityChange={validity}
      onMonacoReady={ready}
      readOnly
    />,
  );
  expect(screen.getByText('No problems detected.')).toBeInTheDocument();
  unmount();
  expect(m.editor.setModelMarkers).toHaveBeenLastCalledWith(expect.anything(), 'semantic-worker', []);
});

it('collects worker markers and runs consumer setup when the panel opens in diff view', async () => {
  const m = mockMonaco();
  const ready = vi.fn();
  render(
    <CodePanel
      loader={m.loader}
      files={[{ path: 'flow.yaml', language: 'yaml', content: 'count: wrong', original: 'count: 1' }]}
      problems={[]}
      defaultView="diff"
      onMonacoReady={ready}
    />,
  );
  await waitFor(() => expect(m.editor.createDiffEditor).toHaveBeenCalledOnce());
  await waitFor(() => expect(ready).toHaveBeenCalledOnce());
  act(() =>
    m.emitMarkers([
      {
        owner: 'yaml',
        resource: m.resource,
        severity: 8,
        message: 'Expected integer',
        startLineNumber: 1,
        startColumn: 8,
        endLineNumber: 1,
        endColumn: 13,
      },
    ]),
  );
  expect(screen.getByRole('list', { name: 'Problems' })).toHaveTextContent('Expected integer');
});

it.each([undefined, true, false])(
  'preserves caller-supplied problems with readOnly=%s and no diagnostics opt-in',
  async (readOnly) => {
    const m = mockMonaco();
    render(<CodePanel loader={m.loader} readOnly={readOnly} />);
    await waitFor(() => expect(m.editor.create).toHaveBeenCalledOnce());
    await act(async () =>
      m.emitMarkers([
        {
          owner: 'typescript',
          resource: m.resource,
          severity: 8,
          message: 'A model-only error',
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 2,
        },
      ]),
    );
    expect(screen.getByRole('list', { name: 'Problems' }).children).toHaveLength(3);
    expect(screen.queryByText('A model-only error')).toBeNull();
  },
);

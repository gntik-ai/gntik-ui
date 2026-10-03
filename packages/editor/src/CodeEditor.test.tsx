import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeEditor } from './CodeEditor';
import { createMockMonaco } from './test/mockMonaco';
import { mockTokens } from './test/tokens';

describe('CodeEditor', () => {
  beforeEach(() => {
    mockTokens();
    document.documentElement.className = 'dark';
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a skeleton until Monaco loads', async () => {
    const m = createMockMonaco();
    let resolve: (v: typeof m.monaco) => void = () => {};
    const loader = () => new Promise<typeof m.monaco>((r) => (resolve = r));
    render(<CodeEditor value="" loader={loader} />);
    expect(screen.getByRole('status', { name: 'Loading code editor' })).toBeInTheDocument();
    await act(async () => resolve(m.monaco));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('creates the editor with the active brand theme, language and label', async () => {
    const m = createMockMonaco();
    render(<CodeEditor value="a: 1" language="yaml" readOnly aria-label="Manifest" loader={m.loader} />);
    await waitFor(() => expect(m.editorApi.create).toHaveBeenCalledTimes(1));
    const opts = m.editorApi.create.mock.calls[0]?.[1];
    expect(opts).toMatchObject({ value: 'a: 1', language: 'yaml', readOnly: true, ariaLabel: 'Manifest', theme: 'gntik-dark' });
    expect(m.editorApi.defineTheme).toHaveBeenCalledWith('gntik-dark', expect.objectContaining({ base: 'vs-dark' }));
    expect(m.editorApi.setTheme).toHaveBeenLastCalledWith('gntik-dark');
  });

  it('calls onChange on user edits but not on controlled updates', async () => {
    const m = createMockMonaco();
    const onChange = vi.fn();
    const { rerender } = render(<CodeEditor value="one" onChange={onChange} loader={m.loader} />);
    await waitFor(() => expect(m.codeEditors).toHaveLength(1));
    const ed = m.codeEditors[0]!;
    act(() => ed.model.type('two'));
    expect(onChange).toHaveBeenCalledWith('two', expect.anything());
    onChange.mockClear();
    rerender(<CodeEditor value="three" onChange={onChange} loader={m.loader} />);
    expect(ed.getValue()).toBe('three');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('updates language and options after mount', async () => {
    const m = createMockMonaco();
    const { rerender } = render(<CodeEditor value="" language="json" loader={m.loader} />);
    await waitFor(() => expect(m.codeEditors).toHaveLength(1));
    rerender(<CodeEditor value="" language="typescript" readOnly loader={m.loader} />);
    expect(m.editorApi.setModelLanguage).toHaveBeenLastCalledWith(m.codeEditors[0]!.model, 'typescript');
    expect(m.codeEditors[0]!.updateOptions).toHaveBeenLastCalledWith(expect.objectContaining({ readOnly: true }));
  });

  it('switches theme when the <html> class changes', async () => {
    const m = createMockMonaco();
    render(<CodeEditor value="" loader={m.loader} />);
    await waitFor(() => expect(m.editorApi.setTheme).toHaveBeenLastCalledWith('gntik-dark'));
    document.documentElement.className = 'high_contrast';
    await waitFor(() => expect(m.editorApi.setTheme).toHaveBeenLastCalledWith('gntik-hc'));
    document.documentElement.className = '';
    await waitFor(() => expect(m.editorApi.setTheme).toHaveBeenLastCalledWith('gntik-light'));
  });

  it('disposes the editor on unmount and stops following the theme', async () => {
    const m = createMockMonaco();
    const { unmount } = render(<CodeEditor value="" loader={m.loader} />);
    await waitFor(() => expect(m.codeEditors).toHaveLength(1));
    unmount();
    expect(m.codeEditors[0]!.dispose).toHaveBeenCalledTimes(1);
    const calls = m.editorApi.setTheme.mock.calls.length;
    document.documentElement.className = 'light';
    await new Promise((r) => setTimeout(r, 0));
    expect(m.editorApi.setTheme).toHaveBeenCalledTimes(calls);
  });

  it('shows an error state when Monaco fails to load', async () => {
    render(<CodeEditor value="" loader={() => Promise.reject(new Error('nope'))} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('could not load');
  });
});

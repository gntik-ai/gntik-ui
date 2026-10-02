import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DiffEditor } from './DiffEditor';
import { createMockMonaco } from './test/mockMonaco';
import { mockTokens } from './test/tokens';

describe('DiffEditor', () => {
  beforeEach(() => {
    mockTokens();
    document.documentElement.className = 'light';
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a themed diff editor with both models', async () => {
    const m = createMockMonaco();
    render(<DiffEditor original="a" modified="b" language="json" aria-label="Policy" loader={m.loader} />);
    await waitFor(() => expect(m.diffEditors).toHaveLength(1));
    expect(m.editorApi.createDiffEditor.mock.calls[0]).toEqual([
      expect.any(HTMLElement),
      expect.objectContaining({
        theme: 'gntik-light',
        readOnly: true,
        renderSideBySide: true,
        originalAriaLabel: 'Policy, original',
        modifiedAriaLabel: 'Policy, modified',
      }),
    ]);
    expect(m.editorApi.createModel.mock.calls).toEqual([
      ['a', 'json'],
      ['b', 'json'],
    ]);
  });

  it('syncs props into the models and reports edits to the modified side', async () => {
    const m = createMockMonaco();
    const onChange = vi.fn();
    const { rerender } = render(
      <DiffEditor original="a" modified="b" readOnly={false} onChange={onChange} loader={m.loader} />,
    );
    await waitFor(() => expect(m.diffEditors).toHaveLength(1));
    const models = m.diffEditors[0]!.getModel()!;
    rerender(<DiffEditor original="a2" modified="b2" readOnly={false} onChange={onChange} loader={m.loader} />);
    expect(models.original.getValue()).toBe('a2');
    expect(models.modified.getValue()).toBe('b2');
    expect(onChange).not.toHaveBeenCalled();
    act(() => models.modified.type('typed'));
    expect(onChange).toHaveBeenCalledWith('typed');
  });

  it('disposes the editor and both models on unmount', async () => {
    const m = createMockMonaco();
    const { unmount } = render(<DiffEditor original="a" modified="b" loader={m.loader} />);
    await waitFor(() => expect(m.diffEditors).toHaveLength(1));
    const models = m.diffEditors[0]!.getModel()!;
    unmount();
    expect(m.diffEditors[0]!.dispose).toHaveBeenCalledTimes(1);
    expect(models.original.dispose).toHaveBeenCalledTimes(1);
    expect(models.modified.dispose).toHaveBeenCalledTimes(1);
  });

  it('follows <html> theme switches', async () => {
    const m = createMockMonaco();
    render(<DiffEditor original="a" modified="b" loader={m.loader} />);
    await waitFor(() => expect(m.editorApi.setTheme).toHaveBeenLastCalledWith('gntik-light'));
    document.documentElement.className = 'dark';
    await waitFor(() => expect(m.editorApi.setTheme).toHaveBeenLastCalledWith('gntik-dark'));
  });
});

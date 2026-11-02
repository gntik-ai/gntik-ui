import { act, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CodeEditor } from './CodeEditor';
import { DiffEditor } from './DiffEditor';
import { BASE_OPTIONS, useBrandTheme } from './index';
import { createMockMonaco } from './test/mockMonaco';
import { mockTokens } from './test/tokens';

beforeEach(() => {
  const computed = mockTokens().getMockImplementation()!;
  // Browser CSS is a system boundary: jsdom does not resolve inherited custom properties.
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
    const style = computed(element);
    return {
      getPropertyValue: (name: string) =>
        name === '--font-mono'
          ? element.closest('[data-palette]')?.getAttribute('data-palette') === 'navy'
            ? '"Test Mono", monospace'
            : '"Geist Mono", monospace'
          : style.getPropertyValue(name),
    } as CSSStyleDeclaration;
  });
});
afterEach(() => vi.restoreAllMocks());

it('keeps Geist Mono defaults for custom surfaces using useBrandTheme without a host', () => {
  const m = createMockMonaco();
  renderHook(() => useBrandTheme(m.monaco));
  expect(BASE_OPTIONS).toHaveProperty('fontFamily', 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace');
  expect(m.editorApi.setTheme).toHaveBeenCalled();
});

for (const kind of ['code', 'diff'] as const) {
  it(`${kind} retains Geist Mono when no font token resolves`, async () => {
    const computed = vi.mocked(window.getComputedStyle).getMockImplementation()!;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const style = computed(element);
      return {
        getPropertyValue: (name: string) => (name === '--font-mono' ? '' : style.getPropertyValue(name)),
      } as CSSStyleDeclaration;
    });
    const m = createMockMonaco();
    render(
      kind === 'code' ? (
        <CodeEditor options={{ fontFamily: undefined }} loader={m.loader} />
      ) : (
        <DiffEditor original="a" modified="b" options={{ fontFamily: undefined }} loader={m.loader} />
      ),
    );
    const create = kind === 'code' ? m.editorApi.create : m.editorApi.createDiffEditor;
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    const expected = { fontFamily: 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace' };
    expect(create.mock.calls[0]?.[1]).toMatchObject(expected);
    const instance = kind === 'code' ? m.codeEditors[0]! : m.diffEditors[0]!;
    expect(instance.updateOptions).toHaveBeenCalledWith(expect.objectContaining(expected));
  });

  it(`${kind} remeasures fonts only when its resolved font changes`, async () => {
    const m = createMockMonaco();
    const { container } = render(
      <section data-palette="navy">
        {kind === 'code' ? (
          <CodeEditor loader={m.loader} />
        ) : (
          <DiffEditor original="a" modified="b" loader={m.loader} />
        )}
      </section>,
    );
    const create = kind === 'code' ? m.editorApi.create : m.editorApi.createDiffEditor;
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    const section = container.querySelector('section')!;
    m.editorApi.remeasureFonts.mockClear();
    await act(async () => {
      section.classList.add('expanded');
    });
    expect(m.editorApi.remeasureFonts).not.toHaveBeenCalled();

    await act(async () => {
      section.dataset.palette = 'green';
    });
    const instance = kind === 'code' ? m.codeEditors[0]! : m.diffEditors[0]!;
    expect(instance.updateOptions).toHaveBeenLastCalledWith({ fontFamily: '"Geist Mono", monospace' });
    expect(m.editorApi.remeasureFonts).toHaveBeenCalledOnce();
    await act(async () => {
      section.classList.remove('expanded');
    });
    expect(m.editorApi.remeasureFonts).toHaveBeenCalledOnce();
  });

  it(`${kind} resolves the scoped font when options explicitly leave fontFamily undefined`, async () => {
    const m = createMockMonaco();
    const preview = (fontSize: number) => (
      <section data-palette="navy">
        {kind === 'code' ? (
          <CodeEditor options={{ fontFamily: undefined, fontSize }} loader={m.loader} />
        ) : (
          <DiffEditor original="a" modified="b" options={{ fontFamily: undefined, fontSize }} loader={m.loader} />
        )}
      </section>
    );
    const { rerender } = render(preview(13));
    const create = kind === 'code' ? m.editorApi.create : m.editorApi.createDiffEditor;
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create.mock.calls[0]?.[1]).toMatchObject({ fontFamily: '"Test Mono", monospace' });
    rerender(preview(16));
    const instance = kind === 'code' ? m.codeEditors[0]! : m.diffEditors[0]!;
    await waitFor(() =>
      expect(instance.updateOptions).toHaveBeenLastCalledWith(
        expect.objectContaining({ fontFamily: '"Test Mono", monospace', fontSize: 16 }),
      ),
    );
  });

  it(`${kind} keeps an explicit font override through palette changes and restores tokens when removed`, async () => {
    const m = createMockMonaco();
    const preview = (fontFamily?: string) => (
      <section data-palette="navy">
        {kind === 'code' ? (
          <CodeEditor options={{ fontFamily }} loader={m.loader} />
        ) : (
          <DiffEditor original="a" modified="b" options={{ fontFamily }} loader={m.loader} />
        )}
      </section>
    );
    const { container, rerender } = render(preview('Override Mono'));
    const create = kind === 'code' ? m.editorApi.create : m.editorApi.createDiffEditor;
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create.mock.calls[0]?.[1]).toMatchObject({ fontFamily: 'Override Mono' });
    container.querySelector('section')!.dataset.palette = 'green';
    const instance = kind === 'code' ? m.codeEditors[0]! : m.diffEditors[0]!;
    await waitFor(() => expect(instance.updateOptions).toHaveBeenCalledWith({ fontFamily: 'Override Mono' }));
    rerender(preview());
    await waitFor(() =>
      expect(instance.updateOptions).toHaveBeenLastCalledWith({ fontFamily: '"Geist Mono", monospace' }),
    );
    expect(create).toHaveBeenCalledOnce();
  });

  it(`${kind} follows its nearest palette font without recreating the editor or changing siblings`, async () => {
    const scoped = createMockMonaco();
    const sibling = createMockMonaco();
    const { container } = render(
      <>
        <section data-palette="navy">
          {kind === 'code' ? (
            <CodeEditor loader={scoped.loader} />
          ) : (
            <DiffEditor original="a" modified="b" loader={scoped.loader} />
          )}
        </section>
        {kind === 'code' ? (
          <CodeEditor loader={sibling.loader} />
        ) : (
          <DiffEditor original="a" modified="b" loader={sibling.loader} />
        )}
      </>,
    );
    const create = kind === 'code' ? scoped.editorApi.create : scoped.editorApi.createDiffEditor;
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create.mock.calls[0]?.[1]).toMatchObject({ fontFamily: '"Test Mono", monospace' });
    container.querySelector('section')!.dataset.palette = 'green';
    const instance = kind === 'code' ? scoped.codeEditors[0]! : scoped.diffEditors[0]!;
    await waitFor(() => expect(instance.updateOptions).toHaveBeenCalledWith({ fontFamily: '"Geist Mono", monospace' }));
    expect(create).toHaveBeenCalledOnce();
    expect(instance.dispose).not.toHaveBeenCalled();
    expect(scoped.editorApi.remeasureFonts).toHaveBeenCalled();
    const siblingCreate = kind === 'code' ? sibling.editorApi.create : sibling.editorApi.createDiffEditor;
    expect(siblingCreate.mock.calls[0]?.[1]).toMatchObject({ fontFamily: '"Geist Mono", monospace' });
  });
}

import { act, cleanup, fireEvent, render, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { setCharacterHotkeysEnabled, useHotkeys, useRegisteredHotkeys, type HotkeyDefinition } from './useHotkeys';

afterEach(() => {
  cleanup();
  setCharacterHotkeysEnabled(true);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it.each([
  ['MacIntel', { metaKey: true }, { ctrlKey: true }],
  ['Win32', { ctrlKey: true }, { metaKey: true }],
])('resolves mod on %s with exact modifiers and prevents default', (platform, right, wrong) => {
  vi.stubGlobal('navigator', { platform });
  const handler = vi.fn();
  renderHook(() => useHotkeys({ 'mod+k': handler }));
  expect(fireEvent.keyDown(document.body, { key: 'k', ...right })).toBe(false);
  fireEvent.keyDown(document.body, { key: 'k', ...wrong });
  fireEvent.keyDown(document.body, { key: 'K', ...right, shiftKey: true });
  expect(handler).toHaveBeenCalledTimes(1);
});

it('shares one listener, keeps inline handlers fresh and removes it with the last hook', () => {
  const add = vi.spyOn(document, 'addEventListener');
  const remove = vi.spyOn(document, 'removeEventListener');
  const handler = vi.fn();
  function Bindings({ value }: { value: number }) {
    useHotkeys({ '/': () => handler(value) });
    useHotkeys({ '?': () => {} });
    useHotkeys({ 'g d': () => {} });
    return null;
  }
  const view = render(<Bindings value={0} />);
  for (let value = 1; value <= 5; value++) view.rerender(<Bindings value={value} />);
  expect(add.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
  fireEvent.keyDown(document.body, { key: '/' });
  expect(handler).toHaveBeenCalledWith(5);
  view.unmount();
  expect(remove.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
});

it('supports disabled bindings and optional default prevention', () => {
  const handler = vi.fn();
  const { rerender } = renderHook(
    ({ enabled }) =>
      useHotkeys(
        { '/': { handler, preventDefault: false }, '?': { handler, enabled: false } satisfies HotkeyDefinition },
        { enabled },
      ),
    { initialProps: { enabled: false } },
  );
  fireEvent.keyDown(document.body, { key: '/' });
  expect(handler).not.toHaveBeenCalled();
  rerender({ enabled: true });
  expect(fireEvent.keyDown(document.body, { key: '/' })).toBe(true);
  fireEvent.keyDown(document.body, { key: '?' });
  expect(handler).toHaveBeenCalledTimes(1);
});

it.each(['input', 'textarea', 'select', 'editable', 'menu', 'listbox', 'tree'])(
  'guards character keys while typing in %s but allows mod+s',
  (kind) => {
    vi.stubGlobal('navigator', { platform: 'MacIntel' });
    const character = vi.fn();
    const save = vi.fn();
    renderHook(() => useHotkeys({ '?': character, '/': character, 'mod+s': save }));
    const target = document.createElement(['input', 'textarea', 'select'].includes(kind) ? kind : 'div');
    if (kind === 'editable') target.setAttribute('contenteditable', 'true');
    else if (['menu', 'listbox', 'tree'].includes(kind)) target.setAttribute('role', kind);
    const child = kind === 'menu' ? document.createElement('button') : target;
    if (child !== target) target.append(child);
    document.body.append(target);
    fireEvent.keyDown(child, { key: '?', shiftKey: true });
    fireEvent.keyDown(child, { key: '/' });
    fireEvent.keyDown(child, { key: 's', metaKey: true });
    target.remove();
    expect(character).not.toHaveBeenCalled();
    expect(save).toHaveBeenCalledTimes(1);
  },
);

it('allows opting out of the typing and repeat guards, but never handles IME or prevented events', () => {
  const ordinary = vi.fn();
  const repeat = vi.fn();
  renderHook(() => useHotkeys({ '/': ordinary, '?': { handler: repeat, repeat: true, ignoreWhileTyping: false } }));
  const input = document.createElement('input');
  document.body.append(input);
  fireEvent.keyDown(document.body, { key: '/' });
  fireEvent.keyDown(document.body, { key: '/', repeat: true });
  fireEvent.keyDown(document.body, { key: '/', isComposing: true });
  fireEvent.keyDown(document.body, { key: '/', keyCode: 229 });
  const prevented = new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true });
  prevented.preventDefault();
  fireEvent(document.body, prevented);
  fireEvent.keyDown(input, { key: '?', shiftKey: true, repeat: true });
  fireEvent.keyDown(input, { key: '?', isComposing: true });
  input.remove();
  expect(ordinary).toHaveBeenCalledTimes(1);
  expect(repeat).toHaveBeenCalledTimes(1);
});

it('requires every sequence step in order within the timeout, including non-Latin layouts', () => {
  vi.useFakeTimers();
  try {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ 'g d': handler }));
    fireEvent.keyDown(document.body, { key: 'g' });
    expect(handler).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(900));
    fireEvent.keyDown(document.body, { key: 'd' });
    expect(handler).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, { key: 'g' });
    act(() => vi.advanceTimersByTime(1100));
    fireEvent.keyDown(document.body, { key: 'd' });
    fireEvent.keyDown(document.body, { key: 'g' });
    fireEvent.keyDown(document.body, { key: 'x' });
    fireEvent.keyDown(document.body, { key: 'd' });
    expect(handler).toHaveBeenCalledTimes(1);
    const input = document.createElement('input');
    document.body.append(input);
    fireEvent.keyDown(input, { key: 'g' });
    fireEvent.keyDown(input, { key: 'd' });
    input.remove();
    expect(handler).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, { key: 'п', code: 'KeyG' });
    fireEvent.keyDown(document.body, { key: 'в', code: 'KeyD' });
    expect(handler).toHaveBeenCalledTimes(2);
  } finally {
    vi.useRealTimers();
  }
});

it('supports custom per-step timeouts and alternatives', () => {
  vi.useFakeTimers();
  try {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ 'g d x, alt+p': handler }, { sequenceTimeout: 200 }));
    fireEvent.keyDown(document.body, { key: 'g' });
    act(() => vi.advanceTimersByTime(150));
    fireEvent.keyDown(document.body, { key: 'd' });
    act(() => vi.advanceTimersByTime(150));
    fireEvent.keyDown(document.body, { key: 'x' });
    expect(handler).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, { key: 'g' });
    act(() => vi.advanceTimersByTime(201));
    fireEvent.keyDown(document.body, { key: 'd' });
    fireEvent.keyDown(document.body, { key: 'x' });
    expect(handler).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, { key: 'π', code: 'KeyP', altKey: true });
    expect(handler).toHaveBeenCalledTimes(2);
  } finally {
    vi.useRealTimers();
  }
});

it('prioritizes scopes over globals, then the most recently mounted equal, only inside the scope', () => {
  const scoped = vi.fn();
  const older = vi.fn();
  const newer = vi.fn();
  function Scoped() {
    const ref = useRef<HTMLDivElement>(null);
    useHotkeys({ '/': scoped }, { ref });
    return (
      <div ref={ref}>
        <button>Inside</button>
      </div>
    );
  }
  function Global({ handler }: { handler: () => void }) {
    useHotkeys({ '/': handler });
    return null;
  }
  const view = render(
    <>
      <Scoped />
      <Global handler={older} />
      <Global handler={newer} />
      <button>Outside</button>
    </>,
  );
  const [inside, outside] = view.getAllByRole('button');
  inside!.focus();
  fireEvent.keyDown(inside!, { key: '/' });
  expect(scoped).toHaveBeenCalledTimes(1);
  expect(newer).not.toHaveBeenCalled();
  outside!.focus();
  fireEvent.keyDown(outside!, { key: '/' });
  expect(newer).toHaveBeenCalledTimes(1);
  expect(scoped).toHaveBeenCalledTimes(1);
  expect(older).not.toHaveBeenCalled();
});

it('blocks global characters in a modal but preserves mod+k and scoped characters', () => {
  vi.stubGlobal('navigator', { platform: 'MacIntel' });
  const character = vi.fn();
  const command = vi.fn();
  const scoped = vi.fn();
  function Modal() {
    const ref = useRef<HTMLDivElement>(null);
    useHotkeys({ '/': scoped }, { ref });
    return (
      <div ref={ref} role="dialog" aria-modal="true">
        <button>Focus</button>
      </div>
    );
  }
  renderHook(() => useHotkeys({ 'g d': character, '?': character, 'mod+k': command }));
  const view = render(<Modal />);
  const target = view.getByRole('button');
  target.focus();
  fireEvent.keyDown(target, { key: 'g' });
  fireEvent.keyDown(target, { key: 'd' });
  fireEvent.keyDown(target, { key: '?', shiftKey: true });
  fireEvent.keyDown(target, { key: 'k', metaKey: true });
  fireEvent.keyDown(target, { key: '/' });
  expect(character).not.toHaveBeenCalled();
  expect(command).toHaveBeenCalledTimes(1);
  expect(scoped).toHaveBeenCalledTimes(1);
});

it('switches global character bindings off and on while preserving commands', () => {
  vi.stubGlobal('navigator', { platform: 'MacIntel' });
  const character = vi.fn();
  const command = vi.fn();
  renderHook(() => useHotkeys({ '/': character, 'g d': character, 'mod+k': command }));
  const keys = () => {
    for (const key of ['/', 'g', 'd']) fireEvent.keyDown(document.body, { key });
    fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
  };
  setCharacterHotkeysEnabled(false);
  keys();
  expect(character).not.toHaveBeenCalled();
  expect(command).toHaveBeenCalledTimes(1);
  setCharacterHotkeysEnabled(true);
  keys();
  expect(character).toHaveBeenCalledTimes(2);
  expect(command).toHaveBeenCalledTimes(2);
});

it('keeps scoped sequences active when the global character switch changes between steps', () => {
  const scoped = vi.fn();
  function Scope() {
    const ref = useRef<HTMLDivElement>(null);
    useHotkeys({ 'g d': scoped }, { ref });
    return (
      <div ref={ref}>
        <button>Focus</button>
      </div>
    );
  }
  const view = render(<Scope />);
  const button = view.getByRole('button');
  button.focus();
  fireEvent.keyDown(button, { key: 'g' });
  setCharacterHotkeysEnabled(false);
  fireEvent.keyDown(button, { key: 'd' });
  expect(scoped).toHaveBeenCalledTimes(1);
});

it('publishes shortcut-sheet metadata on mount, updates and unmount with stable snapshots', () => {
  const store = renderHook(() => useRegisteredHotkeys());
  const empty = store.result.current;
  const bindings = renderHook(
    ({ description }) =>
      useHotkeys({
        'mod+k': { handler: () => {}, description, group: 'General' },
        'g d': { handler: () => {}, description: 'Go to deployments', group: 'Navigation' },
      }),
    { initialProps: { description: 'Open the command palette' } },
  );
  expect(store.result.current).toEqual([
    { hotkey: 'mod+k', keys: ['mod', 'K'], description: 'Open the command palette', group: 'General' },
    { hotkey: 'g d', keys: ['G'], then: ['D'], description: 'Go to deployments', group: 'Navigation' },
  ]);
  const mounted = store.result.current;
  bindings.rerender({ description: 'Open the command palette' });
  expect(store.result.current).toBe(mounted);
  bindings.rerender({ description: 'Updated description' });
  expect(store.result.current[0]?.description).toBe('Updated description');
  bindings.unmount();
  expect(store.result.current).toEqual(empty);
});

it('renders on the server without document or navigator access', () => {
  function Server() {
    useHotkeys({ 'mod+k': () => {} });
    return <span>{useRegisteredHotkeys().length}</span>;
  }
  vi.stubGlobal('document', undefined);
  vi.stubGlobal('navigator', undefined);
  expect(renderToString(<Server />)).toBe('<span>0</span>');
  vi.unstubAllGlobals();
});

it('resolves mod at event time and updates map keys without another listener', () => {
  const handler = vi.fn();
  const { rerender } = renderHook(({ key }) => useHotkeys({ [key]: handler }), { initialProps: { key: 'mod+k' } });
  vi.stubGlobal('navigator', { platform: 'MacIntel' });
  fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
  vi.stubGlobal('navigator', { platform: 'Win32' });
  fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
  rerender({ key: '/' });
  fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
  fireEvent.keyDown(document.body, { key: '/' });
  expect(handler).toHaveBeenCalledTimes(3);
});

it('warns about ambiguous sequence prefixes once in development, firing the single immediately', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const single = vi.fn();
  const sequence = vi.fn();
  const bindings = renderHook(() => useHotkeys({ g: single, 'g d': sequence }));
  bindings.rerender();
  expect(warn).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(document.body, { key: 'g' });
  expect(single).toHaveBeenCalledTimes(1);
  expect(sequence).not.toHaveBeenCalled();
  fireEvent.keyDown(document.body, { key: 'd' });
  expect(sequence).toHaveBeenCalledTimes(1);
});

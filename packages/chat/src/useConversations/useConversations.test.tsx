import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import type { ChatThreadMessage } from '../useChat';
import { useConversations, type ChatConversation } from './index';

const c1: ChatConversation = { id: 'c1', title: 'First chat', updatedAt: 1 };
const c2: ChatConversation = { id: 'c2', title: 'Second chat', updatedAt: '2026-11-01' };
const c3: ChatConversation = { id: 'c3', title: 'New chat', updatedAt: new Date('2026-11-01') };

it('starts empty and adds conversations at either end while rejecting duplicate ids', () => {
  const empty = renderHook(() => useConversations());
  expect(empty.result.current.conversations).toEqual([]);
  expect(empty.result.current.activeId).toBeNull();
  const { result } = renderHook(() => useConversations({ defaultConversations: [c1, c2] }));
  act(() => expect(result.current.addConversation(c3)).toBe(true));
  expect(result.current.conversations).toEqual([c3, c1, c2]);
  const previous = result.current.conversations;
  act(() => expect(result.current.addConversation(c1)).toBe(false));
  expect(result.current.conversations).toBe(previous);
  expect(result.current.getConversation('c1')).toBe(c1);
  expect(result.current.getConversation('missing')).toBeUndefined();
  const appended = renderHook(() => useConversations({ defaultConversations: [c1, c2] }));
  act(() => expect(appended.result.current.addConversation(c3, 'append')).toBe(true));
  expect(appended.result.current.conversations).toEqual([c1, c2, c3]);
});

it('stores messages by reference without rendering, shares a frozen empty array and cleans up on removal', () => {
  let renders = 0;
  const onConversationsChange = vi.fn();
  const { result } = renderHook(() => {
    renders += 1;
    return useConversations({ defaultConversations: [c1, c2], onConversationsChange });
  });
  const empty = result.current.getMessages('missing');
  expect(empty).toEqual([]);
  expect(Object.isFrozen(empty)).toBe(true);
  expect(result.current.getMessages('missing')).toBe(empty);
  expect(result.current.getMessages('c2')).toBe(empty);
  const messages: ChatThreadMessage[] = [
    {
      id: 'm1',
      role: 'user',
      parts: [{ type: 'text', id: 'text', text: 'Hello' }],
      status: 'done',
      createdAt: new Date(0),
    },
  ];
  const before = renders;
  act(() => result.current.setMessages('c1', messages));
  expect(result.current.getMessages('c1')).toBe(messages);
  expect(renders).toBe(before);
  expect(onConversationsChange).not.toHaveBeenCalled();
  act(() => result.current.removeConversation('c1'));
  expect(result.current.getMessages('c1')).toBe(empty);
});

it('isolates lists, active ids and generic message maps between instances', () => {
  const { result } = renderHook(() => ({
    first: useConversations<string>({ defaultConversations: [c1], defaultActiveId: 'c1' }),
    second: useConversations<string>({ defaultConversations: [c1], defaultActiveId: 'c1' }),
  }));
  act(() => {
    result.current.first.addConversation(c2);
    result.current.first.setMessages('c1', ['First history']);
    result.current.second.setMessages('c1', ['Second history']);
    result.current.first.setActiveId('c2');
  });
  expect(result.current.first.conversations).toEqual([c2, c1]);
  expect(result.current.second.conversations).toEqual([c1]);
  expect(result.current.first.getMessages('c1')).toEqual(['First history']);
  expect(result.current.second.getMessages('c1')).toEqual(['Second history']);
  expect(result.current.first.activeId).toBe('c2');
  expect(result.current.second.activeId).toBe('c1');
  act(() => result.current.first.removeConversation('c1'));
  expect(result.current.second.getMessages('c1')).toEqual(['Second history']);
});

it('reports each list mutation exactly once in StrictMode, including mutations batched in one event', () => {
  const onConversationsChange = vi.fn();
  const { result } = renderHook(() => useConversations({ defaultConversations: [c1, c2], onConversationsChange }), {
    wrapper: StrictMode,
  });
  expect(onConversationsChange).not.toHaveBeenCalled();
  act(() => {
    result.current.addConversation(c3);
    result.current.addConversation(c1);
    result.current.setConversation('c1', { title: 'Renamed' });
    result.current.setConversation('missing', { title: 'Ignored' });
    result.current.removeConversation('c2');
    result.current.removeConversation('missing');
    result.current.setConversations([c2]);
  });
  expect(onConversationsChange.mock.calls).toEqual([
    [[c3, c1, c2]],
    [[c3, { ...c1, title: 'Renamed' }, c2]],
    [[c3, { ...c1, title: 'Renamed' }]],
    [[c2]],
  ]);
  expect(result.current.conversations).toEqual([c2]);
  expect(result.current.getConversation('c1')).toBeUndefined();
  expect(result.current.getConversation('c2')).toBe(c2);
});

it('moves active selection to the next item, then previous, then null on removal', () => {
  const onActiveChange = vi.fn();
  const { result } = renderHook(() =>
    useConversations({
      defaultConversations: [c1, c2, c3],
      defaultActiveId: 'c2',
      onActiveChange,
    }),
  );
  act(() => result.current.removeConversation('c2'));
  expect(result.current.conversations).toEqual([c1, c3]);
  expect(result.current.activeId).toBe('c3');
  act(() => result.current.removeConversation('c3'));
  expect(result.current.activeId).toBe('c1');
  act(() => result.current.removeConversation('c1'));
  expect(result.current.conversations).toEqual([]);
  expect(result.current.activeId).toBeNull();
  expect(onActiveChange.mock.calls).toEqual([['c3'], ['c1'], [null]]);
});

it('does not change selection for non-active or unknown removals', () => {
  const onActiveChange = vi.fn();
  const onConversationsChange = vi.fn();
  const { result } = renderHook(() =>
    useConversations({
      defaultConversations: [c1, c2],
      defaultActiveId: 'c2',
      onActiveChange,
      onConversationsChange,
    }),
  );
  act(() => result.current.removeConversation('c1'));
  expect(result.current.activeId).toBe('c2');
  expect(result.current.conversations).toEqual([c2]);
  expect(onConversationsChange).toHaveBeenCalledExactlyOnceWith([c2]);
  const previous = result.current.conversations;
  act(() => result.current.removeConversation('missing'));
  expect(result.current.conversations).toBe(previous);
  expect(onConversationsChange).toHaveBeenCalledTimes(1);
  expect(onActiveChange).not.toHaveBeenCalled();
});

it('requests the next active id on controlled removal while preserving the controlled value', () => {
  const onActiveChange = vi.fn();
  const { result } = renderHook(() =>
    useConversations({
      defaultConversations: [c1, c2],
      activeId: 'c1',
      onActiveChange,
    }),
  );
  act(() => result.current.removeConversation('c1'));
  expect(result.current.activeId).toBe('c1');
  expect(onActiveChange).toHaveBeenCalledExactlyOnceWith('c2');
});

it('selects known ids or null from the default active id and ignores unknown ids', () => {
  const onActiveChange = vi.fn();
  const { result } = renderHook(() =>
    useConversations({ defaultConversations: [c1, c2], defaultActiveId: 'c1', onActiveChange }),
  );
  expect(result.current.activeId).toBe('c1');
  expect(onActiveChange).not.toHaveBeenCalled();
  act(() => result.current.setActiveId('missing'));
  expect(result.current.activeId).toBe('c1');
  expect(onActiveChange).not.toHaveBeenCalled();
  act(() => result.current.setActiveId('c2'));
  expect(result.current.activeId).toBe('c2');
  expect(onActiveChange).toHaveBeenCalledExactlyOnceWith('c2');
  act(() => result.current.setActiveId(null));
  expect(result.current.activeId).toBeNull();
  expect(onActiveChange.mock.calls).toEqual([['c2'], [null]]);
});

it('reports controlled selection changes without changing the prop, including stale controlled ids', () => {
  const onActiveChange = vi.fn();
  const { result, rerender } = renderHook(
    ({ activeId }: { activeId: string | null }) =>
      useConversations({
        defaultConversations: [c1, c2],
        activeId,
        onActiveChange,
      }),
    { initialProps: { activeId: 'c1' as string | null }, wrapper: StrictMode },
  );
  act(() => result.current.setActiveId('c2'));
  expect(onActiveChange).toHaveBeenCalledExactlyOnceWith('c2');
  expect(result.current.activeId).toBe('c1');
  act(() => result.current.setActiveId('missing'));
  expect(onActiveChange).toHaveBeenCalledTimes(1);
  rerender({ activeId: 'c2' });
  expect(result.current.activeId).toBe('c2');
  rerender({ activeId: 'stale-url-id' });
  expect(result.current.activeId).toBe('stale-url-id');
  rerender({ activeId: null });
  expect(result.current.activeId).toBeNull();
  expect(onActiveChange).toHaveBeenCalledTimes(1);
});

it('patches only the chosen conversation, supplies its current value and preserves its id', () => {
  const onConversationsChange = vi.fn();
  const { result } = renderHook(() => useConversations({ defaultConversations: [c1, c2], onConversationsChange }));
  expect(onConversationsChange).not.toHaveBeenCalled();
  act(() => result.current.setConversation('c1', { title: 'Renamed' }));
  expect(result.current.conversations).toEqual([{ ...c1, title: 'Renamed' }, c2]);
  expect(result.current.conversations[1]).toBe(c2);
  expect(onConversationsChange).toHaveBeenCalledExactlyOnceWith(result.current.conversations);
  const updater = vi.fn((current: ChatConversation) => ({ title: `${current.title} again`, preview: 'Saved' }));
  act(() => result.current.setConversation('c1', updater));
  expect(updater).toHaveBeenCalledExactlyOnceWith({ ...c1, title: 'Renamed' });
  expect(result.current.getConversation('c1')).toEqual({ ...c1, title: 'Renamed again', preview: 'Saved' });
  const patch = { id: 'different', title: 'Still c1' };
  act(() => result.current.setConversation('c1', patch));
  expect(result.current.getConversation('c1')).toEqual({ ...c1, title: 'Still c1', preview: 'Saved' });
  const previous = result.current.conversations;
  onConversationsChange.mockClear();
  updater.mockClear();
  act(() => result.current.setConversation('missing', updater));
  expect(result.current.conversations).toBe(previous);
  expect(updater).not.toHaveBeenCalled();
  expect(onConversationsChange).not.toHaveBeenCalled();
});

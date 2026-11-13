import { act, renderHook } from '@testing-library/react';
import { useStateHistory } from './useStateHistory';

describe('useStateHistory', () => {
  it('goes back, then forward, and a new set drops the redo steps', () => {
    const { result } = renderHook(() => useStateHistory(0));
    act(() => {
      result.current.set(1);
      result.current.set(2);
    });
    act(() => {
      result.current.back();
    });
    expect(result.current.value).toBe(1);
    expect(result.current.canForward).toBe(true);
    act(() => {
      result.current.forward();
    });
    expect(result.current.value).toBe(2);
    expect(result.current.canForward).toBe(false);
    act(() => {
      result.current.back();
      result.current.set(3);
    });
    expect(result.current.value).toBe(3);
    expect(result.current.canForward).toBe(false);
    expect(result.current.length).toBe(3);
    expect(result.current.index).toBe(2);
  });

  it('lists every recorded value, oldest first', () => {
    const { result } = renderHook(() => useStateHistory('a'));
    act(() => {
      result.current.set('b');
      result.current.set('c');
      result.current.back();
    });
    expect(result.current.values).toEqual(['a', 'b', 'c']);
    expect(result.current.index).toBe(1);
  });

  it('starts with one step and cannot move past either end', () => {
    const { result } = renderHook(() => useStateHistory('a'));
    expect(result.current).toMatchObject({ value: 'a', index: 0, length: 1, canBack: false, canForward: false });
    let crossed: string | undefined = 'unset';
    act(() => {
      crossed = result.current.back();
    });
    expect(crossed).toBeUndefined();
    expect(result.current.value).toBe('a');
  });

  it('closes the coalescing batch on a forward that goes nowhere', () => {
    const { result } = renderHook(() => useStateHistory('Draft'));
    act(() => result.current.set('D', { coalesce: 'title' }));
    act(() => {
      result.current.forward();
    });
    act(() => result.current.set('Do', { coalesce: 'title' }));
    expect(result.current.length).toBe(3);
  });

  it('reset empties the history and keeps the current value, or a given one', () => {
    const { result } = renderHook(() => useStateHistory(0));
    act(() => {
      result.current.set(1);
      result.current.set(2);
    });
    act(() => result.current.reset());
    expect(result.current).toMatchObject({ value: 2, index: 0, length: 1, canBack: false });
    act(() => result.current.reset(9));
    expect(result.current).toMatchObject({ value: 9, index: 0, length: 1 });
  });

  it('keeps only the last `limit` values', () => {
    const { result } = renderHook(() => useStateHistory(0, { limit: 3 }));
    act(() => {
      for (const n of [1, 2, 3, 4, 5]) result.current.set(n);
    });
    expect(result.current.length).toBe(3);
    expect(result.current.value).toBe(5);
    act(() => {
      result.current.back();
      result.current.back();
    });
    expect(result.current.value).toBe(3);
    expect(result.current.canBack).toBe(false);
  });

  it('merges sets that share a coalesce key into one step', () => {
    const { result } = renderHook(() => useStateHistory('Draft'));
    act(() => {
      result.current.set('D', { coalesce: 'title' });
      result.current.set('Do', { coalesce: 'title' });
      result.current.set('Doc', { coalesce: 'title' });
    });
    expect(result.current.length).toBe(2);
    expect(result.current.value).toBe('Doc');
    act(() => {
      result.current.back();
    });
    expect(result.current.value).toBe('Draft');
    expect(result.current.canForward).toBe(true);
  });

  it('closes a coalesced batch on a different set, back or forward', () => {
    const { result } = renderHook(() => useStateHistory('Draft'));
    act(() => {
      result.current.set('D', { coalesce: 'title' });
      result.current.set('other');
      result.current.set('Do', { coalesce: 'title' });
    });
    expect(result.current.length).toBe(4);
    act(() => {
      result.current.back();
      result.current.forward();
      result.current.set('Dog', { coalesce: 'title' });
    });
    expect(result.current.length).toBe(5);
  });

  it('returns the label of the step each move crosses', () => {
    const { result } = renderHook(() => useStateHistory(0));
    act(() => {
      result.current.set(1, { label: 'add' });
      result.current.set(2, { label: 'delete' });
    });
    const crossed: (string | undefined)[] = [];
    act(() => {
      crossed.push(result.current.back());
      crossed.push(result.current.back());
      crossed.push(result.current.forward());
    });
    expect(crossed).toEqual(['delete', 'add', 'add']);
  });
});

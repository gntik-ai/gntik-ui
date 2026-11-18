import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PageToolbar } from './PageToolbar';

const box = () => screen.getByRole('searchbox');
const type = (text: string) => fireEvent.change(box(), { target: { value: text } });
const wait = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

afterEach(() => vi.useRealTimers());

describe('PageToolbar searchDebounceMs', () => {
  it('updates the input on every keystroke and calls onSearchChange once with the full text', () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();
    render(<PageToolbar searchDebounceMs={250} onSearchChange={onSearchChange} />);
    for (const text of ['a', 'ap', 'api']) {
      type(text);
      expect(box()).toHaveValue(text);
      wait(100);
    }
    expect(onSearchChange).not.toHaveBeenCalled();
    wait(150);
    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenCalledWith('api');
  });

  it('flushes on Enter and calls nothing more when the delay would have ended', () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();
    render(<PageToolbar searchDebounceMs={250} onSearchChange={onSearchChange} />);
    type('api');
    fireEvent.keyDown(box(), { key: 'Enter' });
    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenCalledWith('api');
    wait(500);
    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it('reports an emptied input at once and drops the pending text', () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();
    render(<PageToolbar searchDebounceMs={250} onSearchChange={onSearchChange} />);
    type('api');
    type('');
    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenCalledWith('');
    wait(500);
    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it('flushes the pending text on unmount', () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();
    const { unmount } = render(<PageToolbar searchDebounceMs={250} onSearchChange={onSearchChange} />);
    type('api');
    unmount();
    expect(onSearchChange).toHaveBeenCalledWith('api');
    wait(500);
    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it('lets a controlled value changed from outside replace the draft', () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();
    const { rerender } = render(<PageToolbar searchDebounceMs={250} search="" onSearchChange={onSearchChange} />);
    type('ap');
    rerender(<PageToolbar searchDebounceMs={250} search="external" onSearchChange={onSearchChange} />);
    expect(box()).toHaveValue('external');
    wait(500);
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('keeps calling onSearchChange on every keystroke when the prop is unset', () => {
    const onSearchChange = vi.fn();
    render(<PageToolbar onSearchChange={onSearchChange} />);
    type('a');
    type('ap');
    expect(onSearchChange.mock.calls).toEqual([['a'], ['ap']]);
  });
});

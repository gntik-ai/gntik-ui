import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FilterBar } from './FilterBar';

const box = () => screen.getByRole('searchbox', { name: 'Search' });
const type = (text: string) => fireEvent.change(box(), { target: { value: text } });
const wait = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

afterEach(() => vi.useRealTimers());

describe('FilterBar queryDebounceMs', () => {
  it('shows every keystroke at once and calls onQueryChange once with the full text', () => {
    vi.useFakeTimers();
    const onQueryChange = vi.fn();
    render(<FilterBar queryDebounceMs={250} onQueryChange={onQueryChange} />);
    for (const text of ['r', 'ru', 'run']) {
      type(text);
      expect(box()).toHaveValue(text);
      wait(100);
    }
    expect(onQueryChange).not.toHaveBeenCalled();
    wait(149);
    expect(onQueryChange).not.toHaveBeenCalled();
    wait(1);
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenCalledWith('run');
  });

  it('flushes at once on Enter and does not repeat when the delay would have ended', () => {
    vi.useFakeTimers();
    const onQueryChange = vi.fn();
    render(<FilterBar queryDebounceMs={250} onQueryChange={onQueryChange} />);
    type('api');
    fireEvent.keyDown(box(), { key: 'Enter' });
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenCalledWith('api');
    wait(500);
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it('replaces a pending value with an empty query on Clear all', () => {
    vi.useFakeTimers();
    const onQueryChange = vi.fn();
    render(<FilterBar queryDebounceMs={250} onQueryChange={onQueryChange} />);
    type('ru');
    wait(100);
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenCalledWith('');
    expect(box()).toHaveValue('');
    wait(500);
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it('clears at once with Escape', () => {
    vi.useFakeTimers();
    const onQueryChange = vi.fn();
    render(<FilterBar queryDebounceMs={250} onQueryChange={onQueryChange} />);
    type('ru');
    fireEvent.keyDown(box(), { key: 'Escape' });
    expect(onQueryChange).toHaveBeenLastCalledWith('');
    wait(500);
    expect(onQueryChange).not.toHaveBeenCalledWith('ru');
  });

  it('replaces a pending value when a saved view applies its query', async () => {
    const onQueryChange = vi.fn();
    render(
      <FilterBar
        queryDebounceMs={150}
        onQueryChange={onQueryChange}
        views={[{ value: 'v', label: 'Errors', query: 'error', filters: [] }]}
      />,
    );
    type('ru');
    fireEvent.click(screen.getByRole('combobox', { name: 'Saved view' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Errors' }));
    expect(onQueryChange).toHaveBeenLastCalledWith('error');
    expect(box()).toHaveValue('error');
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(onQueryChange).not.toHaveBeenCalledWith('ru');
  });

  it('flushes the pending value on unmount', () => {
    vi.useFakeTimers();
    const onQueryChange = vi.fn();
    const { unmount } = render(<FilterBar queryDebounceMs={250} onQueryChange={onQueryChange} />);
    type('ru');
    unmount();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenCalledWith('ru');
    wait(500);
    expect(onQueryChange).toHaveBeenCalledTimes(1);
  });

  it('lets a controlled value changed from outside replace the draft', () => {
    vi.useFakeTimers();
    const onQueryChange = vi.fn();
    const { rerender } = render(<FilterBar queryDebounceMs={250} query="" onQueryChange={onQueryChange} />);
    type('ru');
    rerender(<FilterBar queryDebounceMs={250} query="external" onQueryChange={onQueryChange} />);
    expect(box()).toHaveValue('external');
    wait(500);
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it('keeps calling onQueryChange on every keystroke when the prop is unset', () => {
    const onQueryChange = vi.fn();
    render(<FilterBar onQueryChange={onQueryChange} />);
    type('r');
    type('ru');
    expect(onQueryChange.mock.calls).toEqual([['r'], ['ru']]);
  });
});

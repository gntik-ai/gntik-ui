import { simulateUpload } from './fixtures';

it('stops the demo timer and rejects on abort, including an already aborted signal', async () => {
  vi.useFakeTimers();
  try {
    const controller = new AbortController();
    const progress = vi.fn();
    const pending = simulateUpload(new File(['x'], 'report.csv'), progress, { signal: controller.signal, id: 'demo' });
    const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(250);
    expect(progress).toHaveBeenLastCalledWith(20);
    controller.abort();
    expect(vi.getTimerCount()).toBe(0);
    await rejected;
    await vi.advanceTimersByTimeAsync(2000);
    expect(progress).toHaveBeenCalledTimes(1);
    await expect(
      simulateUpload(new File([], 'empty.csv'), progress, { signal: controller.signal, id: 'aborted' }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

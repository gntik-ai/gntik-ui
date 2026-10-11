import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureMonacoWorkers } from './workers';

type Scope = { MonacoEnvironment?: Record<string, unknown> };

describe('configureMonacoWorkers', () => {
  afterEach(() => {
    delete (globalThis as Scope).MonacoEnvironment;
  });

  it('forwards the yaml label to the consumer factory without choosing or importing a worker', async () => {
    const worker = {} as Worker;
    const factory = vi.fn((_id: string, label: string) => (label === 'yaml' ? worker : Promise.resolve(worker)));
    configureMonacoWorkers(factory);
    const getWorker = (
      globalThis as unknown as {
        MonacoEnvironment: { getWorker: typeof factory };
      }
    ).MonacoEnvironment.getWorker;
    expect(await getWorker('yaml-id', 'yaml')).toBe(worker);
    expect(factory).toHaveBeenCalledExactlyOnceWith('yaml-id', 'yaml');
  });

  it('sets MonacoEnvironment.getWorker and keeps other settings', () => {
    (globalThis as Scope).MonacoEnvironment = { globalAPI: false };
    const getWorker = vi.fn();
    configureMonacoWorkers(getWorker);
    expect((globalThis as Scope).MonacoEnvironment).toEqual({
      globalAPI: false,
      getWorker,
    });
  });
});

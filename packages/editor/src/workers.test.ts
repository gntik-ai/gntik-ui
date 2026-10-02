import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureMonacoWorkers } from './workers';

type Scope = { MonacoEnvironment?: Record<string, unknown> };

describe('configureMonacoWorkers', () => {
  afterEach(() => {
    delete (globalThis as Scope).MonacoEnvironment;
  });

  it('sets MonacoEnvironment.getWorker and keeps other settings', () => {
    (globalThis as Scope).MonacoEnvironment = { globalAPI: false };
    const getWorker = vi.fn();
    configureMonacoWorkers(getWorker);
    expect((globalThis as Scope).MonacoEnvironment).toEqual({ globalAPI: false, getWorker });
  });
});

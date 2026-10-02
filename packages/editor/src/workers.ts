/** Worker factory Monaco calls per language service (`label` is e.g. "json", "typescript"). */
export type MonacoWorkerFactory = (workerId: string, label: string) => Worker | Promise<Worker>;

interface MonacoEnvironmentLike {
  getWorker?: MonacoWorkerFactory;
  [key: string]: unknown;
}

/**
 * Sets `self.MonacoEnvironment.getWorker`. Call once, before the first editor mounts.
 * The package never imports workers itself: bundlers resolve them differently
 * (see README for the Vite `?worker` recipe).
 */
export function configureMonacoWorkers(getWorker: MonacoWorkerFactory): void {
  const scope = globalThis as unknown as { MonacoEnvironment?: MonacoEnvironmentLike };
  scope.MonacoEnvironment = { ...scope.MonacoEnvironment, getWorker };
}

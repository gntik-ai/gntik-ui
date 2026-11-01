import type { ChatAdapter } from '../types';

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}

/** Experimental demo adapter: echoes the last user's text, with abortable delays (default 100 ms).
 * @experimental
 */
export function createEchoAdapter({ delayMs = 100 }: { delayMs?: number } = {}): ChatAdapter {
  return {
    async sendMessage({ messages, signal }) {
      const text =
        [...messages]
          .reverse()
          .find((m) => m.role === 'user')
          ?.parts.filter((p) => p.type === 'text')
          .map((p) => p.text)
          .join('') ?? '';
      return (async function* () {
        await wait(delayMs, signal);
        yield { type: 'start' };
        await wait(delayMs, signal);
        yield { type: 'text-delta', id: 'echo', delta: text };
        await wait(delayMs, signal);
        yield { type: 'finish' };
      })();
    },
  };
}

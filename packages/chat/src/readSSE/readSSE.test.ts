import { describe, expect, it, vi } from 'vitest';
import { readSSE, readTextParts, type SSEMessage } from './index';

const encoder = new TextEncoder();
const bytes = (text: string) => encoder.encode(text);

type Chunk = string | Uint8Array;

interface StreamOptions {
  /** Called by the stream's underlying source when the reader is cancelled. */
  cancel?: (reason?: unknown) => void;
  /** Keep the stream open after the last chunk, like a live connection. */
  hang?: boolean;
  /** Error the stream after the last chunk. */
  fail?: Error;
}

/** A pull-based byte stream, so cancellation reaches the source's cancel callback. */
function streamOf(chunks: Chunk[], options: StreamOptions = {}) {
  let index = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      const chunk = chunks[index++];
      if (chunk !== undefined) controller.enqueue(typeof chunk === 'string' ? bytes(chunk) : chunk);
      else if (options.fail) controller.error(options.fail);
      else if (!options.hang) controller.close();
      else return new Promise<void>(() => {});
    },
    cancel: options.cancel,
  });
}

async function collect<T>(iterable: AsyncIterable<T>) {
  const out: T[] = [];
  for await (const item of iterable) out.push(item);
  return out;
}

const messages = (body: Chunk[] | string) => collect(readSSE(streamOf(typeof body === 'string' ? [body] : body)));
const parts = (body: string, separator?: string) =>
  collect(readTextParts(streamOf([body]), separator === undefined ? {} : { separator }));

const m = (data: string, extra: Partial<SSEMessage> = {}): SSEMessage => ({
  event: 'message',
  data,
  id: '',
  ...extra,
});

describe('readSSE parsing', () => {
  it('yields one message per blank-line-terminated block', async () => {
    const body = 'event: delta\ndata: {"t":"Hel"}\n\ndata: lo\ndata: world\n\n';
    expect(await messages(body)).toStrictEqual([
      { event: 'delta', data: '{"t":"Hel"}', id: '' },
      { event: 'message', data: 'lo\nworld', id: '' },
    ]);
  });

  it('ignores comment lines between messages', async () => {
    expect(await messages(': ping\ndata: a\n\n: ping\n: again\n\ndata: b\n\n')).toStrictEqual([m('a'), m('b')]);
  });

  it('strips exactly one space after the colon and accepts a field without a colon', async () => {
    expect(await messages('data:  two\n\ndata:none\n\ndata\n\n')).toStrictEqual([m(' two'), m('none'), m('')]);
  });

  it('ignores unknown fields and a block without data', async () => {
    expect(await messages('foo: bar\nevent: x\n\ndata: a\nfoo: bar\n\n')).toStrictEqual([m('a')]);
  });

  it('does not leak the event name of a data-less block into the next message', async () => {
    expect(await messages('event: lost\n\ndata: a\n\n')).toStrictEqual([m('a')]);
  });

  it('keeps a colon inside the value', async () => {
    expect(await messages('data: a:b: c\n\n')).toStrictEqual([m('a:b: c')]);
  });

  it('carries id to its message and every later one until the next id', async () => {
    const body = 'id: 42\ndata: a\n\ndata: b\n\nid: 43\ndata: c\n\n';
    expect((await messages(body)).map((x) => x.id)).toStrictEqual(['42', '42', '43']);
  });

  it('ignores an id containing U+0000', async () => {
    const body = 'id: 7\ndata: a\n\nid: 8\u00009\ndata: b\n\n';
    expect((await messages(body)).map((x) => x.id)).toStrictEqual(['7', '7']);
  });

  it('reports a digits-only retry and ignores anything else', async () => {
    expect(await messages('retry: 3000\ndata: a\n\nretry: 3s\ndata: b\n\nretry:\ndata: c\n\n')).toStrictEqual([
      m('a', { retry: 3000 }),
      m('b'),
      m('c'),
    ]);
  });

  it('carries the retry of a data-less block to the next message', async () => {
    expect(await messages('retry: 1500\n\ndata: a\n\ndata: b\n\n')).toStrictEqual([m('a', { retry: 1500 }), m('b')]);
  });

  it('drops an unterminated final block and an unterminated line', async () => {
    expect(await messages('data: a\n\ndata: b\n')).toStrictEqual([m('a')]);
    expect(await messages('data: a\n\ndata: b')).toStrictEqual([m('a')]);
  });

  it('drops a leading BOM so the first field survives', async () => {
    expect(await messages([new Uint8Array([0xef, 0xbb, 0xbf]), 'event: x\ndata: a\n\n'])).toStrictEqual([
      { event: 'x', data: 'a', id: '' },
    ]);
  });

  it('parses CR-only, CRLF and mixed line endings like LF', async () => {
    const expected = [{ event: 'x', data: 'a\nb', id: '' }, m('c')];
    expect(await messages('event: x\rdata: a\rdata: b\r\rdata: c\r\r')).toStrictEqual(expected);
    expect(await messages('event: x\r\ndata: a\r\ndata: b\r\n\r\ndata: c\r\n\r\n')).toStrictEqual(expected);
    expect(await messages('event: x\ndata: a\r\ndata: b\r\rdata: c\n\n')).toStrictEqual(expected);
  });

  it('yields OpenAI-style [DONE] as plain data', async () => {
    const body = 'data: {"delta":"Hi"}\n\ndata: {"delta":"!"}\n\ndata: [DONE]\n\n';
    const out = await messages(body);
    expect(out.map((x) => x.data)).toStrictEqual(['{"delta":"Hi"}', '{"delta":"!"}', '[DONE]']);
  });
});

describe('readSSE chunk boundaries', () => {
  const sample = 'event: delta\r\nid: 9\r\ndata: café\r\n\r\n: ping\r\ndata: a\r\ndata: €\r\n\r\n';
  const expected: SSEMessage[] = [
    { event: 'delta', data: 'café', id: '9' },
    { event: 'message', data: 'a\n€', id: '9' },
  ];
  const all = bytes(sample);

  it('yields identical messages for the whole body at every split offset', async () => {
    expect(await messages([all])).toStrictEqual(expected);
    for (let at = 1; at < all.length; at++) {
      expect(await messages([all.slice(0, at), all.slice(at)]), `split at byte ${at}`).toStrictEqual(expected);
    }
  });

  it('yields identical messages one byte per chunk', async () => {
    expect(await messages([...all].map((b) => new Uint8Array([b])))).toStrictEqual(expected);
  });

  it('delivers data: café one byte at a time as a single message', async () => {
    const body = bytes('data: café\r\n\r\n');
    expect(await messages([...body].map((b) => new Uint8Array([b])))).toStrictEqual([m('café')]);
  });

  it('parses a CR-only body split at every offset', async () => {
    const cr = bytes('data: a\rdata: b\r\rdata: c\r\r');
    for (let at = 1; at < cr.length; at++) {
      expect(await messages([cr.slice(0, at), cr.slice(at)]), `split at byte ${at}`).toStrictEqual([m('a\nb'), m('c')]);
    }
  });

  it('keeps a BOM split across chunks out of the first field', async () => {
    const out = await messages([new Uint8Array([0xef]), new Uint8Array([0xbb]), new Uint8Array([0xbf]), 'data: a\n\n']);
    expect(out).toStrictEqual([m('a')]);
  });
});

describe('readSSE sources', () => {
  it('reads the body of a Response', async () => {
    const response = new Response(streamOf(['data: a\n\n']));
    expect(await collect(readSSE(response))).toStrictEqual([m('a')]);
  });

  it('throws a TypeError for a Response without a body', async () => {
    await expect(collect(readSSE(new Response(null)))).rejects.toBeInstanceOf(TypeError);
  });

  it('only needs getReader(), not async iteration of the stream', async () => {
    const stream = streamOf(['data: a\n\n']);
    Object.defineProperty(stream, Symbol.asyncIterator, {
      get() {
        throw new Error('async iteration of ReadableStream must not be used');
      },
    });
    expect(await collect(readSSE(stream))).toStrictEqual([m('a')]);
  });
});

describe('readSSE cancellation', () => {
  it('throws the AbortError and cancels the reader once when the signal aborts after the first message', async () => {
    const cancel = vi.fn();
    const controller = new AbortController();
    const seen: SSEMessage[] = [];
    let error: unknown;
    try {
      for await (const message of readSSE(streamOf(['data: a\n\ndata: b\n\n'], { cancel, hang: true }), {
        signal: controller.signal,
      })) {
        seen.push(message);
        controller.abort();
      }
    } catch (e) {
      error = e;
    }
    expect(seen).toStrictEqual([m('a')]);
    expect(error).toBe(controller.signal.reason);
    expect(error).toHaveProperty('name', 'AbortError');
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('throws a custom abort reason as given', async () => {
    const cancel = vi.fn();
    const controller = new AbortController();
    const reason = new Error('user pressed Stop');
    const run = collect(readSSE(streamOf([], { cancel, hang: true }), { signal: controller.signal }));
    controller.abort(reason);
    await expect(run).rejects.toBe(reason);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('stops while waiting for the next chunk', async () => {
    const cancel = vi.fn();
    const controller = new AbortController();
    const iterator = readSSE(streamOf(['data: a\n\n'], { cancel, hang: true }), { signal: controller.signal });
    expect((await iterator.next()).value).toStrictEqual(m('a'));
    const pending = iterator.next();
    controller.abort();
    await expect(pending).rejects.toHaveProperty('name', 'AbortError');
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('cancels a stream whose signal is already aborted without reading it', async () => {
    const cancel = vi.fn();
    const controller = new AbortController();
    controller.abort();
    await expect(
      collect(readSSE(streamOf(['data: a\n\n'], { cancel }), { signal: controller.signal })),
    ).rejects.toHaveProperty('name', 'AbortError');
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('cancels the reader once when the consumer breaks out of for await', async () => {
    const cancel = vi.fn();
    for await (const message of readSSE(streamOf(['data: a\n\ndata: b\n\n'], { cancel, hang: true }))) {
      expect(message.data).toBe('a');
      break;
    }
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('cancels the reader once on return()', async () => {
    const cancel = vi.fn();
    const iterator = readSSE(streamOf(['data: a\n\n'], { cancel, hang: true }));
    await iterator.next();
    await iterator.return(undefined);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('does not cancel a stream that ended on its own', async () => {
    const cancel = vi.fn();
    await collect(readSSE(streamOf(['data: a\n\n'], { cancel })));
    expect(cancel).not.toHaveBeenCalled();
  });

  it('rethrows a stream error', async () => {
    const failure = new Error('connection reset');
    await expect(collect(readSSE(streamOf(['data: a\n\n'], { fail: failure })))).rejects.toBe(failure);
  });
});

describe('maxBufferSize', () => {
  it('throws a RangeError and cancels the reader when a block grows past the limit', async () => {
    const cancel = vi.fn();
    const run = collect(
      readSSE(streamOf(['data: 1234567890\n', 'data: 1234567890\n', 'data: 1234567890\n'], { cancel, hang: true }), {
        maxBufferSize: 32,
      }),
    );
    await expect(run).rejects.toBeInstanceOf(RangeError);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('counts a long line without a terminator as pending', async () => {
    const cancel = vi.fn();
    await expect(
      collect(readSSE(streamOf(['data: ', 'x'.repeat(40)], { cancel, hang: true }), { maxBufferSize: 32 })),
    ).rejects.toBeInstanceOf(RangeError);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('does not count messages that were already dispatched', async () => {
    const body = Array.from({ length: 50 }, (_, i) => `data: message ${i}\n\n`).join('');
    expect(await collect(readSSE(streamOf([body]), { maxBufferSize: 32 }))).toHaveLength(50);
  });

  it('counts both characters of a CRLF line ending, also when split across chunks', async () => {
    for (const chunks of [['data:x\r\n'], ['data:x\r', '\n'], ['data:x', '\r\n']]) {
      const cancel = vi.fn();
      await expect(
        collect(readSSE(streamOf(chunks, { cancel, hang: true }), { maxBufferSize: 7 })),
      ).rejects.toBeInstanceOf(RangeError);
      expect(cancel).toHaveBeenCalledTimes(1);
      expect(await collect(readSSE(streamOf(chunks), { maxBufferSize: 8 }))).toStrictEqual([]);
    }
  });

  it('does not count the LF that follows the CR of a blank line', async () => {
    const body = ['data:x\r\n\r', '\ndata:y\r\n\r\n'];
    expect(await collect(readSSE(streamOf(body), { maxBufferSize: 8 }))).toStrictEqual([m('x'), m('y')]);
  });

  it('measures characters, not bytes', async () => {
    // 10 characters in 30 bytes, plus "data: " and a newline: 17 characters (37 bytes) pending.
    const body = 'data: ' + '€'.repeat(10) + '\n';
    await expect(collect(readSSE(streamOf([body], { hang: true }), { maxBufferSize: 16 }))).rejects.toBeInstanceOf(
      RangeError,
    );
    const ok = await collect(readSSE(streamOf([body + '\n']), { maxBufferSize: 17 }));
    expect(ok).toStrictEqual([m('€'.repeat(10))]);
  });

  it('delivers a message completed before an oversized block however the bytes are chunked', async () => {
    const body = 'data: a\n\n' + 'data: ' + 'x'.repeat(40) + '\n';
    for (const chunks of [[body], ['data: a\n\n', 'data: ' + 'x'.repeat(40) + '\n'], [...body]]) {
      const cancel = vi.fn();
      const received: SSEMessage[] = [];
      let failure: unknown;
      try {
        for await (const message of readSSE(streamOf(chunks, { cancel, hang: true }), { maxBufferSize: 32 })) {
          received.push(message);
        }
      } catch (error) {
        failure = error;
      }
      expect(received).toStrictEqual([m('a')]);
      expect(failure).toBeInstanceOf(RangeError);
      expect(cancel).toHaveBeenCalledTimes(1);
    }
  });

  it('defaults to 1,048,576 characters', async () => {
    const big = 'data: ' + 'x'.repeat(1_048_576) + '\n';
    await expect(collect(readSSE(streamOf([big], { hang: true })))).rejects.toBeInstanceOf(RangeError);
  });
});

describe('readTextParts', () => {
  it('yields one string per NDJSON line, skipping empty lines', async () => {
    expect(await parts('{"a":1}\n\n{"b":2}\n{"c":3}\n')).toStrictEqual(['{"a":1}', '{"b":2}', '{"c":3}']);
  });

  it('joins a line split across chunks', async () => {
    const out = await collect(readTextParts(streamOf(['{"a":1}\n{"b"', ':2}\n{"c":3}\n']), { separator: '\n' }));
    expect(out).toStrictEqual(['{"a":1}', '{"b":2}', '{"c":3}']);
  });

  it('joins a multi-byte character split across chunks', async () => {
    const all = bytes('café\nnaïve\n');
    for (let at = 1; at < all.length; at++) {
      const out = await collect(readTextParts(streamOf([all.slice(0, at), all.slice(at)])));
      expect(out, `split at byte ${at}`).toStrictEqual(['café', 'naïve']);
    }
  });

  it('supports a multi-character separator split across chunks', async () => {
    const out = await collect(readTextParts(streamOf(['one<', '|>two<|', '><|>three<|>']), { separator: '<|>' }));
    expect(out).toStrictEqual(['one', 'two', 'three']);
  });

  it('yields a final part that has no trailing separator', async () => {
    expect(await parts('a\nb')).toStrictEqual(['a', 'b']);
  });

  it('rejects an empty separator', async () => {
    await expect(parts('a', '')).rejects.toBeInstanceOf(TypeError);
  });

  it('accepts a Response and throws a TypeError when it has no body', async () => {
    expect(await collect(readTextParts(new Response(streamOf(['a\nb\n']))))).toStrictEqual(['a', 'b']);
    await expect(collect(readTextParts(new Response(null)))).rejects.toBeInstanceOf(TypeError);
  });

  it('cancels the reader on abort, on break and on stream errors', async () => {
    const abortCancel = vi.fn();
    const controller = new AbortController();
    const run = collect(
      readTextParts(streamOf([], { cancel: abortCancel, hang: true }), { signal: controller.signal }),
    );
    controller.abort();
    await expect(run).rejects.toHaveProperty('name', 'AbortError');
    expect(abortCancel).toHaveBeenCalledTimes(1);

    const breakCancel = vi.fn();
    for await (const part of readTextParts(streamOf(['a\nb\n'], { cancel: breakCancel, hang: true }))) {
      expect(part).toBe('a');
      break;
    }
    expect(breakCancel).toHaveBeenCalledTimes(1);

    const failure = new Error('boom');
    await expect(collect(readTextParts(streamOf(['a\n'], { fail: failure })))).rejects.toBe(failure);
  });

  it('throws a RangeError and cancels the reader when a part grows past the limit', async () => {
    const cancel = vi.fn();
    await expect(
      collect(readTextParts(streamOf(['x'.repeat(20), 'x'.repeat(20)], { cancel, hang: true }), { maxBufferSize: 32 })),
    ).rejects.toBeInstanceOf(RangeError);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('does not count a separator still arriving against the part limit', async () => {
    const whole = await collect(readTextParts(streamOf(['abc||']), { separator: '||', maxBufferSize: 3 }));
    const split = await collect(readTextParts(streamOf(['abc|', '|']), { separator: '||', maxBufferSize: 3 }));
    expect(whole).toStrictEqual(['abc']);
    expect(split).toStrictEqual(whole);
  });

  it('rejects a final part longer than the limit once the stream ends on a partial separator', async () => {
    await expect(
      collect(readTextParts(streamOf(['abc|']), { separator: '||', maxBufferSize: 3 })),
    ).rejects.toBeInstanceOf(RangeError);
    expect(await collect(readTextParts(streamOf(['abc|']), { separator: '||', maxBufferSize: 4 }))).toStrictEqual([
      'abc|',
    ]);
  });

  it('still rejects a part longer than the limit when a partial separator follows it', async () => {
    const cancel = vi.fn();
    await expect(
      collect(readTextParts(streamOf(['abcd|', '|'], { cancel, hang: true }), { separator: '||', maxBufferSize: 3 })),
    ).rejects.toBeInstanceOf(RangeError);
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});

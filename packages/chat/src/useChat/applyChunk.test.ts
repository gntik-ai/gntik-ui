import { applyChunk } from './applyChunk';
import type { ChatThreadMessage } from './types';

const message = (): ChatThreadMessage => ({
  id: 'a',
  role: 'assistant',
  parts: [],
  status: 'pending',
  createdAt: new Date(0),
});

describe('applyChunk', () => {
  it('merges text by id without mutating the previous message', () => {
    const initial = message();
    const started = applyChunk(initial, { type: 'start' });
    const text = applyChunk(started, { type: 'text-start', id: 'x' });
    const hello = applyChunk(applyChunk(text, { type: 'text-delta', id: 'x', delta: 'Hel' }), {
      type: 'text-delta',
      id: 'x',
      delta: 'lo',
    });
    expect(hello.parts).toEqual([{ type: 'text', id: 'x', text: 'Hello' }]);
    expect(initial.parts).toEqual([]);
    expect(started.status).toBe('streaming');
    expect(applyChunk(hello, { type: 'text-end', id: 'x' }).parts).toEqual(hello.parts);
  });
  it('updates reasoning, tools, sources, files, steps and terminal states from protocol chunks', () => {
    let reply = message();
    reply = applyChunk(reply, { type: 'reasoning-start', id: 'r' });
    reply = applyChunk(reply, { type: 'reasoning-delta', id: 'r', delta: 'Think' });
    reply = applyChunk(reply, { type: 'reasoning-end', id: 'r' });
    expect(reply.parts).toEqual([{ type: 'reasoning', id: 'r', text: 'Think', state: 'done' }]);
    reply = applyChunk(reply, {
      type: 'tool-input-available',
      toolCallId: 't1',
      toolName: 'search',
      input: { q: 'x' },
    });
    expect(reply.parts[1]).toMatchObject({ type: 'tool', status: 'running', input: { q: 'x' } });
    reply = applyChunk(reply, { type: 'tool-output-available', toolCallId: 't1', output: ['found'] });
    expect(reply.parts[1]).toMatchObject({ status: 'succeeded', output: ['found'], input: { q: 'x' } });
    reply = applyChunk(reply, { type: 'tool-output-error', toolCallId: 't1', errorText: 'Unavailable' });
    expect(reply.parts[1]).toMatchObject({ status: 'failed', errorText: 'Unavailable' });
    reply = applyChunk(reply, { type: 'source-url', sourceId: 's1', url: 'https://example.com', title: 'Example' });
    const once = reply;
    reply = applyChunk(reply, { type: 'source-url', sourceId: 's1', url: 'https://example.com' });
    expect(reply).toBe(once);
    expect(reply.parts[2]).toEqual({
      type: 'source',
      id: 's1',
      source: { title: 'Example', url: 'https://example.com' },
    });
    reply = applyChunk(reply, { type: 'file', url: '/report.txt', mediaType: 'text/plain', filename: 'report.txt' });
    expect(reply.parts[3]).toMatchObject({ type: 'file', file: { name: 'report.txt', previewUrl: '/report.txt' } });
    reply = applyChunk(applyChunk(reply, { type: 'start-step' }), { type: 'finish-step' });
    expect(reply.parts.slice(-2)).toEqual([
      { type: 'step', state: 'start' },
      { type: 'step', state: 'finish' },
    ]);
    expect(applyChunk(reply, { type: 'data-progress', data: 42 })).toBe(reply);
    expect(applyChunk(reply, { type: 'future-chunk' })).toBe(reply);
    expect(applyChunk(reply, { type: 'finish' }).status).toBe('done');
    expect(applyChunk(reply, { type: 'error', errorText: 'Offline' })).toMatchObject({
      status: 'error',
      error: 'Offline',
    });
    expect(applyChunk(reply, { type: 'abort' }).status).toBe('aborted');
  });
});

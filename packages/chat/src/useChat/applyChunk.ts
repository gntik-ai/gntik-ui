import type { ChatChunk, ChatMessagePart, ChatThreadMessage } from './types';

/** Experimental pure UI-stream reducer. Unknown chunk types leave the message unchanged.
 * @experimental
 */
export function applyChunk(message: ChatThreadMessage, chunk: ChatChunk): ChatThreadMessage {
  const c = chunk as { type: string; [key: string]: unknown };
  if (c.type === 'start') return { ...message, status: 'streaming' };
  if (
    ['text-start', 'text-delta', 'reasoning-start', 'reasoning-delta', 'reasoning-end'].includes(c.type) &&
    typeof c.id === 'string'
  ) {
    const id = c.id;
    const type = c.type.startsWith('reasoning') ? 'reasoning' : 'text';
    const delta = typeof c.delta === 'string' ? c.delta : '';
    const state: 'done' | 'streaming' = c.type === 'reasoning-end' ? 'done' : 'streaming';
    const exists = message.parts.some((p) => p.type === type && p.id === id);
    const part: ChatMessagePart = type === 'text' ? { type, id, text: delta } : { type, id, text: delta, state };
    const parts = exists
      ? message.parts.map((p) => {
          if ((p.type !== 'text' && p.type !== 'reasoning') || p.id !== id || p.type !== type) return p;
          return p.type === 'reasoning' ? { ...p, text: p.text + delta, state } : { ...p, text: p.text + delta };
        })
      : [...message.parts, part];
    return { ...message, parts };
  }
  if (
    ['tool-input-available', 'tool-output-available', 'tool-output-error'].includes(c.type) &&
    typeof c.toolCallId === 'string'
  ) {
    const existing = message.parts.find((p) => p.type === 'tool' && p.toolCallId === c.toolCallId);
    const part: Extract<ChatMessagePart, { type: 'tool' }> =
      existing?.type === 'tool'
        ? { ...existing }
        : {
            type: 'tool',
            toolCallId: c.toolCallId,
            toolName: typeof c.toolName === 'string' ? c.toolName : c.toolCallId,
            status: 'running',
          };
    if (c.type === 'tool-input-available') {
      part.toolName = typeof c.toolName === 'string' ? c.toolName : part.toolName;
      part.input = c.input;
      part.status = 'running';
    } else if (c.type === 'tool-output-available') {
      part.output = c.output;
      part.status = 'succeeded';
    } else {
      part.errorText = typeof c.errorText === 'string' ? c.errorText : undefined;
      part.status = 'failed';
    }
    return {
      ...message,
      parts: existing ? message.parts.map((p) => (p === existing ? part : p)) : [...message.parts, part],
    };
  }
  if (c.type === 'source-url' && typeof c.sourceId === 'string' && typeof c.url === 'string') {
    if (message.parts.some((p) => p.type === 'source' && p.id === c.sourceId)) return message;
    return {
      ...message,
      parts: [
        ...message.parts,
        {
          type: 'source',
          id: c.sourceId,
          source: { title: typeof c.title === 'string' ? c.title : c.url, url: c.url },
        },
      ],
    };
  }
  if (c.type === 'file' && typeof c.url === 'string') {
    return {
      ...message,
      parts: [
        ...message.parts,
        {
          type: 'file',
          file: {
            id: c.url,
            name: typeof c.filename === 'string' ? c.filename : c.url,
            type: typeof c.mediaType === 'string' ? c.mediaType : undefined,
            previewUrl: c.url,
          },
        },
      ],
    };
  }
  if (c.type === 'start-step' || c.type === 'finish-step')
    return {
      ...message,
      parts: [...message.parts, { type: 'step', state: c.type === 'start-step' ? 'start' : 'finish' }],
    };
  if (c.type === 'finish')
    return {
      ...message,
      status: 'done',
      parts: message.parts.map((p) => (p.type === 'reasoning' ? { ...p, state: 'done' } : p)),
    };
  if (c.type === 'error')
    return { ...message, status: 'error', error: typeof c.errorText === 'string' ? c.errorText : '' };
  if (c.type === 'abort')
    return {
      ...message,
      status: 'aborted',
      parts: message.parts.map((p) => (p.type === 'tool' && p.status === 'running' ? { ...p, status: 'failed' } : p)),
    };
  return message;
}

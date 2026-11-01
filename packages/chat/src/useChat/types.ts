import type { ChatAttachment } from '../Attachment';
import type { CitationSource } from '../Citation';
import type { ToolCallStatus } from '../ToolCallCard';

/** Experimental runtime parts, rendered with the existing chat components.
 * @experimental
 */
export type ChatMessagePart =
  | { type: 'text'; id: string; text: string }
  | { type: 'reasoning'; id: string; text: string; state: 'streaming' | 'done' }
  | {
      type: 'tool';
      toolCallId: string;
      toolName: string;
      input?: unknown;
      output?: unknown;
      errorText?: string;
      status: ToolCallStatus;
    }
  | { type: 'source'; id: string; source: CitationSource }
  | { type: 'file'; file: ChatAttachment }
  | { type: 'step'; state: 'start' | 'finish' };

/** Experimental conversation model. Dates are local objects; deserialize persisted dates before use.
 * @experimental
 */
export interface ChatThreadMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: ChatMessagePart[];
  status: 'pending' | 'streaming' | 'done' | 'error' | 'aborted';
  error?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

/** Known UI-message-stream v1 chunks. Unknown types are accepted for forward compatibility.
 * @experimental
 */
export type KnownChatChunk =
  | { type: 'start'; messageId?: string }
  | { type: 'text-start' | 'text-end' | 'reasoning-start' | 'reasoning-end'; id: string }
  | { type: 'text-delta' | 'reasoning-delta'; id: string; delta: string }
  | { type: 'tool-input-available'; toolCallId: string; toolName: string; input: unknown }
  | { type: 'tool-output-available'; toolCallId: string; output: unknown }
  | { type: 'tool-output-error'; toolCallId: string; errorText: string }
  | { type: 'source-url'; sourceId: string; url: string; title?: string }
  | { type: 'file'; url: string; mediaType: string; filename?: string }
  | { type: 'start-step' | 'finish-step' | 'finish' | 'abort' }
  | { type: 'error'; errorText: string };
export type ChatChunk = KnownChatChunk | { type: string; [key: string]: unknown };

/** Experimental backend contract. Provider keys belong on the product server.
 * @experimental
 */
export interface ChatAdapter {
  sendMessage(options: {
    messages: ChatThreadMessage[];
    trigger: 'submit' | 'regenerate';
    signal: AbortSignal;
  }): Promise<ReadableStream<ChatChunk> | AsyncIterable<ChatChunk>>;
  listMessages?(options: {
    cursor: string | null;
    signal: AbortSignal;
  }): Promise<{ messages: ChatThreadMessage[]; nextCursor: string | null }>;
  stop?(options: { messageId: string }): Promise<void>;
}

/** Experimental hook configuration. A changed id aborts both requests and resets the conversation.
 * @experimental
 */
export interface UseChatOptions {
  adapter: ChatAdapter;
  id?: string;
  initialMessages?: ChatThreadMessage[];
  initialCursor?: string | null;
  /** State commits during streaming; default 50 ms. Zero commits every chunk.
   * @experimental
   */
  flushIntervalMs?: number;
  generateId?: () => string;
  onFinish?: (message: ChatThreadMessage) => void;
  onError?: (error: Error, message: ChatThreadMessage) => void;
}

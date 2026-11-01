## Purpose

useChat: the runtime of the chat pack. It holds a conversation's messages, streams replies from a backend adapter into typed message parts, and offers send, stop, regenerate and older-history paging.

## ADDED Requirements

### Requirement: Replies stream from the adapter into typed parts

`sendMessage` SHALL append the user message and an assistant message with status `pending`, call `adapter.sendMessage` with the messages and an `AbortSignal`, apply every chunk to the assistant message's parts, set its status to `streaming` on the first chunk and to `done` when the stream finishes. `isStreaming` SHALL be true from the call until completion. Attachments SHALL become file parts.

#### Scenario: Echo reply

- **GIVEN** `useChat` with `createEchoAdapter()`
- **WHEN** `sendMessage('hello')` is called
- **THEN** a user message with the text hello is appended
- **AND** an assistant message goes from pending to streaming to done with the text hello
- **AND** `isStreaming` is false once it is done

#### Scenario: Tool call before the answer

- **WHEN** the adapter yields `tool-input-available` and `tool-output-available` for `t1` and then a `text-delta`
- **THEN** the assistant message has a tool part `t1` with status succeeded followed by a text part

### Requirement: Chunks update parts by id and unknown chunk types are ignored

The pure `applyChunk(message, chunk)` SHALL append text and reasoning deltas to the part with the same id, update tool parts by `toolCallId`, deduplicate sources by `sourceId`, represent file and step chunks and leave unknown chunks unchanged. Tool input SHALL set running, output succeeded, and output error failed with errorText.

#### Scenario: Text and reasoning merge

- **WHEN** deltas Hel and lo arrive for text id x, and reasoning deltas arrive for id r
- **THEN** one text part contains Hello and one reasoning part contains the reasoning
- **AND** reasoning-end marks the reasoning part done

#### Scenario: Repeated source

- **WHEN** two `source-url` chunks with `sourceId` `s1` arrive
- **THEN** the message has one source part `s1`

#### Scenario: Unknown chunk

- **WHEN** a `data-progress` chunk arrives mid-stream
- **THEN** the parts are unchanged
- **AND** the stream continues

### Requirement: Stop aborts the request and keeps the partial reply

`stop()` and unmounting SHALL abort the signal given to the adapter. Stop SHALL call optional adapter.stop, keep partial parts, set status `aborted` and fail running tool parts. Unmount SHALL make no further state updates. A changed conversation id SHALL abort reply and history requests and reset the conversation.

#### Scenario: Stop mid-stream

- **GIVEN** a reply that has streamed the text Hel and a running tool
- **WHEN** `stop()` is called
- **THEN** the adapter's `signal.aborted` is true
- **AND** the reply keeps the text Hel with status aborted and the tool becomes failed
- **AND** `isStreaming` is false

### Requirement: Failed streams mark the reply as an error

When the adapter throws, the response is not OK or an `error` chunk arrives, the reply SHALL take status `error` with partial parts and an error message; `error` SHALL be set and `onError` SHALL be called once per failed reply. HTTP errors SHALL include the response status.

#### Scenario: Stream throws

- **WHEN** the adapter yields Hel and then throws
- **THEN** the reply has status error and the text Hel
- **AND** onError was called once

### Requirement: Regenerate replaces the last reply and only one request runs at a time

`regenerate(messageId?)` SHALL remove that assistant message (default: the last one) and every later message, then request a new reply with `trigger: 'regenerate'`. While a reply is pending or streaming, sendMessage and regenerate MUST NOT start another request.

#### Scenario: Regenerate after two exchanges

- **WHEN** `regenerate()` is called
- **THEN** only the last assistant message is removed
- **AND** the adapter is called with trigger regenerate and the last user message last

#### Scenario: Send while streaming

- **WHEN** sendMessage or regenerate is called while a reply streams
- **THEN** the adapter is not called a second time

### Requirement: Older history loads by cursor

`loadOlder()` SHALL call `adapter.listMessages` with the previous page's cursor, starting from initialCursor, prepend the returned chronological messages and set hasOlder to false when nextCursor is null. Calls while loading SHALL be ignored. The hook SHALL expose isLoadingOlder and setMessages(next).

#### Scenario: Two pages

- **GIVEN** listMessages returns a page with nextCursor c2, then a page with null
- **WHEN** loadOlder is called twice
- **THEN** both pages are prepended in chronological order
- **AND** hasOlder is false

### Requirement: Bundled adapters read SSE from the product backend

`createHttpChatAdapter` SHALL parse an SSE body of JSON chunks. `createOpenAICompatibleAdapter` SHALL map chat-completions delta.content to text and delta.reasoning_content to reasoning, ending on [DONE]. Both SHALL reuse public readSSE and check response.ok before reading. Neither SHALL take an API-key option.

#### Scenario: Chat-completions stream

- **WHEN** the OpenAI-compatible adapter reads a body with reasoning_content and content deltas and [DONE]
- **THEN** the reply has one reasoning part and one text part with status done
- **AND** the request has stream true and messages as role/content objects

### Requirement: Streaming commits are batched

The hook SHALL batch streaming message updates every flushIntervalMs (default 50 ms). Zero SHALL commit every chunk. It SHALL expose initialMessages, generateId, onFinish and onError options and mark the public API experimental.

#### Scenario: One hundred deltas

- **WHEN** 100 text deltas arrive within one 50 ms interval
- **THEN** one messages update publishes the accumulated parts in that interval
- **AND** flushIntervalMs zero publishes each chunk

## Purpose

readSSE: a dependency-free reader that turns a streamed fetch response into Server-Sent Events messages or separator-delimited text parts, for chat replies and live log tails.

## ADDED Requirements

### Requirement: Messages follow the event stream format

`readSSE` SHALL decode the stream as UTF-8 and yield one message per blank-line-terminated block with `event` (default `message`), `data` (repeated data lines joined by a line feed), the last seen `id` and a numeric `retry`, ignoring comment lines and unknown fields; a block without data MUST NOT be yielded.

#### Scenario: Two messages

- **WHEN** the body is `event: delta`, `data: {"t":"Hel"}`, a blank line, `data: lo`, `data: world` and a blank line
- **THEN** the first message has event `delta` and data `{"t":"Hel"}`
- **AND** the second has event `message` and data `lo`, a line feed and `world`

#### Scenario: Keep-alive comments

- **WHEN** `: ping` lines arrive between two messages
- **THEN** only the two messages are yielded

### Requirement: Chunk boundaries do not change the messages

`readSSE` SHALL yield the same messages however the bytes are split into chunks, including inside a multi-byte character and between a carriage return and a line feed.

#### Scenario: Byte-by-byte delivery

- **GIVEN** the body `data: café`, CRLF, CRLF
- **WHEN** it arrives one byte per chunk
- **THEN** one message with data `café` is yielded

### Requirement: Event ids persist and unterminated blocks are dropped

An `id` field SHALL apply to its message and every later message until another `id` arrives, an `id` containing U+0000 MUST be ignored, and a final block without its terminating blank line MUST NOT be yielded.

#### Scenario: Last event id

- **WHEN** the first message carries `id: 42` and the second has no id
- **THEN** both messages report id `42`

### Requirement: Abort and early exit cancel the stream

When `signal` aborts, `readSSE` and `readTextParts` SHALL cancel the reader and throw the signal's reason, and when the consumer stops iterating early they MUST cancel the reader.

#### Scenario: User presses Stop

- **GIVEN** a stream that has yielded one message
- **WHEN** the controller passed as `signal` aborts
- **THEN** the loop throws an AbortError
- **AND** the reader is cancelled once

#### Scenario: Break after the first message

- **WHEN** the consumer breaks out of `for await` after one message
- **THEN** the reader is cancelled once

### Requirement: Separator-delimited parts for other protocols

`readTextParts` SHALL yield the decoded text between occurrences of `separator` (default a line feed), skipping empty parts and joining parts split across chunks.

#### Scenario: NDJSON log tail

- **WHEN** three JSON lines arrive with the second split across two chunks
- **THEN** three strings are yielded, each one complete line

### Requirement: Pending input is bounded

`readSSE` and `readTextParts` SHALL throw a RangeError and cancel the reader when a pending block or part grows beyond `maxBufferSize` characters (default 1,048,576).

#### Scenario: Runaway block

- **WHEN** a server sends 2 MB of data without a blank line
- **THEN** a RangeError is thrown
- **AND** the reader is cancelled

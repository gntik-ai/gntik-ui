/** One Server-Sent Event, as `EventSource` would dispatch it. */
export interface SSEMessage {
  /** The `event:` field of the block, `message` when it has none. */
  event: string;
  /** The `data:` lines of the block joined with a line feed. */
  data: string;
  /** The last `id:` seen on the stream so far (kept across messages), `''` before the first. */
  id: string;
  /** A reconnection time in milliseconds sent since the previous message, when there was one. */
  retry?: number;
}

/** Incremental parser for the `text/event-stream` format (WHATWG HTML, "Server-sent events"). */
export interface EventStreamParser {
  /**
   * Feeds decoded text and yields each message as soon as its block ends, so a message completed before
   * an oversized block is still delivered. Throws a RangeError past the limit.
   */
  write(text: string): Generator<SSEMessage>;
}

const DIGITS = /^[0-9]+$/;

export function createEventStreamParser(maxBufferSize: number): EventStreamParser {
  let line = ''; // text of the current line, not yet terminated
  let skipLineFeed = false; // the last line ended in CR; a following LF belongs to it
  let blockSize = 0; // characters of the lines of the current block, terminators included
  let event = '';
  let dataLines: string[] = [];
  let lastEventId = '';
  let retry: number | undefined;

  const tooLarge = () => new RangeError(`A pending event is longer than maxBufferSize (${maxBufferSize} characters).`);

  function field(raw: string) {
    if (raw.startsWith(':')) return;
    const colon = raw.indexOf(':');
    const name = colon === -1 ? raw : raw.slice(0, colon);
    let value = colon === -1 ? '' : raw.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    if (name === 'event') event = value;
    else if (name === 'data') dataLines.push(value);
    else if (name === 'id') {
      if (!value.includes('\u0000')) lastEventId = value;
    } else if (name === 'retry' && DIGITS.test(value)) {
      const ms = Number(value);
      if (Number.isSafeInteger(ms)) retry = ms;
    }
  }

  function dispatch(): SSEMessage | undefined {
    let message: SSEMessage | undefined;
    if (dataLines.length > 0) {
      message = { event: event || 'message', data: dataLines.join('\n'), id: lastEventId };
      if (retry !== undefined) {
        message.retry = retry;
        retry = undefined;
      }
    }
    event = '';
    dataLines = [];
    blockSize = 0;
    return message;
  }

  function endLine(): SSEMessage | undefined {
    if (line === '') return dispatch();
    blockSize += line.length + 1;
    if (blockSize > maxBufferSize) throw tooLarge();
    field(line);
    line = '';
    return undefined;
  }

  return {
    *write(text) {
      let start = 0;
      if (skipLineFeed && text !== '') {
        skipLineFeed = false;
        if (text.charCodeAt(0) === 10) start = 1;
      }
      for (let i = start; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code !== 10 && code !== 13) continue;
        line += text.slice(start, i);
        const message = endLine();
        line = '';
        start = i + 1;
        if (code === 13) {
          if (text.charCodeAt(start) === 10) {
            start++;
            i++;
          } else if (start === text.length) skipLineFeed = true;
        }
        if (message) yield message;
      }
      line += text.slice(start);
      if (blockSize + line.length > maxBufferSize) throw tooLarge();
    },
  };
}

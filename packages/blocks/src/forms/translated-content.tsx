import { Fragment, type ReactNode } from 'react';

/** Keep caller-owned rich content in place while the catalog controls sentence order. */
export function translatedContent(message: string, values: Record<string, ReactNode>): ReactNode {
  return message
    .split(/(\{\w+\})/)
    .map((part, index) => (
      <Fragment key={index}>
        {part.startsWith('{') && part.endsWith('}') ? (values[part.slice(1, -1)] ?? part) : part}
      </Fragment>
    ));
}

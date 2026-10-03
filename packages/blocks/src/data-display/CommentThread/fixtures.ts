import type { ThreadComment, CommentAuthor } from './CommentThread';

const MIN = 60_000;
const NOW = Date.now();

export const COMMENT_AUTHOR: CommentAuthor = { name: 'Jordan Blake' };

/** Review discussion on a pull request, oldest first. */
export const REVIEW_COMMENTS: ThreadComment[] = [
  {
    id: 'c1',
    author: { name: 'Ana Lopez' },
    body: 'The retry policy now backs off exponentially. Can someone check the timeout on the invoice worker?',
    at: NOW - 95 * MIN,
  },
  {
    id: 'c2',
    author: { name: 'Sam Carter' },
    body: 'Looks good. 30 seconds is fine for the worker, the queue redelivers after 60.',
    at: NOW - 70 * MIN,
  },
  {
    id: 'c3',
    author: { name: 'Priya Nair' },
    body: 'Approved. Please add a changelog entry before merging.',
    at: NOW - 12 * MIN,
  },
];

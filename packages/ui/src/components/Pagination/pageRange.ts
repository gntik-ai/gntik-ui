export type PageRangeItem = number | 'ellipsis-start' | 'ellipsis-end';

/**
 * Page list with ellipses: always the first and last page, `siblingCount` pages either side of the
 * current one, and an ellipsis only where it hides two or more pages. The length stays constant
 * (2 × siblingCount + 5) once pageCount exceeds it, so the control does not jump while paging.
 */
export function getPageRange(page: number, pageCount: number, siblingCount = 1): PageRangeItem[] {
  const count = Math.max(0, Math.floor(pageCount));
  const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  const slots = siblingCount * 2 + 5;
  if (count <= slots) return range(1, count);
  const current = Math.min(Math.max(1, page), count);
  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, count);
  const showStart = left > 3;
  const showEnd = right < count - 2;
  const edge = 3 + siblingCount * 2;
  if (!showStart) return [...range(1, edge), 'ellipsis-end', count];
  if (!showEnd) return [1, 'ellipsis-start', ...range(count - edge + 1, count)];
  return [1, 'ellipsis-start', ...range(left, right), 'ellipsis-end', count];
}

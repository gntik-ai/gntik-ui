import { CursorPagination, type CursorPaginationProps } from '@gntik-ai/ui';
import { CURSOR_PAGER_PREVIEW } from './fixtures';

/** The complete CursorPaginationProps contract, or no props for the fixture preview. */
export type CursorPagerFooterProps = CursorPaginationProps | { [K in keyof CursorPaginationProps]?: never };

/** Responsive table footer. Forwards every cursor-pagination prop without storing cursor state. */
export function CursorPagerFooter(props: CursorPagerFooterProps = {}) {
  return <CursorPagination {...(props.hasPrevious === undefined ? CURSOR_PAGER_PREVIEW : props)} />;
}

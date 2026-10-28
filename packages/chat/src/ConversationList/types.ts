import type { MoreMenuAction } from '@gntik-ai/ui';
import type { ReactNode } from 'react';

export interface ConversationSummary {
  id: string;
  title: string;
  preview?: string;
  updatedAt: Date | string | number;
  unread?: number;
  icon?: ReactNode;
  disabled?: boolean;
}

export type ConversationGrouping = 'recency' | false | ((item: ConversationSummary) => string);

export interface ConversationListProps {
  items: ConversationSummary[];
  activeId?: string | null;
  defaultActiveId?: string | null;
  onActiveChange?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  itemActions?: (item: ConversationSummary) => MoreMenuAction[];
  getHref?: (item: ConversationSummary) => string;
  collapsedGroups?: string[];
  defaultCollapsedGroups?: string[];
  onCollapsedGroupsChange?: (keys: string[]) => void;
  onNew?: () => void;
  /** Display hint only; the application owns shortcut binding. */
  newShortcut?: string;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  /** Window histories larger than this count; Infinity disables windowing. */
  virtualizeAt?: number;
  label?: string;
  emptyState?: ReactNode;
  groupBy?: ConversationGrouping;
  /** Local clock used for grouping; supply a stable value for SSR. */
  now?: Date;
  className?: string;
}

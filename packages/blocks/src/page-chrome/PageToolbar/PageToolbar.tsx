import { Plus, Search, SlidersHorizontal } from '@gntik-ai/icons';
import type { LucideIcon } from '@gntik-ai/icons';
import { Toggle, ToggleGroup, Toolbar, ToolbarButton, ToolbarEnd, ToolbarInput, ToolbarSeparator, ToolbarStart, cn } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';
import type { PageChromeAction } from '../types';
import { pageToolbarViews } from './fixtures';

export interface PageToolbarView {
  value: string;
  /** Accessible name of the icon toggle. */
  label: string;
  icon: LucideIcon;
}

export interface PageToolbarProps {
  /** Controlled search text. */
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (value: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  /**
   * Filter controls. Use ToolbarButton (optionally with `render` for a Menu/Popover trigger) so they
   * join the toolbar's arrow-key navigation. Omitted: a single "Filters" button; `null` hides it.
   */
  filters?: ReactNode;
  /** View modes for the segmented toggle; `null` or an empty list hides it. */
  views?: PageToolbarView[] | null;
  view?: string;
  defaultView?: string;
  onViewChange?: (value: string) => void;
  /** Main action at the end of the bar; `null` hides it. */
  primaryAction?: PageChromeAction | null;
  'aria-label'?: string;
  className?: string;
}

const pageToolbarDefaultAction: PageChromeAction = { label: 'New project', icon: Plus };

/** List/table toolbar: search, filters, view toggle and the primary action, with one Tab stop. */
export function PageToolbar({
  search,
  defaultSearch = '',
  onSearchChange,
  searchLabel = 'Search',
  searchPlaceholder = 'Search projects…',
  filters,
  views = pageToolbarViews,
  view,
  defaultView,
  onViewChange,
  primaryAction = pageToolbarDefaultAction,
  'aria-label': ariaLabel = 'Page toolbar',
  className,
}: PageToolbarProps) {
  const [innerSearch, setInnerSearch] = useState(defaultSearch);
  const [innerView, setInnerView] = useState(defaultView ?? views?.[0]?.value ?? '');
  const currentSearch = search ?? innerSearch;
  const currentView = view ?? innerView;

  return (
    <Toolbar aria-label={ariaLabel} className={cn('flex-wrap gap-y-2', className)}>
      <ToolbarStart className="min-w-0 flex-1 basis-60">
        <ToolbarInput
          type="search"
          icon={Search}
          aria-label={searchLabel}
          placeholder={searchPlaceholder}
          value={currentSearch}
          onChange={(e) => {
            setInnerSearch(e.target.value);
            onSearchChange?.(e.target.value);
          }}
          wrapperClassName="max-w-sm"
        />
        {filters !== undefined ? filters : (
          <ToolbarButton variant="secondary" icon={SlidersHorizontal}>
            Filters
          </ToolbarButton>
        )}
      </ToolbarStart>
      <ToolbarEnd>
        {views && views.length > 0 && (
          <>
            <ToggleGroup
              aria-label="View"
              size="sm"
              value={[currentView]}
              onValueChange={(next) => {
                const picked = next[0];
                if (!picked) return; // keep one view selected
                setInnerView(picked);
                onViewChange?.(picked);
              }}
            >
              {views.map((v) => (
                <ToolbarButton
                  key={v.value}
                  render={<Toggle value={v.value} iconOnly size="sm" />}
                  aria-label={v.label}
                  icon={v.icon}
                  className="size-7 rounded-md data-pressed:bg-secondary data-pressed:text-foreground"
                />
              ))}
            </ToggleGroup>
            {primaryAction && <ToolbarSeparator />}
          </>
        )}
        {primaryAction && (
          <ToolbarButton
            variant={primaryAction.variant ?? 'primary'}
            icon={primaryAction.icon}
            disabled={primaryAction.disabled}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </ToolbarButton>
        )}
      </ToolbarEnd>
    </Toolbar>
  );
}

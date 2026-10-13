import { ChevronDown, Columns3 } from '@gntik-ai/icons';
import {
  Button,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '@gntik-ai/ui';
import { useColumnMenuLabels, type ColumnMenuLabels } from './labels';
import type { PinSide } from './column-sizing';
import type { DataTableColumn } from './data-table-utils';

export interface ColumnVisibilityMenuProps<T> {
  columns: ReadonlyArray<DataTableColumn<T>>;
  hidden: ReadonlySet<string>;
  onToggle: (columnId: string, visible: boolean) => void;
  label?: string;
  labels?: ColumnMenuLabels;
  /** Pin side of a column; with `onPin`, the menu gets a "Pin columns" section. */
  pinOf?: (columnId: string) => PinSide | null;
  onPin?: (columnId: string, side: PinSide | null) => void;
}

const PIN_NONE = 'none';

/**
 * "Columns" menu: one checkbox item per hideable column (the last visible column cannot be
 * hidden) and, when pinning is on, a submenu per visible column to pin it left, right or unpin it.
 */
export function ColumnVisibilityMenu<T>({
  columns,
  hidden,
  onToggle,
  label: labelProp,
  labels,
  pinOf,
  onPin,
}: ColumnVisibilityMenuProps<T>) {
  const l = useColumnMenuLabels(labels);
  const label = labels?.trigger ?? labelProp ?? l.trigger;
  const visibleCount = columns.filter((c) => !hidden.has(c.id)).length;
  const pinnable = onPin && pinOf ? columns.filter((c) => c.pinnable !== false && !hidden.has(c.id)) : [];
  return (
    <Menu>
      <MenuTrigger render={<Button variant="secondary" size="sm" icon={Columns3} trailingIcon={ChevronDown} />}>
        {label}
      </MenuTrigger>
      <MenuContent align="end" className="min-w-[200px]">
        <MenuGroup>
          <MenuGroupLabel>{l.visibleColumns}</MenuGroupLabel>
          {columns
            .filter((c) => c.hideable !== false)
            .map((c) => {
              const visible = !hidden.has(c.id);
              return (
                <MenuCheckboxItem
                  key={c.id}
                  checked={visible}
                  disabled={visible && visibleCount <= 1}
                  onCheckedChange={(on) => onToggle(c.id, on)}
                >
                  {c.header}
                </MenuCheckboxItem>
              );
            })}
        </MenuGroup>
        {pinnable.length > 0 && onPin && pinOf && (
          <>
            <MenuSeparator />
            <MenuGroup>
              <MenuGroupLabel>{l.pinColumns}</MenuGroupLabel>
              {pinnable.map((c) => {
                const side = pinOf(c.id);
                return (
                  <MenuSub key={c.id}>
                    <MenuSubTrigger>
                      {c.header}
                      {side && (
                        <span className="ms-auto ps-3 text-[11.5px] text-muted-foreground">{l.pinSide(side)}</span>
                      )}
                    </MenuSubTrigger>
                    <MenuSubContent>
                      <MenuRadioGroup
                        value={side ?? PIN_NONE}
                        onValueChange={(v: unknown) => onPin(c.id, v === 'left' || v === 'right' ? v : null)}
                      >
                        <MenuRadioItem value="left">{l.pinLeft}</MenuRadioItem>
                        <MenuRadioItem value="right">{l.pinRight}</MenuRadioItem>
                        <MenuRadioItem value={PIN_NONE}>{l.unpinned}</MenuRadioItem>
                      </MenuRadioGroup>
                    </MenuSubContent>
                  </MenuSub>
                );
              })}
            </MenuGroup>
          </>
        )}
      </MenuContent>
    </Menu>
  );
}

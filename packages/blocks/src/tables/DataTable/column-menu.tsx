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
  useI18n,
} from '@gntik-ai/ui';
import type { PinSide } from './column-sizing';
import type { DataTableColumn } from './data-table-utils';

export interface ColumnVisibilityMenuProps<T> {
  columns: ReadonlyArray<DataTableColumn<T>>;
  hidden: ReadonlySet<string>;
  onToggle: (columnId: string, visible: boolean) => void;
  label?: string;
  /** Pin side of a column; with `onPin`, the menu gets a "Pin columns" section. */
  pinOf?: (columnId: string) => PinSide | null;
  onPin?: (columnId: string, side: PinSide | null) => void;
}

const PIN_NONE = 'none';

/**
 * "Columns" menu: one checkbox item per hideable column (the last visible column cannot be
 * hidden) and, when pinning is on, a submenu per visible column to pin it left, right or unpin it.
 */
export function ColumnVisibilityMenu<T>({ columns, hidden, onToggle, label: labelProp, pinOf, onPin }: ColumnVisibilityMenuProps<T>) {
  const { t } = useI18n();
  const label = labelProp ?? t('table.columns');
  const visibleCount = columns.filter((c) => !hidden.has(c.id)).length;
  const pinnable = onPin && pinOf ? columns.filter((c) => c.pinnable !== false && !hidden.has(c.id)) : [];
  return (
    <Menu>
      <MenuTrigger render={<Button variant="secondary" size="sm" icon={Columns3} trailingIcon={ChevronDown} />}>{label}</MenuTrigger>
      <MenuContent align="end" className="min-w-[200px]">
        <MenuGroup>
          <MenuGroupLabel>{t('table.visibleColumns')}</MenuGroupLabel>
          {columns
            .filter((c) => c.hideable !== false)
            .map((c) => {
              const visible = !hidden.has(c.id);
              return (
                <MenuCheckboxItem key={c.id} checked={visible} disabled={visible && visibleCount <= 1} onCheckedChange={(on) => onToggle(c.id, on)}>
                  {c.header}
                </MenuCheckboxItem>
              );
            })}
        </MenuGroup>
        {pinnable.length > 0 && onPin && pinOf && (
          <>
            <MenuSeparator />
            <MenuGroup>
              <MenuGroupLabel>Pin columns</MenuGroupLabel>
              {pinnable.map((c) => {
                const side = pinOf(c.id);
                return (
                  <MenuSub key={c.id}>
                    <MenuSubTrigger>
                      {c.header}
                      {side && <span className="ms-auto ps-3 text-[11.5px] text-muted-foreground">{side === 'left' ? 'Left' : 'Right'}</span>}
                    </MenuSubTrigger>
                    <MenuSubContent>
                      <MenuRadioGroup
                        value={side ?? PIN_NONE}
                        onValueChange={(v: unknown) => onPin(c.id, v === 'left' || v === 'right' ? v : null)}
                      >
                        <MenuRadioItem value="left">Pin left</MenuRadioItem>
                        <MenuRadioItem value="right">Pin right</MenuRadioItem>
                        <MenuRadioItem value={PIN_NONE}>Unpinned</MenuRadioItem>
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

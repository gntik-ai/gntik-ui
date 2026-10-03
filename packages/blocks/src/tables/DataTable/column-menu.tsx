import { ChevronDown, Columns3 } from '@gntik-ai/icons';
import { Button, Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuGroupLabel, MenuTrigger, useI18n } from '@gntik-ai/ui';
import type { DataTableColumn } from './data-table-utils';

export interface ColumnVisibilityMenuProps<T> {
  columns: ReadonlyArray<DataTableColumn<T>>;
  hidden: ReadonlySet<string>;
  onToggle: (columnId: string, visible: boolean) => void;
  label?: string;
}

/** "Columns" menu: one checkbox item per hideable column. The last visible column cannot be hidden. */
export function ColumnVisibilityMenu<T>({ columns, hidden, onToggle, label: labelProp }: ColumnVisibilityMenuProps<T>) {
  const { t } = useI18n();
  const label = labelProp ?? t('table.columns');
  const visibleCount = columns.filter((c) => !hidden.has(c.id)).length;
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
      </MenuContent>
    </Menu>
  );
}

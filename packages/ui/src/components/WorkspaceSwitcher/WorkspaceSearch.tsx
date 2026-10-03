import { Combobox } from '@base-ui/react/combobox';
import { Check, Plus, Search } from 'lucide-react';
import { useMemo } from 'react';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { workspaceSwitcherVariants } from './workspace-switcher.variants';
import { triggerLabel, WorkspaceOptionBody, WorkspaceTriggerContent, type Workspace } from './parts';
import type { WorkspaceSwitcherProps } from './WorkspaceSwitcher';

const CREATE_ID = '__create-workspace__';
const s = workspaceSwitcherVariants();

interface WorkspaceSearchProps extends WorkspaceSwitcherProps {
  current?: Workspace;
  createLabel: string;
  label: string;
}

/** Searchable variant of WorkspaceSwitcher: a combobox with the input inside its popup. */
export function WorkspaceSearch({
  className,
  workspaces,
  current,
  onSelect,
  onCreate,
  createLabel,
  label,
  searchPlaceholder: searchPlaceholderProp,
  emptyText: emptyTextProp,
}: WorkspaceSearchProps) {
  const { t } = useI18n();
  const searchPlaceholder = searchPlaceholderProp ?? t('workspace.search');
  const emptyText = emptyTextProp ?? t('workspace.empty');
  const dir = usePortalDir();
  const createEntry = useMemo<Workspace>(() => ({ id: CREATE_ID, name: createLabel }), [createLabel]);
  const items = useMemo(() => (onCreate ? [...workspaces, createEntry] : workspaces), [workspaces, onCreate, createEntry]);
  return (
    <Combobox.Root<Workspace>
      items={items}
      value={current ?? null}
      onValueChange={(next) => {
        if (!next) return;
        if (next.id === CREATE_ID) onCreate?.();
        else onSelect(next);
      }}
      itemToStringLabel={(w) => w.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
      filter={(w, query) => w.id === CREATE_ID || `${w.name} ${w.meta ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())}
      autoHighlight
    >
      <Combobox.Trigger aria-label={triggerLabel(current, label)} className={cn(s.trigger(), className)}>
        <WorkspaceTriggerContent workspace={current} />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner dir={dir} className="z-50 outline-none" align="start" sideOffset={8}>
          <Combobox.Popup className={s.searchPopup()} aria-label={label}>
            <div className={s.searchField()}>
              <Search size={15} aria-hidden className={s.searchIcon()} />
              <Combobox.Input aria-label={searchPlaceholder.replace(/…$/, '')} placeholder={searchPlaceholder} className={s.searchInput()} />
            </div>
            <Combobox.Empty className={s.searchEmpty()}>{emptyText}</Combobox.Empty>
            <Combobox.List className={s.searchList()}>
              {(w: Workspace) =>
                w.id === CREATE_ID ? (
                  <Combobox.Item key={w.id} value={w} className={s.searchItem()}>
                    <span className={s.optionBody()}>
                      <span className={s.createIcon()}>
                        <Plus size={15} aria-hidden />
                      </span>
                      <span className={s.optionName()}>{w.name}</span>
                    </span>
                  </Combobox.Item>
                ) : (
                  <Combobox.Item key={w.id} value={w} className={s.searchItem()}>
                    <WorkspaceOptionBody workspace={w} current={w.id === current?.id} />
                    <Combobox.ItemIndicator className={s.searchIndicator()}>
                      <Check size={15} aria-hidden />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                )
              }
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

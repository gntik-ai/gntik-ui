import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { matchText } from '../../utils/match-text';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { SearchableSelect } from '../SearchableSelect/SearchableSelect';
import { SearchableSelectPresentation } from '../SearchableSelect/SearchableSelectPresentation';
import { workspaceSwitcherVariants } from './workspace-switcher.variants';
import { triggerLabel, WorkspaceOptionBody, WorkspaceTriggerContent, type Workspace } from './parts';
import type { WorkspaceSwitcherProps } from './WorkspaceSwitcher';

const s = workspaceSwitcherVariants();

interface WorkspaceSearchProps extends WorkspaceSwitcherProps {
  current?: Workspace;
  createLabel: string;
  label: string;
}

/** Searchable workspace picker, sharing the kit's popup search and selection behavior. */
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
  const { t, locale } = useI18n();
  const options = useMemo(
    () =>
      workspaces.map((workspace) => ({
        value: workspace.id,
        label: workspace.name,
        description: workspace.meta,
      })),
    [workspaces],
  );
  return (
    <SearchableSelectPresentation.Provider
      value={{
        popupLabel: label,
        popupClassName: s.searchPopup(),
        listClassName: s.searchList(),
        emptyClassName: s.searchEmpty(),
        optionClassName: s.searchItem(),
        sideOffset: 8,
        renderOption: (id) => {
          const workspace = workspaces.find((item) => item.id === id);
          return workspace && <WorkspaceOptionBody workspace={workspace} current={id === current?.id} />;
        },
        renderAction: () => (
          <span className={s.optionBody()}>
            <span className={s.createIcon()}>
              <Plus size={15} aria-hidden />
            </span>
            <span className={s.optionName()}>{createLabel}</span>
          </span>
        ),
      }}
    >
      <SearchableSelect
        options={options}
        value={current?.id ?? null}
        onValueChange={(id) => {
          const workspace = workspaces.find((item) => item.id === id);
          if (workspace) onSelect(workspace);
        }}
        aria-label={triggerLabel(current, label)}
        trigger={
          <button type="button" className={cn(s.trigger(), className)}>
            <WorkspaceTriggerContent workspace={current} />
          </button>
        }
        searchPlaceholder={searchPlaceholderProp ?? t('workspace.search')}
        emptyText={emptyTextProp ?? t('workspace.empty')}
        filter={(option, query) => matchText(`${option.label} ${option.description ?? ''}`, query, { locale })}
        actions={onCreate ? [{ id: 'create-workspace', label: createLabel, onSelect: onCreate }] : undefined}
      />
    </SearchableSelectPresentation.Provider>
  );
}

import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Menu, MenuContent, MenuGroupLabel, MenuItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuTrigger } from '../Menu';
import { workspaceSwitcherVariants } from './workspace-switcher.variants';
import { triggerLabel, WorkspaceOptionBody, WorkspaceTriggerContent, type Workspace } from './parts';
import { useI18n } from '../../i18n/I18nProvider';
import { WorkspaceSearch } from './WorkspaceSearch';

export type { Workspace } from './parts';

export interface WorkspaceSwitcherProps {
  className?: string;
  workspaces: Workspace[];
  currentId: string;
  /** Called with the chosen workspace. */
  onSelect: (workspace: Workspace) => void;
  /** Adds a "Create workspace" action at the end of the list. */
  onCreate?: () => void;
  createLabel?: string;
  /** Heading of the list (and the popup's accessible name). */
  label?: string;
  /** Adds a search field. Defaults to on when there are more than `searchThreshold` workspaces. */
  searchable?: boolean;
  searchThreshold?: number;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
}

const s = workspaceSwitcherVariants();

/**
 * Two-line workspace picker for the topbar or sidebar header: logo, name and plan/role meta,
 * the current workspace checked, a search field when the list is long, and "Create workspace".
 * A menu for short lists; a searchable listbox (combobox) for long ones.
 */
export function WorkspaceSwitcher(props: WorkspaceSwitcherProps) {
  const {
    className,
    workspaces,
    currentId,
    onSelect,
    onCreate,
    createLabel: createLabelProp,
    label: labelProp,
    searchable,
    searchThreshold = 6,
  } = props;
  const { t } = useI18n();
  const createLabel = createLabelProp ?? t('workspace.create');
  const label = labelProp ?? t('workspace.switch');
  const current = workspaces.find((w) => w.id === currentId);
  if (searchable ?? workspaces.length > searchThreshold) {
    return <WorkspaceSearch {...props} current={current} createLabel={createLabel} label={label} />;
  }
  return (
    <Menu>
      <MenuTrigger aria-label={triggerLabel(current, label)} className={cn(s.trigger(), className)}>
        <WorkspaceTriggerContent workspace={current} />
      </MenuTrigger>
      <MenuContent className={s.popup()}>
        <MenuRadioGroup
          value={currentId}
          onValueChange={(id: string) => {
            const next = workspaces.find((w) => w.id === id);
            if (next) onSelect(next);
          }}
        >
          <MenuGroupLabel>{label}</MenuGroupLabel>
          {workspaces.map((w) => (
            <MenuRadioItem key={w.id} value={w.id} label={w.name} className={s.option()}>
              <WorkspaceOptionBody workspace={w} current={w.id === currentId} />
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
        {onCreate && (
          <>
            <MenuSeparator />
            <MenuItem icon={Plus} onClick={onCreate}>
              {createLabel}
            </MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  );
}

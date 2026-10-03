import { ChevronsUpDown } from 'lucide-react';
import { Avatar, getInitials } from '../Avatar';
import { workspaceSwitcherVariants } from './workspace-switcher.variants';

export interface Workspace {
  id: string;
  name: string;
  /** Secondary line: plan, role, environment… */
  meta?: string;
  /** Logo image URL; initials show while it loads or if it fails. */
  logo?: string;
}

const s = workspaceSwitcherVariants();

/** Trigger name: the current workspace first (matches the visible text), then the action. */
export const triggerLabel = (current: Workspace | undefined, label: string) => (current ? `${current.name}, ${label}` : label);

export function WorkspaceLogo({ workspace, current }: { workspace: Workspace; current?: boolean }) {
  return (
    <Avatar
      src={workspace.logo}
      initials={getInitials(workspace.name)}
      size="sm"
      shape="rounded"
      tone={current ? 'primary' : 'accent'}
      className="size-[30px]"
    />
  );
}

export function WorkspaceOptionBody({ workspace, current }: { workspace: Workspace; current?: boolean }) {
  return (
    <span className={s.optionBody()}>
      <WorkspaceLogo workspace={workspace} current={current} />
      <span className={s.optionText()}>
        <span className={s.optionName()}>{workspace.name}</span>
        {workspace.meta && <span className={s.optionMeta()}>{workspace.meta}</span>}
      </span>
    </span>
  );
}

/** Trigger content: logo, name, meta and an up/down chevron. */
export function WorkspaceTriggerContent({ workspace }: { workspace?: Workspace }) {
  return (
    <>
      {workspace && <WorkspaceLogo workspace={workspace} current />}
      <span className={s.triggerText()}>
        <span className={s.triggerName()}>{workspace?.name ?? 'Select workspace'}</span>
        {workspace?.meta && <span className={s.triggerMeta()}>{workspace.meta}</span>}
      </span>
      <ChevronsUpDown size={14} aria-hidden className={s.triggerChevron()} />
    </>
  );
}

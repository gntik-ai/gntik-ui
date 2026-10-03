import { Ban, Check, CornerDownRight, Lock } from 'lucide-react';
import { Fragment, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { SimpleTooltip } from '../Tooltip';
import { permissionMatrixVariants } from './permission-matrix.variants';

export type PermissionState = 'allowed' | 'denied' | 'inherited';
/** `value[roleId][permissionId]`; a missing cell is `inherited`. */
export type PermissionMatrixValue = Record<string, Record<string, PermissionState>>;

export interface PermissionRole {
  id: string;
  label: string;
  description?: string;
  /** The column cannot be edited (e.g. the owner role). */
  readOnly?: boolean;
  /** Tooltip for the read-only column's cells. */
  readOnlyReason?: string;
}

export interface PermissionItem {
  id: string;
  label: string;
  description?: string;
}

export interface PermissionSection {
  id: string;
  label: string;
  permissions: PermissionItem[];
}

export interface PermissionChange {
  roleId: string;
  permissionId: string;
  state: PermissionState;
}

export interface PermissionMatrixProps {
  /** Columns. */
  roles: PermissionRole[];
  /** Row groups. */
  sections: PermissionSection[];
  value?: PermissionMatrixValue;
  defaultValue?: PermissionMatrixValue;
  onChange?: (value: PermissionMatrixValue, change: PermissionChange) => void;
  /** What an inherited cell currently resolves to (from a parent role, the org default…). */
  resolveInherited?: (roleId: string, permissionId: string) => 'allowed' | 'denied' | undefined;
  /** Include `inherited` in the cycle. Default true. */
  allowInherit?: boolean;
  /** A reason makes the cell read-only and shows it in a tooltip. */
  getDisabledReason?: (roleId: string, permissionId: string) => string | undefined;
  /** Visible caption (also names the grid). */
  caption?: ReactNode;
  'aria-label'?: string;
  className?: string;
}

const NEXT: Record<PermissionState, PermissionState> = { allowed: 'denied', denied: 'inherited', inherited: 'allowed' };
const ICONS = { allowed: Check, denied: Ban, inherited: CornerDownRight } as const;

/**
 * Roles × permissions editor. Cells are tri-state (allowed / denied / inherited) and always show
 * an icon and a word. One tab stop: arrows move between cells, Enter/Space cycle the state,
 * A / D / I set it directly. Read-only columns and per-cell disabled reasons (tooltip) are
 * reachable but cannot change.
 */
export function PermissionMatrix({
  roles,
  sections,
  value,
  defaultValue,
  onChange,
  resolveInherited,
  allowInherit = true,
  getDisabledReason,
  caption,
  'aria-label': ariaLabel,
  className,
}: PermissionMatrixProps) {
  const { t, dir } = useI18n();
  const uid = useId();
  const [inner, setInner] = useState<PermissionMatrixValue>(defaultValue ?? {});
  const matrix = value ?? inner;
  const [focus, setFocus] = useState({ row: 0, col: 0 });
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());
  const s = permissionMatrixVariants();
  const rows = sections.flatMap((sec) => sec.permissions);
  const lastRow = rows.length - 1;
  const lastCol = roles.length - 1;
  const active = { row: Math.min(focus.row, Math.max(0, lastRow)), col: Math.min(focus.col, Math.max(0, lastCol)) };

  const stateLabel = (state: PermissionState) => t(`permissionMatrix.${state}`);
  const stateOf = (roleId: string, permId: string): PermissionState => matrix[roleId]?.[permId] ?? 'inherited';
  const reasonOf = (role: PermissionRole, permId: string) =>
    role.readOnly ? (role.readOnlyReason ?? t('permissionMatrix.readOnlyRole', { role: role.label })) : getDisabledReason?.(role.id, permId);

  const set = (role: PermissionRole, perm: PermissionItem, state: PermissionState) => {
    if (reasonOf(role, perm.id) || stateOf(role.id, perm.id) === state) return;
    const next: PermissionMatrixValue = { ...matrix, [role.id]: { ...matrix[role.id], [perm.id]: state } };
    setInner(next);
    onChange?.(next, { roleId: role.id, permissionId: perm.id, state });
  };
  const cycle = (role: PermissionRole, perm: PermissionItem) => {
    const current = stateOf(role.id, perm.id);
    let next = NEXT[current];
    if (next === 'inherited' && !allowInherit) next = 'allowed';
    set(role, perm, next);
  };

  const moveTo = (row: number, col: number) => {
    const r = Math.max(0, Math.min(lastRow, row));
    const c = Math.max(0, Math.min(lastCol, col));
    setFocus({ row: r, col: c });
    cellRefs.current.get(`${r}:${c}`)?.focus();
  };

  const onKeyDown = (row: number, col: number, role: PermissionRole, perm: PermissionItem) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const forward = dir === 'rtl' ? -1 : 1;
    const key = e.key;
    let handled = true;
    if (key === 'ArrowRight') moveTo(row, col + forward);
    else if (key === 'ArrowLeft') moveTo(row, col - forward);
    else if (key === 'ArrowDown') moveTo(row + 1, col);
    else if (key === 'ArrowUp') moveTo(row - 1, col);
    else if (key === 'Home') moveTo(e.ctrlKey || e.metaKey ? 0 : row, 0);
    else if (key === 'End') moveTo(e.ctrlKey || e.metaKey ? lastRow : row, lastCol);
    else if (key === 'PageDown') moveTo(lastRow, col);
    else if (key === 'PageUp') moveTo(0, col);
    else if (!e.ctrlKey && !e.metaKey && !e.altKey && (key === 'a' || key === 'A')) set(role, perm, 'allowed');
    else if (!e.ctrlKey && !e.metaKey && !e.altKey && (key === 'd' || key === 'D')) set(role, perm, 'denied');
    else if (!e.ctrlKey && !e.metaKey && !e.altKey && allowInherit && (key === 'i' || key === 'I')) set(role, perm, 'inherited');
    else handled = false;
    if (handled) e.preventDefault();
  };

  const offsets = sections.map((_, i) => sections.slice(0, i).reduce((n, sec) => n + sec.permissions.length, 0));
  return (
    <div className={cn(s.root(), className)}>
      <table role="grid" aria-label={caption ? undefined : (ariaLabel ?? t('permissionMatrix.label'))} aria-labelledby={caption ? `${uid}-caption` : undefined} className={s.table()}>
        {caption && (
          <caption id={`${uid}-caption`} className={s.caption()}>
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            <th scope="col" className={s.corner()}>
              {t('permissionMatrix.permission')}
            </th>
            {roles.map((role) => (
              <th key={role.id} scope="col" className={s.roleHead()}>
                <span className={s.roleInner()}>
                  {role.readOnly && <Lock size={12} aria-hidden className={s.roleIcon()} />}
                  {role.label}
                  {role.readOnly && <span className="sr-only"> ({t('permissionMatrix.readOnly')})</span>}
                </span>
                {role.description && <span className={s.roleDescription()}>{role.description}</span>}
              </th>
            ))}
          </tr>
        </thead>
        {sections.map((section, sectionIndex) => (
          <tbody key={section.id}>
            <tr>
              <th scope="colgroup" colSpan={roles.length + 1} className={s.section()}>
                {section.label}
              </th>
            </tr>
            {section.permissions.map((perm, i) => {
              const row = (offsets[sectionIndex] ?? 0) + i;
              return (
                <tr key={perm.id}>
                  <th scope="row" className={s.rowHead()}>
                    <span className={s.permLabel()}>{perm.label}</span>
                    {perm.description && <span className={s.permDescription()}>{perm.description}</span>}
                  </th>
                  {roles.map((role, col) => {
                    const state = stateOf(role.id, perm.id);
                    const inheritedAs = state === 'inherited' ? resolveInherited?.(role.id, perm.id) : undefined;
                    const label = inheritedAs ? t('permissionMatrix.inheritedAs', { state: stateLabel(inheritedAs) }) : stateLabel(state);
                    const Icon = ICONS[state];
                    const reason = reasonOf(role, perm.id);
                    const reasonId = `${uid}-r${row}-c${col}`;
                    const button = (
                      <button
                        ref={(el) => {
                          if (el) cellRefs.current.set(`${row}:${col}`, el);
                          else cellRefs.current.delete(`${row}:${col}`);
                        }}
                        type="button"
                        tabIndex={row === active.row && col === active.col ? 0 : -1}
                        aria-label={t('permissionMatrix.cell', { permission: perm.label, role: role.label, state: label })}
                        aria-disabled={reason ? true : undefined}
                        aria-describedby={reason ? reasonId : undefined}
                        data-state={state}
                        onClick={() => {
                          setFocus({ row, col });
                          if (!reason) cycle(role, perm);
                        }}
                        onFocus={() => {
                          if (row !== active.row || col !== active.col) setFocus({ row, col });
                        }}
                        onKeyDown={onKeyDown(row, col, role, perm)}
                        className={s.toggle({ state })}
                      >
                        <Icon size={12} strokeWidth={2.4} aria-hidden />
                        {label}
                      </button>
                    );
                    return (
                      <td key={role.id} className={s.cell()}>
                        {reason ? (
                          <Fragment>
                            <SimpleTooltip content={reason}>{button}</SimpleTooltip>
                            <span id={reasonId} className="sr-only">
                              {reason}
                            </span>
                          </Fragment>
                        ) : (
                          button
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}

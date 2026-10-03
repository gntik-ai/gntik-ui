import { FolderPlus, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useI18n, useOptionalI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { Button, IconButton } from '../Button';
import { SimpleSelect } from '../Select';
import { Toggle, ToggleGroup } from '../ToggleGroup';
import {
  createQueryCondition,
  createQueryGroup,
  operatorArity,
  operatorsFor,
  queryToString,
  type QueryCondition,
  type QueryField,
  type QueryGroup,
  type QueryNode,
  type QueryOperator,
  type QueryValue,
} from './query';
import { queryBuilderVariants } from './query-builder.variants';
import { QueryValueEditor } from './QueryValueEditor';

export interface QueryBuilderProps {
  /** Fields a condition can test. */
  fields: QueryField[];
  /** The query tree (controlled). The root is a group. */
  value?: QueryGroup;
  defaultValue?: QueryGroup;
  onChange?: (value: QueryGroup) => void;
  /** Group nesting limit, counting the root (1 = no sub-groups). */
  maxDepth?: number;
  /** Show the query as text under the builder (`queryToString`). */
  showPreview?: boolean;
  /** Locale for dates and the preview. Defaults to the I18nProvider's. */
  locale?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const EMPTY_ROOT: QueryGroup = { type: 'group', id: 'root', combinator: 'and', children: [] };

function mapNode(node: QueryNode, id: string, fn: (n: QueryNode) => QueryNode | null): QueryNode | null {
  if (node.id === id) return fn(node);
  if (node.type === 'condition') return node;
  const children = node.children.map((c) => mapNode(c, id, fn)).filter((c): c is QueryNode => c !== null);
  return { ...node, children };
}

/**
 * Visual query editor: nested AND/OR groups of field / operator / value conditions. Fields are
 * typed (text, number, enum, date, boolean) and each type offers its operators and value editor.
 * The value is a serialisable tree; `queryToString` and `evaluateQuery` read it.
 */
export function QueryBuilder({
  fields,
  value,
  defaultValue,
  onChange,
  maxDepth = 3,
  showPreview = false,
  locale: localeProp,
  disabled,
  className,
  'aria-label': ariaLabel,
}: QueryBuilderProps) {
  const { t } = useI18n();
  const providerLocale = useOptionalI18n()?.locale;
  const locale = localeProp ?? providerLocale;
  const [inner, setInner] = useState<QueryGroup>(defaultValue ?? EMPTY_ROOT);
  const tree = value ?? inner;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const s = queryBuilderVariants();

  useEffect(() => {
    if (!pendingFocus.current) return;
    const el = rootRef.current?.querySelector<HTMLElement>(pendingFocus.current);
    pendingFocus.current = null;
    el?.focus();
  });

  const commit = (next: QueryGroup) => {
    setInner(next);
    onChange?.(next);
  };
  const update = (id: string, fn: (n: QueryNode) => QueryNode | null) => {
    const next = mapNode(tree, id, fn);
    if (next && next.type === 'group') commit(next);
  };
  const patchCondition = (id: string, patch: Partial<QueryCondition>) =>
    update(id, (n) => (n.type === 'condition' ? { ...n, ...patch } : n));

  const addTo = (group: QueryGroup, node: QueryNode) => {
    pendingFocus.current = node.type === 'condition' ? `[data-query-node="${node.id}"] [role="combobox"]` : `[data-query-node="${node.id}"] [data-query-part="add-condition"]`;
    update(group.id, (n) => (n.type === 'group' ? { ...n, children: [...n.children, node] } : n));
  };
  const remove = (parent: QueryGroup, id: string) => {
    pendingFocus.current = `[data-query-node="${parent.id}"] [data-query-part="add-condition"]`;
    update(id, () => null);
  };

  const renderCondition = (c: QueryCondition, index: number, parent: QueryGroup) => {
    const field = fields.find((f) => f.id === c.field);
    const operators = operatorsFor(field);
    return (
      <div role="group" aria-label={t('queryBuilder.condition', { index })} data-query-node={c.id} className={s.condition()}>
        <SimpleSelect
          aria-label={t('queryBuilder.field')}
          items={fields.map((f) => ({ value: f.id, label: f.label }))}
          value={c.field || null}
          onValueChange={(id) => {
            const nextField = fields.find((f) => f.id === id);
            if (nextField) patchCondition(c.id, { field: nextField.id, operator: operatorsFor(nextField)[0] ?? 'eq', value: undefined });
          }}
          disabled={disabled}
          size="sm"
          className={s.fieldSelect()}
        />
        <SimpleSelect<QueryOperator>
          aria-label={t('queryBuilder.operator')}
          items={operators.map((op) => ({ value: op, label: t(`queryBuilder.op.${op}`) }))}
          value={c.operator}
          onValueChange={(op) => {
            if (!op) return;
            const keep = operatorArity(op) === operatorArity(c.operator);
            patchCondition(c.id, { operator: op, value: keep ? c.value : undefined });
          }}
          disabled={disabled || !field}
          size="sm"
          className={s.operatorSelect()}
        />
        <div className={s.value()}>
          <QueryValueEditor condition={c} field={field} onChange={(v: QueryValue | undefined) => patchCondition(c.id, { value: v })} disabled={disabled} locale={locale} />
        </div>
        <IconButton
          icon={X}
          label={t('queryBuilder.removeCondition', { index })}
          size="sm"
          onClick={() => remove(parent, c.id)}
          disabled={disabled}
        />
      </div>
    );
  };

  const renderGroup = (group: QueryGroup, depth: number, parent: QueryGroup | null) => {
    const isRoot = parent === null;
    const joiner = t(group.combinator === 'and' ? 'queryBuilder.and' : 'queryBuilder.or');
    return (
      <div
        role="group"
        aria-label={isRoot ? (ariaLabel ?? t('queryBuilder.label')) : t('queryBuilder.group')}
        data-query-node={group.id}
        className={queryBuilderVariants({ depth: Math.min(depth, 2) as 0 | 1 | 2 }).group()}
      >
        <div className={s.groupHeader()}>
          <ToggleGroup
            aria-label={t('queryBuilder.combinator')}
            size="sm"
            value={[group.combinator]}
            onValueChange={(v) => {
              const combinator = v[0];
              if (combinator === 'and' || combinator === 'or') update(group.id, (n) => (n.type === 'group' ? { ...n, combinator } : n));
            }}
            disabled={disabled}
          >
            <Toggle value="and">{t('queryBuilder.and')}</Toggle>
            <Toggle value="or">{t('queryBuilder.or')}</Toggle>
          </ToggleGroup>
          {!isRoot && <IconButton icon={X} label={t('queryBuilder.removeGroup')} size="sm" onClick={() => remove(parent, group.id)} disabled={disabled} />}
        </div>
        {group.children.length > 0 ? (
          <div className={s.list()}>
            {group.children.map((child, i) => (
              <div key={child.id} className={s.item()}>
                <span aria-hidden className={s.joiner()}>
                  {i === 0 ? '' : joiner}
                </span>
                {child.type === 'condition' ? renderCondition(child, i + 1, group) : renderGroup(child, depth + 1, group)}
              </div>
            ))}
          </div>
        ) : (
          isRoot && <p className={s.empty()}>{t('queryBuilder.empty')}</p>
        )}
        <div className={s.footer()}>
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => addTo(group, createQueryCondition(fields[0]))} disabled={disabled} data-query-part="add-condition">
            {t('queryBuilder.addCondition')}
          </Button>
          {depth + 1 < maxDepth && (
            <Button variant="ghost" size="sm" icon={FolderPlus} onClick={() => addTo(group, createQueryGroup('and', [createQueryCondition(fields[0])]))} disabled={disabled}>
              {t('queryBuilder.addGroup')}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const preview = showPreview ? queryToString(tree, { fields, t }) : '';
  return (
    <div ref={rootRef} className={cn(s.root(), className)}>
      {renderGroup(tree, 0, null)}
      {showPreview && preview && (
        <output aria-live="polite" className={s.preview()}>
          {preview}
        </output>
      )}
    </div>
  );
}

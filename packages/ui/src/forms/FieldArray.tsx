import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from 'lucide-react';
import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  get,
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
  type Control,
  type FieldArray as ArrayItem,
  type FieldArrayPath,
  type FieldPath,
  type FieldValues,
  type Path,
  type UseFieldArrayProps,
} from 'react-hook-form';
import { Fieldset, FieldsetDescription, FieldsetLegend } from '../components/Field';
import { Button, IconButton } from '../components/Button';
import { LiveAnnouncer, useAnnounce, useHasLiveAnnouncer } from '../components/LiveAnnouncer';
import { useI18n } from '../i18n';
import { fieldArrayVariants } from './field-array.variants';

export interface FieldArrayRow<TValues extends FieldValues, TName extends FieldArrayPath<TValues>> {
  index: number;
  remove(): void;
  move(delta: number): void;
  duplicate(): void;
  name<TField extends Path<ArrayItem<TValues, TName>>>(
    field: TField,
  ): `${TName}.${number}.${TField}` & FieldPath<TValues>;
}

export interface FieldArrayProps<
  TValues extends FieldValues,
  TName extends FieldArrayPath<TValues> = FieldArrayPath<TValues>,
> {
  name: TName;
  control?: Control<TValues>;
  defaultItem: ArrayItem<TValues, TName> | (() => ArrayItem<TValues, TName>);
  label?: ReactNode;
  description?: ReactNode;
  rules?: UseFieldArrayProps<TValues, TName>['rules'];
  max?: number;
  min?: number;
  emptyState?: ReactNode;
  reorderable?: boolean;
  duplicable?: boolean;
  layout?: 'inline' | 'card';
  itemLabel?: (n: number) => string;
  addLabel?: ReactNode;
  className?: string;
  children: (row: FieldArrayRow<TValues, TName>) => ReactNode;
}

/** Repeatable object fields in the optional react-hook-form adapter. */
export function FieldArray<
  TValues extends FieldValues,
  TName extends FieldArrayPath<TValues> = FieldArrayPath<TValues>,
>(props: FieldArrayProps<TValues, TName>) {
  const hasAnnouncer = useHasLiveAnnouncer();
  return hasAnnouncer ? (
    <FieldArrayContent {...props} />
  ) : (
    <LiveAnnouncer>
      <FieldArrayContent {...props} />
    </LiveAnnouncer>
  );
}

const focusable =
  'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';
type PendingFocus = { previousIds: Set<string> } | { id: string; element?: HTMLElement } | { add: true };

function RowFields<TValues extends FieldValues, TName extends FieldArrayPath<TValues>>({
  children,
  row,
}: {
  children: FieldArrayProps<TValues, TName>['children'];
  row: FieldArrayRow<TValues, TName>;
}) {
  return children(row);
}

function FieldArrayContent<TValues extends FieldValues, TName extends FieldArrayPath<TValues>>({
  name,
  control: controlProp,
  label,
  description,
  rules,
  children,
  defaultItem,
  max,
  min = 0,
  emptyState,
  reorderable = false,
  duplicable = false,
  layout = 'inline',
  itemLabel,
  addLabel,
  className,
}: FieldArrayProps<TValues, TName>) {
  const context = useFormContext<TValues>();
  const control = controlProp ?? context?.control;
  // RHF skips minLength for an empty array. Preserve its message for that case too.
  const minimum = typeof rules?.minLength === 'object' ? rules.minLength.value : rules?.minLength;
  const arrayRules =
    minimum && minimum > 0
      ? {
          ...rules,
          required: rules?.required ?? {
            value: true,
            message: typeof rules?.minLength === 'object' ? rules.minLength.message : '',
          },
        }
      : rules;
  const {
    fields,
    append,
    insert,
    remove: removeItem,
    move: moveItem,
  } = useFieldArray<TValues, TName>({ name, control, rules: arrayRules });
  // Every array path is also a field path; RHF's two recursive path types need a bridge.
  const path = name as string as FieldPath<TValues>;
  const values = useWatch({ control, name: path });
  const { errors } = useFormState({ control, name: path });
  const arrayError = get(errors, name) as { root?: { message?: unknown }; message?: unknown } | undefined;
  const message = arrayError?.root?.message ?? arrayError?.message;
  const error = typeof message === 'string' ? message : undefined;
  const uid = useId();
  const descriptionId = `${uid}-description`;
  const errorId = `${uid}-error`;
  const { t } = useI18n();
  const labelFor = (n: number) => itemLabel?.(n) ?? t('fieldArray.item', { n });
  const s = fieldArrayVariants({ layout });
  const announce = useAnnounce();
  const rows = useRef(new Map<string, HTMLDivElement>());
  const addButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<PendingFocus | null>(null);
  const full = max !== undefined && fields.length >= max;
  const announceInsertion = (message: string) => {
    const limit = max !== undefined && fields.length + 1 >= max ? t('fieldArray.limit', { max }) : '';
    announce([message, limit].filter(Boolean).join(' '));
  };
  useLayoutEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = null;
    if ('add' in pending) {
      addButton.current?.focus();
      return;
    }
    const id = 'previousIds' in pending ? fields.find((field) => !pending.previousIds.has(field.id))?.id : pending.id;
    const element = 'element' in pending ? pending.element : undefined;
    (element?.isConnected ? element : id ? rows.current.get(id)?.querySelector<HTMLElement>(focusable) : null)?.focus();
  });
  const add = () => {
    if (full) {
      announce(t('fieldArray.limit', { max: max ?? 0 }));
      return;
    }
    pendingFocus.current = { previousIds: new Set(fields.map((field) => field.id)) };
    append(
      structuredClone(
        typeof defaultItem === 'function' ? (defaultItem as () => ArrayItem<TValues, TName>)() : defaultItem,
      ),
      { shouldFocus: false },
    );
    announceInsertion(t('fieldArray.added', { item: labelFor(fields.length + 1) }));
  };
  const remove = (index: number) => {
    if (fields.length <= min) return;
    const neighbour = fields[index + 1] ?? fields[index - 1];
    pendingFocus.current = neighbour ? { id: neighbour.id } : { add: true };
    removeItem(index);
    announce(t('fieldArray.removed', { item: labelFor(index + 1) }));
  };
  const move = (index: number, delta: number) => {
    const destination = index + delta;
    const field = fields[index];
    if (
      !reorderable ||
      !field ||
      !Number.isInteger(delta) ||
      destination < 0 ||
      destination >= fields.length ||
      delta === 0
    )
      return;
    const active = document.activeElement;
    pendingFocus.current = {
      id: field.id,
      element: active instanceof HTMLElement && rows.current.get(field.id)?.contains(active) ? active : undefined,
    };
    moveItem(index, destination);
    announce(t('fieldArray.moved', { n: destination + 1, total: fields.length }));
  };
  const duplicate = (index: number) => {
    if (!duplicable || full) return;
    const value = (values as ArrayItem<TValues, TName>[] | undefined)?.[index];
    if (!value) return;
    pendingFocus.current = { previousIds: new Set(fields.map((field) => field.id)) };
    insert(index + 1, structuredClone(value), { shouldFocus: false });
    announceInsertion(t('fieldArray.duplicated', { item: labelFor(index + 1) }));
  };
  return (
    <Fieldset
      data-field-array=""
      className={s.root({ className })}
      aria-describedby={[description ? descriptionId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}
      aria-invalid={!!error || undefined}
    >
      {label && <FieldsetLegend>{label}</FieldsetLegend>}
      {description && <FieldsetDescription id={descriptionId}>{description}</FieldsetDescription>}
      <div className={s.list()}>
        {fields.map((field, index) => (
          <div
            className={s.row()}
            key={field.id}
            ref={(element) => {
              if (element) rows.current.set(field.id, element);
              else rows.current.delete(field.id);
            }}
            role="group"
            aria-label={labelFor(index + 1)}
            onKeyDown={(event) => {
              if (
                event.target instanceof Element &&
                event.target.closest('[data-field-array]') !== event.currentTarget.closest('[data-field-array]')
              )
                return;
              if (reorderable && event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
                event.preventDefault();
                event.stopPropagation();
                move(index, event.key === 'ArrowUp' ? -1 : 1);
              }
            }}
          >
            <div className={s.fields()}>
              <RowFields
                row={{
                  index,
                  remove: () => remove(index),
                  move: (delta) => move(index, delta),
                  duplicate: () => duplicate(index),
                  name: (part) =>
                    `${name}.${index}.${part}` as `${TName}.${number}.${typeof part}` & FieldPath<TValues>,
                }}
              >
                {children}
              </RowFields>
            </div>
            <div className={s.actions()}>
              {reorderable && (
                <>
                  <IconButton
                    icon={ArrowUp}
                    label={t('fieldArray.moveUp', { item: labelFor(index + 1) })}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  />
                  <IconButton
                    icon={ArrowDown}
                    label={t('fieldArray.moveDown', { item: labelFor(index + 1) })}
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, 1)}
                  />
                </>
              )}
              {duplicable && (
                <IconButton
                  icon={Copy}
                  label={t('fieldArray.duplicate', { item: labelFor(index + 1) })}
                  disabled={full}
                  onClick={() => duplicate(index)}
                />
              )}
              <IconButton
                icon={Trash2}
                label={t('fieldArray.remove', { item: labelFor(index + 1) })}
                disabled={fields.length <= min}
                onClick={() => remove(index)}
              />
            </div>
          </div>
        ))}
      </div>
      {!fields.length && (emptyState ?? <p className={s.hint()}>{t('fieldArray.empty')}</p>)}
      <div className={s.footer()}>
        <Button ref={addButton} icon={Plus} variant="secondary" disabled={full} onClick={add}>
          {addLabel ?? t('fieldArray.add')}
        </Button>
        {full && <p className={s.hint()}>{t('fieldArray.limit', { max: max ?? 0 })}</p>}
      </div>
      {error && (
        <p id={errorId} className={s.error()}>
          {error}
        </p>
      )}
    </Fieldset>
  );
}

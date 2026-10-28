import { Pencil } from 'lucide-react';
import { IconButton } from '../Button/Button';
import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useI18n } from '../../i18n';
import { Spinner } from '../Spinner/Spinner';
import { Textarea } from '../Textarea/Textarea';
import { Input } from '../Input/Input';
import { editableTextVariants } from './editable-text.variants';
import { useInlineEdit, type EditableSaveResult } from './useInlineEdit';

export interface EditableTextProps {
  value?: string;
  defaultValue?: string;
  label: string;
  onSave: (next: string) => EditableSaveResult | Promise<EditableSaveResult>;
  onCancel?: () => void;
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  activation?: 'click' | 'dblclick' | 'button';
  multiline?: boolean;
  maxLength?: number;
  validate?: (value: string) => string | undefined;
  trim?: boolean;
  submitOnBlur?: boolean;
}

/** Click-to-edit text for names and titles. */
export function EditableText({
  value,
  defaultValue = '',
  label,
  className,
  onSave,
  onCancel,
  activation = 'click',
  trim = true,
  validate,
  maxLength,
  placeholder,
  submitOnBlur = true,
  multiline = false,
  editing,
  defaultEditing,
  onEditingChange,
  disabled = false,
}: EditableTextProps) {
  const { t } = useI18n();
  const hintId = useId();
  const errorId = useId();
  const field = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [innerValue, setInnerValue] = useState(defaultValue);
  const currentValue = value ?? innerValue;
  const restoreFocus = useRef(true);
  const trigger = useRef<HTMLButtonElement>(null);
  const state = useInlineEdit({
    value: currentValue,
    editing,
    defaultEditing,
    onEditingChange,
    genericError: t('editableText.saveFailed'),
    focusEditor: () => field.current?.focus(),
    parse: (draft) => ({ ok: true, value: trim ? draft.trim() : draft }),
    onSave: (next) => onSave(next),
    onAccepted: setInnerValue,
    onCancel,
    validate,
    onMove: () => {
      if (restoreFocus.current) trigger.current?.focus();
    },
  });
  const focusOnMount = useCallback((el: HTMLInputElement | HTMLTextAreaElement | null) => {
    field.current = el;
    if (el) restoreFocus.current = true;
    el?.focus();
    el?.select();
  }, []);
  const s = editableTextVariants();
  const common = {
    ref: focusOnMount,
    'aria-label': label,
    'aria-describedby': state.error !== null ? errorId : undefined,
    'aria-busy': state.pending || undefined,
    readOnly: state.pending,
    invalid: state.error !== null,
    disabled,
    maxLength,
    placeholder,
    value: state.draft,
    onValueChange: state.setDraft,
    onFocus: () => {
      restoreFocus.current = true;
    },
    onBlur: () => {
      restoreFocus.current = false;
      if (!state.editing || state.busy.current) return;
      if (submitOnBlur) void state.commit(null);
      else state.cancel(null);
    },
    onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (state.busy.current) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        state.cancel();
      } else if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey) && !e.nativeEvent.isComposing) {
        e.preventDefault();
        void state.commit();
      }
    },
  };
  const spinner = state.pending ? <Spinner label={t('editableText.saving')} /> : undefined;
  return (
    <span
      className={s.root({ className })}
      data-editing={state.editing || undefined}
      data-pending={state.pending || undefined}
      data-invalid={state.error !== null || undefined}
    >
      {state.editing ? (
        multiline ? (
          <span className="relative inline-flex items-start gap-1">
            <Textarea {...common} autosize className={s.field()} />
            {spinner}
          </span>
        ) : (
          <Input
            {...common}
            className={s.field({ className: 'h-auto min-h-8 py-1' })}
            inputClassName={s.field()}
            trailingAddon={spinner}
          />
        )
      ) : activation === 'button' ? (
        <span className="inline-flex items-center gap-1">
          <span>{currentValue || placeholder}</span>
          <IconButton
            disabled={disabled}
            ref={trigger}
            variant="ghost"
            icon={Pencil}
            label={t('editableText.edit', { label })}
            onClick={state.start}
          />
        </span>
      ) : (
        <button
          disabled={disabled}
          ref={trigger}
          type="button"
          aria-label={!currentValue && !placeholder ? label : undefined}
          aria-describedby={hintId}
          onClick={activation === 'click' ? state.start : undefined}
          onDoubleClick={activation === 'dblclick' ? state.start : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              state.start();
            }
          }}
          className={s.preview()}
        >
          {currentValue || placeholder}
        </button>
      )}
      {state.error !== null && (
        <span id={errorId} role="alert" className={s.error()}>
          {state.error}
        </span>
      )}
      <span id={hintId} hidden>
        {t('editableText.hint')}
      </span>
    </span>
  );
}

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  DatePicker,
  Input,
  Switch,
  Textarea,
  cn,
} from '@gntik-ai/ui';
import { useState, type FocusEvent, type KeyboardEvent, type Ref } from 'react';
import type { DataTableCellEditor } from './data-table-utils';
import type { DataTableEditValue, DataTableEditorContext } from './row-edit-types';

interface CellEditorProps {
  editor: DataTableCellEditor;
  value: DataTableEditValue;
  setValue: (value: DataTableEditValue) => void;
  inputProps: DataTableEditorContext<unknown>['inputProps'];
  pending?: boolean;
  focusRef?: Ref<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement>;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
}
/** Shared kit editors. Composite popups own their selection keys until they close. */
export function CellEditor({
  editor,
  value,
  setValue,
  inputProps,
  pending,
  focusRef,
  onKeyDown,
  onBlur,
}: CellEditorProps) {
  const [open, setOpen] = useState(false);
  const common = { ...inputProps, 'aria-busy': pending || undefined, 'aria-disabled': pending || undefined };
  const text = value == null ? '' : String(value);
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || (editor.type === 'textarea' && event.key === 'Enter' && event.shiftKey)) return;
    onKeyDown(event);
  };
  if (editor.type === 'select')
    return (
      <select
        ref={focusRef as Ref<HTMLSelectElement>}
        value={text}
        onChange={(event) => {
          if (!pending) setValue(event.target.value);
        }}
        className={cn(
          'h-8 w-full rounded-md border border-input bg-background px-2 text-[13px] text-foreground',
          'focus-ring',
          common['aria-invalid'] && 'border-destructive',
        )}
        {...common}
        onKeyDown={keyDown}
        onBlur={onBlur}
      >
        {editor.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  if (editor.type === 'textarea')
    return (
      <Textarea
        {...common}
        ref={focusRef as Ref<HTMLTextAreaElement>}
        rows={editor.rows}
        value={text}
        readOnly={pending}
        onValueChange={setValue}
        onKeyDown={keyDown}
        onBlur={onBlur}
        invalid={!!common['aria-invalid']}
      />
    );
  if (editor.type === 'switch')
    return (
      <Switch
        {...common}
        ref={focusRef as Ref<HTMLButtonElement>}
        checked={text === 'true'}
        readOnly={pending}
        onCheckedChange={(checked) => setValue(String(checked))}
        onKeyDown={keyDown}
        onBlur={onBlur}
      />
    );
  if (editor.type === 'date') {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(`${text}T00:00:00`) : null;
    return (
      <div
        onKeyDownCapture={(event) => {
          if (!open && event.key === 'Enter' && event.currentTarget.contains(event.target as Node)) keyDown(event);
        }}
        onKeyDown={(event) => {
          if (!open && event.key !== 'Enter') keyDown(event);
        }}
      >
        <DatePicker
          ref={focusRef as Ref<HTMLInputElement>}
          aria-label={common['aria-label']}
          aria-describedby={common['aria-describedby']}
          invalid={!!common['aria-invalid']}
          value={date}
          readOnly={pending}
          open={open}
          onOpenChange={setOpen}
          timeZone="system"
          onValueChange={(next) =>
            setValue(
              next
                ? `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
                : null,
            )
          }
        />
      </div>
    );
  }
  if (editor.type === 'combobox')
    return (
      <Combobox
        items={editor.options}
        value={editor.options.find((option) => option.value === text) ?? null}
        onValueChange={(option) => {
          if (!pending) setValue(option?.value ?? null);
        }}
        open={open}
        onOpenChange={setOpen}
      >
        <ComboboxInput
          {...common}
          ref={focusRef as Ref<HTMLInputElement>}
          readOnly={pending}
          onKeyDown={(event) => {
            if (!open) keyDown(event);
          }}
        />
        <ComboboxContent>
          {(option: { value: string; label: string }) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
    );
  return (
    <Input
      ref={focusRef as Ref<HTMLInputElement>}
      type={editor.type === 'number' ? 'number' : 'text'}
      inputMode={editor.type === 'number' ? 'decimal' : undefined}
      min={editor.type === 'number' ? editor.min : undefined}
      max={editor.type === 'number' ? editor.max : undefined}
      step={editor.type === 'number' ? editor.step : undefined}
      placeholder={editor.type === 'text' ? editor.placeholder : undefined}
      value={text}
      readOnly={pending}
      onChange={(event) => setValue(event.target.value)}
      invalid={!!common['aria-invalid']}
      className="w-full"
      {...common}
      onKeyDown={keyDown}
      onBlur={onBlur}
    />
  );
}

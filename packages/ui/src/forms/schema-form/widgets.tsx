import { useId } from 'react';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { PasswordInput } from '../../components/PasswordInput';
import { DatePicker } from '../../components/DatePicker';
import { NumberInput } from '../../components/NumberInput';
import { Radio, RadioGroup } from '../../components/RadioGroup';
import { SimpleSelect } from '../../components/Select';
import { MultiSelect } from '../../components/MultiSelect';
import { Switch } from '../../components/Switch';
import { TokenInput } from '../../components/TokenInput';
import { toCheckedProps, toValueProps, type BindingControlProps } from '../bindings';
import type { JsonSchema } from './types';

export interface DefaultWidgetProps {
  schema: JsonSchema;
  controlProps: BindingControlProps<unknown>;
  label: string;
  placeholder?: string;
  json?: boolean;
}
/** Thin adapters: every composite ref goes through the kit bindings for focus-on-error. */
export function DefaultWidget({ schema, controlProps, label, placeholder, json }: DefaultWidgetProps) {
  const id = useId();
  const p = toValueProps(controlProps);
  const text = typeof p.value === 'string' ? p.value : '';
  if (json) return <Textarea {...p} value={text} placeholder={placeholder} />;
  const options =
    schema.enum?.map((value) => ({ value, label: String(value) })) ??
    schema.oneOf?.map((item) => ({ value: item.const, label: item.title ?? String(item.const) }));
  if (options) {
    // The kit select uses string identities; indexes preserve typed JSON consts (including null).
    if (options.length > 5)
      return (
        <SimpleSelect
          {...p}
          value={
            options.findIndex((o) => JSON.stringify(o.value) === JSON.stringify(p.value)) < 0
              ? null
              : String(options.findIndex((o) => JSON.stringify(o.value) === JSON.stringify(p.value)))
          }
          onValueChange={(key) => p.onValueChange(key === null ? undefined : options[Number(key)]?.value)}
          items={options.map((o, i) => ({ value: String(i), label: o.label }))}
          placeholder={placeholder}
        />
      );
    return (
      <RadioGroup {...p} aria-label={label}>
        {options.map((item, i) => (
          <Radio
            key={i}
            value={item.value}
            aria-labelledby={`${id}-${i}`}
            label={<span id={`${id}-${i}`}>{item.label}</span>}
          />
        ))}
      </RadioGroup>
    );
  }
  if (schema.type === 'boolean') return <Switch {...toCheckedProps(controlProps)} />;
  if (schema.type === 'number' || schema.type === 'integer')
    return (
      <NumberInput
        {...p}
        value={typeof p.value === 'number' ? p.value : null}
        min={schema.minimum}
        max={schema.maximum}
        step={schema.multipleOf ?? (schema.type === 'integer' ? 1 : 'any')}
        placeholder={placeholder}
      />
    );
  if (schema.type === 'array') {
    const value = Array.isArray(p.value) ? p.value.filter((v): v is string => typeof v === 'string') : [];
    if (schema.items?.enum)
      return (
        <MultiSelect
          {...p}
          value={value}
          options={schema.items.enum.map((v) => ({ value: String(v), label: String(v) }))}
          placeholder={placeholder}
        />
      );
    return (
      <TokenInput
        {...p}
        value={value}
        placeholder={placeholder}
        maxItems={schema.maxItems}
        allowDuplicates={!schema.uniqueItems}
      />
    );
  }
  if (schema.format === 'date' || schema.format === 'date-time') {
    const date = text ? new Date(schema.format === 'date' ? `${text}T00:00:00` : text) : null;
    return (
      <DatePicker
        {...p}
        aria-label={label}
        value={date && !Number.isNaN(date.getTime()) ? date : null}
        withTime={schema.format === 'date-time'}
        timeZone="system"
        placeholder={placeholder}
        onValueChange={(next) =>
          p.onValueChange(
            next
              ? schema.format === 'date'
                ? `${String(next.getFullYear()).padStart(4, '0')}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
                : next.toISOString()
              : '',
          )
        }
      />
    );
  }
  const stringProps = { ...p, value: text, placeholder, maxLength: schema.maxLength };
  if (schema.writeOnly || schema.format === 'password') return <PasswordInput {...stringProps} />;
  if ((schema.maxLength ?? 0) > 255) return <Textarea {...stringProps} />;
  return (
    <Input {...stringProps} type={schema.format === 'email' ? 'email' : schema.format === 'uri' ? 'url' : 'text'} />
  );
}

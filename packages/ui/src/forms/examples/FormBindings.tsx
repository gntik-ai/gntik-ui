import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '../../components/Button';
import { Checkbox } from '../../components/Checkbox';
import { DatePicker, DateRangePicker } from '../../components/DatePicker';
import { Input } from '../../components/Input';
import { MultiSelect } from '../../components/MultiSelect';
import { NumberInput } from '../../components/NumberInput';
import { RadioGroup, Radio } from '../../components/RadioGroup';
import { SimpleSelect } from '../../components/Select';
import { Switch } from '../../components/Switch';
import { Textarea } from '../../components/Textarea';
import { TimePicker } from '../../components/TimePicker';
import { useI18n } from '../../i18n';
import { Form, FormField, type FormFieldWidth } from '..';

type Values = {
  name: string;
  note: string;
  alerts: boolean;
  digest: boolean;
  role: string | null;
  tags: string[];
  date: Date | null;
  range: { start: Date | null; end: Date | null };
  time: string | null;
  count: number;
  department: string;
  team: string | null;
};

export default function FormBindings() {
  const { t } = useI18n();
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [width, setWidth] = useState<FormFieldWidth | null>('sm');
  const [saved, setSaved] = useState(false);
  const form = useForm<Values>({
    mode: 'onTouched',
    defaultValues: {
      name: '',
      note: '',
      alerts: false,
      digest: false,
      role: null,
      tags: [],
      date: null,
      range: { start: null, end: null },
      time: null,
      count: 1,
      department: 'engineering',
      team: null,
    },
  });
  const department = useWatch({ control: form.control, name: 'department' });
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <Switch checked={disabled} onCheckedChange={setDisabled} label={t('forms.bindings.disabled')} />
        <Switch checked={readOnly} onCheckedChange={setReadOnly} label={t('forms.bindings.readOnly')} />
        <SimpleSelect<FormFieldWidth>
          label={t('forms.bindings.width')}
          value={width}
          onValueChange={setWidth}
          placeholder={t('forms.bindings.fullWidth')}
          items={(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((value) => ({
            value,
            label: t(`forms.bindings.width.${value}`),
          }))}
        />
        <Button onClick={() => setWidth(null)}>{t('forms.bindings.fullWidth')}</Button>
      </div>
      <Form
        form={form}
        onSubmit={() => setSaved(true)}
        aria-label={t('forms.bindings.title')}
        enhanceFieldProps={() => ({ disabled, readOnly })}
        className="grid gap-4"
      >
        <FormField<Values, 'name'> name="name" label={t('forms.bindings.name')} width={width ?? undefined}>
          {(p) => <Input {...p} />}
        </FormField>
        <FormField<Values, 'note'> name="note" label={t('forms.bindings.note')}>
          {(p) => <Textarea {...p} />}
        </FormField>
        <FormField<Values, 'alerts'> name="alerts" bind="checked" label={t('forms.bindings.alerts')}>
          {(p) => <Switch {...p} />}
        </FormField>
        <FormField<Values, 'digest'> name="digest" bind="checked" label={t('forms.bindings.digest')}>
          {(p) => <Checkbox {...p} />}
        </FormField>
        <FormField<Values, 'role'> name="role" bind="value" label={t('forms.bindings.role')}>
          {(p) => (
            <RadioGroup {...p} aria-label={t('forms.bindings.role')}>
              <Radio value="viewer" label={t('forms.bindings.viewer')} />
              <Radio value="editor" label={t('forms.bindings.editor')} />
            </RadioGroup>
          )}
        </FormField>
        <FormField<Values, 'tags'> name="tags" bind="value" label={t('forms.bindings.tags')}>
          {(p) => (
            <MultiSelect
              removeLabel={(label) => t('common.removeItem', { label })}
              {...p}
              value={p.value ?? []}
              options={[
                { value: 'updates', label: t('forms.bindings.updates') },
                { value: 'events', label: t('forms.bindings.events') },
              ]}
            />
          )}
        </FormField>
        <FormField<Values, 'date'> name="date" bind="value" label={t('forms.bindings.date')}>
          {(p) => <DatePicker {...p} />}
        </FormField>
        <FormField<Values, 'range'> name="range" bind="value" label={t('forms.bindings.range')}>
          {(p) => <DateRangePicker {...p} value={p.value ?? { start: null, end: null }} />}
        </FormField>
        <FormField<Values, 'time'> name="time" bind="value" label={t('forms.bindings.time')}>
          {(p) => <TimePicker {...p} />}
        </FormField>
        <FormField<Values, 'count'> name="count" bind="value" label={t('forms.bindings.count')}>
          {(p) => <NumberInput {...p} min={1} />}
        </FormField>
        <FormField<Values, 'department'> name="department" bind="value" label={t('forms.bindings.department')}>
          {(p) => (
            <SimpleSelect
              {...p}
              items={[
                { value: 'engineering', label: t('forms.bindings.engineering') },
                { value: 'design', label: t('forms.bindings.design') },
              ]}
              onValueChange={(next) => {
                p.onValueChange(next);
                form.setValue('team', null);
              }}
            />
          )}
        </FormField>
        <FormField<Values, 'team'>
          name="team"
          bind="value"
          label={t('forms.bindings.team')}
          description={t('forms.bindings.dependent')}
        >
          {/* Watching the parent and changing key clears cached options; no deps option is needed. */}
          {(p) => (
            <SimpleSelect
              {...p}
              key={department}
              loadOptions={async () =>
                department === 'design'
                  ? [{ value: 'research', label: t('forms.bindings.research') }]
                  : [{ value: 'platform', label: t('forms.bindings.platform') }]
              }
            />
          )}
        </FormField>
        <Button type="submit" disabled={disabled}>
          {t('common.save')}
        </Button>
        <p role="status" className="text-sm text-muted-foreground">
          {saved ? t('forms.bindings.saved') : ''}
        </p>
      </Form>
    </div>
  );
}

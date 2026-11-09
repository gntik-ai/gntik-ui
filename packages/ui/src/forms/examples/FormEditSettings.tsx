import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { Field, FieldLabel } from '../../components/Field';
import { Input } from '../../components/Input';
import { SimpleSelect } from '../../components/Select';
import { useI18n } from '../../i18n';
import { Form, FormField, FormReset, FormSubmit, useFormActions } from '..';

// Kit Buttons stand in for a consumer's action bar, without importing blocks into ui.
function SettingsActions() {
  const { submit, reset, isDirty, isSubmitting } = useFormActions();
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={submit} disabled={!isDirty} loading={isSubmitting}>
        {t('forms.edit.saveAction')}
      </Button>
      <Button variant="ghost" onClick={reset} disabled={!isDirty || isSubmitting}>
        {t('forms.edit.discardAction')}
      </Button>
    </div>
  );
}

export default function FormEditSettings() {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const [afterSubmit, setAfterSubmit] = useState<'keep' | 'rebase' | 'reset'>('rebase');
  const form = useForm({ defaultValues: { name: t('forms.edit.defaultName') } });
  return (
    <div className="grid w-full max-w-md gap-5">
      <Field>
        <FieldLabel>{t('forms.edit.afterSubmit')}</FieldLabel>
        <SimpleSelect
          value={afterSubmit}
          onValueChange={(value) => {
            if (value) setAfterSubmit(value);
          }}
          items={[
            { value: 'keep', label: t('forms.edit.keep') },
            { value: 'rebase', label: t('forms.edit.rebase') },
            { value: 'reset', label: t('forms.edit.reset') },
          ]}
        />
      </Field>
      <Form
        form={form}
        afterSubmit={afterSubmit}
        onSubmit={async () => {
          setSaved(false);
          await new Promise<void>((resolve) => setTimeout(resolve, 500));
          setSaved(true);
        }}
        aria-label={t('forms.edit.title')}
        className="grid gap-5"
      >
        <FormField name="name" label={t('forms.bindings.name')} rules={{ required: t('forms.edit.requiredName') }}>
          {(props) => <Input {...props} />}
        </FormField>
        <div className="flex items-center gap-3">
          <FormSubmit disableWhenClean />
          <FormReset />
        </div>
        <SettingsActions />
        <p role="status" className="text-sm text-muted-foreground">
          {saved ? t('forms.edit.saved') : ''}
        </p>
      </Form>
    </div>
  );
}

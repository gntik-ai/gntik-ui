import { FormSection, PageHeader, StickyActionBar, ValidationSummary } from '@gntik-ai/blocks';
import {
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Page,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Stack,
  Textarea,
  type BreadcrumbItem,
} from '@gntik-ai/ui';
import { useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  FIELD_IDS,
  formBreadcrumbs,
  formInitialValues,
  formRegions,
  validateResourceForm,
  type RegionOption,
  type ResourceFormValues,
} from './data';

export interface ResourceFormProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  initialValues: ResourceFormValues;
  regions: readonly RegionOption[];
  /** Called with valid values; return a promise to show the saving state until it settles. */
  onSubmit: (values: ResourceFormValues) => void | Promise<void>;
  /** Discard: called after the form is reset to its initial values. */
  onCancel: () => void;
  shell: Omit<ConsoleShellProps, 'children'>;
}

const same = (a: ResourceFormValues, b: ResourceFormValues) =>
  a.name === b.name && a.description === b.description && a.region === b.region && a.billingEmail === b.billingEmail && a.sendInvoices === b.sendInvoices;

/** Edit (or create) form: two-column FormSections, an error summary after submit, and a sticky save bar. */
export default function ResourceFormPage({
  title = 'Edit project',
  description = 'Details, region and billing for billing-dashboard.',
  breadcrumbs = formBreadcrumbs,
  initialValues = formInitialValues,
  regions = formRegions,
  onSubmit,
  onCancel,
  shell,
}: Partial<ResourceFormProps>) {
  const [baseline, setBaseline] = useState(initialValues);
  const [values, setValues] = useState(initialValues);
  const [submitCount, setSubmitCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const errors = submitCount > 0 ? validateResourceForm(values) : [];
  const errorFor = (fieldId: string) => errors.find((e) => e.fieldId === fieldId)?.message;
  const set = <K extends keyof ResourceFormValues>(key: K, value: ResourceFormValues[K]) => setValues((v) => ({ ...v, [key]: value }));

  const save = async () => {
    setSubmitCount((n) => n + 1);
    if (validateResourceForm(values).length > 0) return;
    setSaving(true);
    try {
      await onSubmit?.(values);
      setBaseline(values);
      setSubmitCount(0);
    } finally {
      setSaving(false);
    }
  };

  const nameError = errorFor(FIELD_IDS.name);
  const regionError = errorFor(FIELD_IDS.region);
  const emailError = errorFor(FIELD_IDS.billingEmail);

  return (
    <ConsoleShell currentHref="/projects" breadcrumbs={breadcrumbs} {...shell}>
      <Page header={<PageHeader breadcrumbs={null} title={title} description={description} status="" meta={[]} actions={[]} tabs={null} />}>
        <form
          noValidate
          aria-label={title}
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <Stack gap={8}>
            <ValidationSummary errors={errors} submitCount={submitCount} />
            <FormSection title="General" description="Basic details shown to everyone who can access this project.">
              <Stack gap={4}>
                <Field invalid={nameError != null}>
                  <FieldLabel required>Project name</FieldLabel>
                  <Input id={FIELD_IDS.name} required value={values.name} onValueChange={(v) => set('name', v)} />
                  <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
                  <FieldError match={nameError != null}>{nameError}</FieldError>
                </Field>
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea rows={3} value={values.description} onValueChange={(v) => set('description', v)} />
                </Field>
              </Stack>
            </FormSection>
            <FormSection divided title="Region" description="Where the project's services run. It cannot be changed later.">
              <Field invalid={regionError != null}>
                <FieldLabel required>Region</FieldLabel>
                <Select value={values.region || null} onValueChange={(v) => set('region', v ?? '')} items={regions.map(({ value, label }) => ({ value, label }))}>
                  <SelectTrigger id={FIELD_IDS.region} className="w-full sm:max-w-sm" placeholder="Choose a region" />
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError match={regionError != null}>{regionError}</FieldError>
              </Field>
            </FormSection>
            <FormSection divided title="Billing" description="Who receives invoices and usage alerts for this project.">
              <Stack gap={4}>
                <Field invalid={emailError != null}>
                  <FieldLabel required>Billing email</FieldLabel>
                  <Input id={FIELD_IDS.billingEmail} type="email" required value={values.billingEmail} onValueChange={(v) => set('billingEmail', v)} />
                  <FieldError match={emailError != null}>{emailError}</FieldError>
                </Field>
                <Checkbox
                  label="Email invoices to this address"
                  description="A PDF copy is sent on the first day of each month."
                  checked={values.sendInvoices}
                  onCheckedChange={(checked) => set('sendInvoices', checked)}
                />
              </Stack>
            </FormSection>
            <StickyActionBar
              dirty={!same(values, baseline)}
              saving={saving}
              onSave={() => void save()}
              onCancel={() => {
                setValues(baseline);
                setSubmitCount(0);
                onCancel?.();
              }}
            />
          </Stack>
        </form>
      </Page>
    </ConsoleShell>
  );
}

// The optional form peer already resolves in this package. This docs-only example does not add a blocks dependency.
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Form } from '@gntik-ai/ui/forms';
import { Button, useI18n } from '@gntik-ai/ui';
import { DataTable } from '../../blocks/src/tables/DataTable/DataTable';
import type { DataTableColumn } from '../../blocks/src/tables/DataTable/data-table-utils';

type Values = { items: { id: string; name: string; quota: number }[] };
export default function DataTableFieldArray() {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<Values>({
    defaultValues: {
      items: [
        { id: 'a', name: 'api-gateway', quota: 100 },
        { id: 'b', name: 'billing', quota: 200 },
      ],
    },
  });
  // Keep the domain id stable when useFieldArray regenerates its own key on update.
  const { fields, update, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
    keyName: 'fieldKey',
  });
  type Row = (typeof fields)[number];
  const columns: DataTableColumn<Row>[] = [
    {
      id: 'name',
      header: t('table.example.name'),
      accessor: (row) => row.name,
      editable: true,
      validate: (value) => (value ? undefined : t('table.example.required')),
    },
    {
      id: 'quota',
      header: t('table.example.quota'),
      accessor: (row) => row.quota,
      editable: true,
      editor: { type: 'number', min: 0 },
    },
  ];
  return (
    <Form form={form} onSubmit={() => setSubmitted(true)} className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{t('table.example.fieldArrayTitle')}</h3>
      <p className="text-sm text-muted-foreground">{t('table.example.fieldArrayHelp')}</p>
      <DataTable
        rows={fields}
        columns={columns}
        caption={t('table.example.fieldArrayTitle')}
        editMode="row"
        selectionMode="none"
        paginated={false}
        onRowSave={({ rowId, values }) => {
          const index = fields.findIndex((row) => row.id === rowId);
          update(index, { id: rowId, name: String(values.name ?? ''), quota: Number(values.quota) });
        }}
        onRowAdd={(values) =>
          append(
            { id: crypto.randomUUID(), name: String(values.name ?? ''), quota: Number(values.quota) },
            { shouldFocus: false },
          )
        }
        newRowDefaults={() => ({ name: '', quota: 100 })}
        onRowDelete={(row) => remove(fields.findIndex((field) => field.id === row.id))}
      />
      <Button type="submit">{t('table.example.submit')}</Button>
      <p role="status">{submitted ? t('table.example.submitted') : ''}</p>
    </Form>
  );
}

import { Field, FieldLabel, Input, Page, Stack } from '@gntik-ai/ui';
import { useState } from 'react';
import { FormSection } from '../../../forms/FormSection/FormSection';
import { NoResultsEmpty } from '../../../feedback/EmptyStates/EmptyStates';
import { StickyActionBar } from '../../../page-chrome/StickyActionBar/StickyActionBar';
import { SubordinateList } from '../SubordinateList';
import type { DataTableColumn } from '../../DataTable/data-table-utils';

interface RecordRow {
  id: string;
  name: string;
  status: string;
}
const columns: DataTableColumn<RecordRow>[] = [
  { id: 'name', header: 'Name', accessor: (row) => row.name },
  { id: 'status', header: 'Status', accessor: (row) => row.status },
];
const history: RecordRow[] = Array.from({ length: 37 }, (_, i) => ({
  id: `record-${i}`,
  name: `Revision ${i + 1}`,
  status: 'Completed',
}));
const consumers: RecordRow[] = [
  { id: 'worker', name: 'Worker', status: 'Current' },
  { id: 'scheduler', name: 'Scheduler', status: 'Current' },
];

export type ExampleState = 'default' | 'loading' | 'empty' | 'error';

/** A resource-form host owns the form and sticky save bar; its two lists load independently. */
export default function ResourceFormExample({ state = 'default' }: { state?: ExampleState }) {
  const [name, setName] = useState('Shared resource');
  const [savedName, setSavedName] = useState(name);
  const [offset, setOffset] = useState(0);
  const [failed, setFailed] = useState(state === 'error');
  return (
    <Page title="Resource settings" description="Edit a resource and review its related records.">
      <form
        aria-label="Resource settings"
        onSubmit={(event) => {
          event.preventDefault();
          setSavedName(name);
        }}
      >
        <Stack gap={8}>
          <FormSection title="General" description="Settings for this resource." actions={null} headingLevel="h2" divided={false}>
            <Field>
              <FieldLabel>Resource name</FieldLabel>
              <Input value={name} onValueChange={setName} />
            </Field>
          </FormSection>
          <SubordinateList
            title="History"
            headingLevel="h2"
            count={state === 'empty' ? 0 : history.length}
            columns={columns}
            rows={state === 'empty' ? [] : history.slice(offset, offset + 10)}
            getRowId={(row) => row.id}
            pagination={{
              limit: 10,
              offset,
              total: state === 'empty' ? 0 : history.length,
              onPageChange: setOffset,
            }}
            loading={state === 'loading'}
            error={
              failed
                ? {
                    title: 'History unavailable',
                    message: 'Please retry to load the history.',
                    code: null,
                  }
                : null
            }
            onRetry={() => setFailed(false)}
            emptyState={
              <NoResultsEmpty
                query=""
                filterCount={0}
                entity="history records"
                titleAs="h3"
                bordered={true}
                className=""
                onClearFilters={() => {}}
                onClearSearch={() => {}}
              />
            }
          />
          <SubordinateList
            title="Consumers"
            headingLevel="h2"
            count={consumers.length}
            columns={columns}
            rows={consumers}
            getRowId={(row) => row.id}
            pagination={null}
            loading={false}
            error={null}
            onRetry={() => {}}
            emptyState={
              <NoResultsEmpty
                query=""
                filterCount={0}
                entity="consumers"
                titleAs="h3"
                bordered={true}
                className=""
                onClearFilters={() => {}}
                onClearSearch={() => {}}
              />
            }
          />
          <StickyActionBar dirty={name !== savedName} saving={false} onSave={() => setSavedName(name)} onCancel={() => setName(savedName)} />
        </Stack>
      </form>
    </Page>
  );
}

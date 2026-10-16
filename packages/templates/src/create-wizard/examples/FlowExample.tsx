import { Field, FieldLabel, Input, LiveAnnouncer } from '@gntik-ai/ui';
import { useState } from 'react';
import CreateWizardPage from '../Page';
import type { CreateWizardSubmitState } from '../Flow';
import { flowLabels } from './labels';

/** Keep the announcer at page level if onComplete closes the wizard. */
export default function FlowExample({
  outcome = 'success',
  submitState,
}: {
  outcome?: 'pending' | 'success' | 'error';
  submitState?: CreateWizardSubmitState;
}) {
  const [controlled] = useState(() => submitState !== undefined);
  const [callerState, setCallerState] = useState<CreateWizardSubmitState>(submitState ?? { status: 'idle' });
  const target = submitState?.status === 'submitting' ? 'pending' : submitState?.status === 'error' ? 'error' : outcome;
  return (
    <LiveAnnouncer>
      <CreateWizardPage
        labels={flowLabels}
        initialValues={{ name: 'Example resource' }}
        flowSteps={[
          {
            id: 'details',
            label: 'Resource details',
            render: ({ values, setValue }) => (
              <Field>
                <FieldLabel>Resource name</FieldLabel>
                <Input value={values.name} onValueChange={(value) => setValue('name', value)} />
              </Field>
            ),
          },
        ]}
        summary={(values) => [{ stepId: 'details', label: 'Resource name', value: values.name }]}
        submitState={controlled ? callerState : undefined}
        resourceHref={(result) => (typeof result === 'string' ? result : undefined)}
        onExit={() => {
          if (controlled) setCallerState({ status: 'idle' });
        }}
        onFinish={async (_values, { signal }) => {
          if (controlled) setCallerState({ status: 'submitting' });
          try {
            // Commit the caller-owned pending state before this example transport settles.
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            if (signal.aborted) return;
            if (target === 'pending') return await new Promise<unknown>(() => {});
            if (target === 'error') throw new Error('Example transport failure');
            const result = '#created-resource';
            if (controlled && !signal.aborted) setCallerState({ status: 'success', result });
            return result;
          } catch (error: unknown) {
            if (controlled && !signal.aborted) setCallerState({ status: 'error', error });
            throw error;
          }
        }}
      />
    </LiveAnnouncer>
  );
}

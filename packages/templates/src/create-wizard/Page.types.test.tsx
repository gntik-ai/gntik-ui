import { expectTypeOf } from 'vitest';
import type { ReactElement } from 'react';
import CreateWizardPage from './Page';
import type { CreateWizardFlowProps } from './Flow';
import { flowLabels } from './examples/labels';

it('preserves legacy async callback contextual typing', () => {
  const navigate = () => {};
  const page = <CreateWizardPage onFinish={() => new Promise<void>((resolve) => resolve()).then(() => navigate())} />;
  expectTypeOf(page).toMatchTypeOf<ReactElement>();
});

it('keeps legacy props separate from caller-defined flow props', () => {
  // Compile-only public API checks; these functions are never invoked.
  const check = (flow: CreateWizardFlowProps<{ name: string }>) => {
    // @ts-expect-error flow mode cannot mix with the legacy copy model
    CreateWizardPage({ ...flow, copy: {} });
    // @ts-expect-error flow mode cannot mix with legacy Stepper-only steps
    CreateWizardPage({ ...flow, steps: [] });
  };
  expectTypeOf(check).toBeFunction();
});

it('infers caller value keys and setter types through the public page', () => {
  const page = (
    <CreateWizardPage
      initialValues={{ email: '', count: 0 }}
      labels={flowLabels}
      onExit={() => {}}
      flowSteps={[
        {
          id: 'recipient',
          label: 'Recipient',
          render: ({ values, setValue }) => {
            expectTypeOf(values.email).toEqualTypeOf<string>();
            expectTypeOf(values.count).toEqualTypeOf<number>();
            // @ts-expect-error caller numeric values reject strings
            setValue('count', 'wrong type');
            // @ts-expect-error setters accept caller keys only
            setValue('unknown', 'value');
            return values.email;
          },
        },
      ]}
      summary={(values) => [{ stepId: 'recipient', label: 'Email', value: values.email }]}
      onFinish={async (values) => {
        expectTypeOf(values.email).toEqualTypeOf<string>();
      }}
    />
  );
  expectTypeOf(page).toMatchTypeOf<ReactElement>();
});

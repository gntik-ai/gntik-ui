import { DescriptionListCard } from '@gntik-ai/blocks';
import {
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Heading,
  Input,
  Logo,
  SelectableCard,
  SelectableCardGroup,
  SimpleSelect,
  Stack,
  Text,
  Textarea,
  VisuallyHidden,
  WizardLayout,
  type StepItem,
} from '@gntik-ai/ui';
import { useId, useState, type ReactNode } from 'react';
import {
  PROJECT_NAME_RE,
  wizardInitialValues,
  wizardRegions,
  wizardSources,
  wizardSteps,
  type SourceOption,
  type WizardRegion,
  type WizardValues,
} from './data';

export interface CreateWizardProps {
  /** Flow name in the top bar. */
  title: string;
  steps: StepItem[];
  initialValues: WizardValues;
  sources: readonly SourceOption[];
  regions: readonly WizardRegion[];
  /** Called from the review step; return a promise to show the loading state. */
  onFinish: (values: WizardValues) => void | Promise<void>;
  /** Called after the exit is confirmed. */
  onExit: () => void;
  onStepChange: (index: number) => void;
}

function StepIntro({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <Stack gap={1}>
      <Heading level={1} id={id} size="lg">
        {title}
      </Heading>
      {children && <Text variant="supporting">{children}</Text>}
    </Stack>
  );
}

/** Multi-step create flow in the focus-mode WizardLayout, ending in a review of every answer. */
export default function CreateWizardPage({
  title = 'New project',
  steps = wizardSteps,
  initialValues = wizardInitialValues,
  sources = wizardSources,
  regions = wizardRegions,
  onFinish,
  onExit,
  onStepChange,
}: Partial<CreateWizardProps>) {
  const id = useId();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [status, setStatus] = useState('');
  const set = <K extends keyof WizardValues>(key: K, value: WizardValues[K]) => setValues((v) => ({ ...v, [key]: value }));

  const nameValid = PROJECT_NAME_RE.test(values.name);
  const nameError = touched && !nameValid ? (values.name ? 'Use lowercase letters, numbers and dashes.' : 'Enter a project name.') : undefined;
  const go = (index: number) => {
    setStep(index);
    onStepChange?.(index);
  };
  const sourceLabel = sources.find((s) => s.value === values.source)?.title ?? values.source;
  const regionLabel = regions.find((r) => r.value === values.region)?.label ?? values.region;

  const finish = async () => {
    setFinishing(true);
    try {
      await onFinish?.(values);
      setStatus(`Project “${values.name}” created`);
    } finally {
      setFinishing(false);
    }
  };

  return (
    <WizardLayout
      fullScreen
      logo={<Logo size={22} />}
      title={title}
      steps={steps}
      current={step}
      onStepChange={go}
      nextDisabled={step === 0 && !nameValid}
      nextLoading={finishing}
      finishLabel="Create project"
      onFinish={() => void finish()}
      onExit={onExit}
      exitTitle="Leave project setup?"
      exitDescription="The project has not been created yet. Your answers will be discarded."
      footerStart={<span aria-live="polite">{status}</span>}
    >
      {step === 0 && (
        <section aria-labelledby={`${id}-details`}>
          <Stack gap={6}>
            <StepIntro id={`${id}-details`} title="Project details">
              Name the project; you can change the description later.
            </StepIntro>
            <Field invalid={nameError != null}>
              <FieldLabel required>Project name</FieldLabel>
              <Input required value={values.name} onValueChange={(v) => set('name', v)} onBlur={() => setTouched(true)} placeholder="billing-dashboard" />
              <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
              <FieldError match={nameError != null}>{nameError}</FieldError>
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea rows={3} value={values.description} onValueChange={(v) => set('description', v)} />
            </Field>
          </Stack>
        </section>
      )}
      {step === 1 && (
        <section aria-labelledby={`${id}-source`}>
          <Stack gap={6}>
            <StepIntro id={`${id}-source`} title="Choose a source">
              Where the project’s code comes from.
            </StepIntro>
            <SelectableCardGroup aria-labelledby={`${id}-source`} value={values.source} onValueChange={(v) => set('source', v)} columns={1}>
              {sources.map((s) => {
                const Icon = s.icon;
                return <SelectableCard key={s.value} value={s.value} title={s.title} description={s.description} icon={<Icon size={18} aria-hidden />} />;
              })}
            </SelectableCardGroup>
          </Stack>
        </section>
      )}
      {step === 2 && (
        <section aria-labelledby={`${id}-configure`}>
          <Stack gap={6}>
            <StepIntro id={`${id}-configure`} title="Configure">
              Region and deployment defaults.
            </StepIntro>
            <SimpleSelect
              label="Region"
              items={regions}
              value={values.region}
              onValueChange={(v) => v && set('region', v)}
              className="w-full"
            />
            <Checkbox
              label="Preview deployments"
              description="Deploy every pull request to its own URL."
              checked={values.previews}
              onCheckedChange={(checked) => set('previews', checked)}
            />
          </Stack>
        </section>
      )}
      {step === 3 && (
        <section aria-labelledby={`${id}-review`}>
          <Stack gap={6}>
            <StepIntro id={`${id}-review`} title="Review and create">
              Check your answers; edit any section before creating the project.
            </StepIntro>
            <VisuallyHidden render={<h2 />}>Summary</VisuallyHidden>
            <DescriptionListCard
              title="Details"
              description="Name and description."
              items={[
                { id: 'name', label: 'Project name', value: values.name, mono: true },
                { id: 'description', label: 'Description', value: values.description || '—' },
              ]}
              onEdit={() => go(0)}
              editLabel="Edit details"
            />
            <DescriptionListCard
              title="Source and configuration"
              description="Where the code comes from and where it runs."
              items={[
                { id: 'source', label: 'Source', value: sourceLabel },
                { id: 'region', label: 'Region', value: regionLabel },
                { id: 'previews', label: 'Preview deployments', value: values.previews ? 'On' : 'Off' },
              ]}
              onEdit={() => go(1)}
              editLabel="Edit source"
            />
          </Stack>
        </section>
      )}
    </WizardLayout>
  );
}

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
  WizardLayout,
  type StepItem,
} from '@gntik-ai/ui';
import { useId, useState, type ReactNode } from 'react';
import {
  PROJECT_NAME_RE,
  wizardCopy,
  wizardInitialValues,
  wizardRegions,
  wizardSources,
  wizardSteps,
  type CreateWizardCopy,
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
  /** Step titles, field labels, submit label…; unset keys keep the default (project) wording. */
  copy: Partial<CreateWizardCopy>;
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
  copy: copyOverrides,
}: Partial<CreateWizardProps>) {
  const copy: CreateWizardCopy = { ...wizardCopy, ...copyOverrides };
  const id = useId();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [status, setStatus] = useState('');
  const set = <K extends keyof WizardValues>(key: K, value: WizardValues[K]) => setValues((v) => ({ ...v, [key]: value }));

  const nameValid = PROJECT_NAME_RE.test(values.name);
  const nameError = touched && !nameValid ? (values.name ? copy.nameInvalid : copy.nameRequired) : undefined;
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
      setStatus(copy.created(values.name));
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
      finishLabel={copy.submitLabel}
      onFinish={() => void finish()}
      onExit={onExit}
      exitTitle={copy.exitTitle}
      exitDescription={copy.exitDescription}
      footerStart={<span aria-live="polite">{status}</span>}
    >
      {step === 0 && (
        <section aria-labelledby={`${id}-details`}>
          <Stack gap={6}>
            <StepIntro id={`${id}-details`} title={copy.detailsTitle}>
              {copy.detailsIntro}
            </StepIntro>
            <Field invalid={nameError != null}>
              <FieldLabel required>{copy.nameLabel}</FieldLabel>
              <Input required value={values.name} onValueChange={(v) => set('name', v)} onBlur={() => setTouched(true)} placeholder={copy.namePlaceholder} />
              <FieldDescription>{copy.nameHint}</FieldDescription>
              <FieldError match={nameError != null}>{nameError}</FieldError>
            </Field>
            <Field>
              <FieldLabel>{copy.descriptionLabel}</FieldLabel>
              <Textarea rows={3} value={values.description} onValueChange={(v) => set('description', v)} />
            </Field>
          </Stack>
        </section>
      )}
      {step === 1 && (
        <section aria-labelledby={`${id}-source`}>
          <Stack gap={6}>
            <StepIntro id={`${id}-source`} title={copy.sourceTitle}>
              {copy.sourceIntro}
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
            <StepIntro id={`${id}-configure`} title={copy.configureTitle}>
              {copy.configureIntro}
            </StepIntro>
            <SimpleSelect
              label={copy.regionLabel}
              items={regions}
              value={values.region}
              onValueChange={(v) => v && set('region', v)}
              className="w-full"
            />
            <Checkbox
              label={copy.previewsLabel}
              description={copy.previewsDescription}
              checked={values.previews}
              onCheckedChange={(checked) => set('previews', checked)}
            />
          </Stack>
        </section>
      )}
      {step === 3 && (
        <section aria-labelledby={`${id}-review`}>
          <Stack gap={6}>
            <StepIntro id={`${id}-review`} title={copy.reviewTitle}>
              {copy.reviewIntro}
            </StepIntro>
            <DescriptionListCard
              titleAs="h2"
              title={copy.reviewDetailsTitle}
              description={copy.reviewDetailsDescription}
              items={[
                { id: 'name', label: copy.nameLabel, value: values.name, mono: true },
                { id: 'description', label: copy.descriptionLabel, value: values.description || '—' },
              ]}
              onEdit={() => go(0)}
              editLabel={copy.editDetailsLabel}
            />
            <DescriptionListCard
              titleAs="h2"
              title={copy.reviewSourceTitle}
              description={copy.reviewSourceDescription}
              items={[
                { id: 'source', label: copy.sourceLabel, value: sourceLabel },
                { id: 'region', label: copy.regionLabel, value: regionLabel },
                { id: 'previews', label: copy.previewsLabel, value: values.previews ? copy.on : copy.off },
              ]}
              onEdit={() => go(1)}
              editLabel={copy.editSourceLabel}
            />
          </Stack>
        </section>
      )}
    </WizardLayout>
  );
}

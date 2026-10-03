import { PricingTable, type PricingTier, type RoleOption } from '@gntik-ai/blocks';
import { Globe } from '@gntik-ai/icons';
import {
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
  TokenInput,
  WizardLayout,
  type StepItem,
} from '@gntik-ai/ui';
import { useId, useState, type ReactNode } from 'react';
import {
  EMAIL_RE,
  slugify,
  workspaceInitialValues,
  workspacePlans,
  workspaceRegions,
  workspaceRoles,
  workspaceSteps,
  type WorkspaceRegion,
  type WorkspaceValues,
} from './data';

export interface CreateWorkspaceProps {
  steps: StepItem[];
  initialValues: WorkspaceValues;
  regions: readonly WorkspaceRegion[];
  plans: readonly PricingTier[];
  roles: readonly RoleOption[];
  /** Host shown before the slug, e.g. "app.example.com/". */
  addressPrefix: string;
  maxInvites: number;
  /** Called on the last step with the slug; return a promise to show the loading state. */
  onFinish: (values: WorkspaceValues & { slug: string }) => void | Promise<void>;
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

const emailError = (token: string) => (EMAIL_RE.test(token) ? null : `${token} is not a valid email address`);

/** Workspace onboarding: name and region as selectable cards, the plan as a selectable PricingTable, then inline invitations. */
export default function CreateWorkspacePage({
  steps = workspaceSteps,
  initialValues = workspaceInitialValues,
  regions = workspaceRegions,
  plans = workspacePlans,
  roles = workspaceRoles,
  addressPrefix = 'app.example.com/',
  maxInvites = 20,
  onFinish,
  onExit,
  onStepChange,
}: Partial<CreateWorkspaceProps>) {
  const id = useId();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [status, setStatus] = useState('');
  const set = <K extends keyof WorkspaceValues>(key: K, value: WorkspaceValues[K]) => setValues((v) => ({ ...v, [key]: value }));

  const slug = slugify(values.name);
  const nameValid = values.name.trim().length >= 2 && slug.length > 0;
  const invalidInvites = values.invites.filter((e) => emailError(e)).length;
  const go = (index: number) => {
    setStep(index);
    onStepChange?.(index);
  };
  const finish = async () => {
    setFinishing(true);
    try {
      await onFinish?.({ ...values, slug });
      setStatus(`Workspace “${values.name}” created`);
    } finally {
      setFinishing(false);
    }
  };

  return (
    <WizardLayout
      fullScreen
      logo={<Logo size={22} />}
      title="Create a workspace"
      steps={steps}
      current={step}
      onStepChange={go}
      nextDisabled={(step === 0 && !nameValid) || (step === 3 && invalidInvites > 0)}
      nextLoading={finishing}
      finishLabel={values.invites.length > 0 ? 'Create and invite' : 'Create workspace'}
      onFinish={() => void finish()}
      onExit={onExit}
      exitTitle="Leave workspace setup?"
      exitDescription="The workspace has not been created yet. Your answers will be discarded."
      footerStart={<span aria-live="polite">{status}</span>}
    >
      {step === 0 && (
        <section aria-labelledby={`${id}-name`}>
          <Stack gap={6}>
            <StepIntro id={`${id}-name`} title="Name your workspace">
              A workspace holds your projects, members and billing.
            </StepIntro>
            <Field invalid={touched && !nameValid}>
              <FieldLabel required>Workspace name</FieldLabel>
              <Input required value={values.name} onValueChange={(v) => set('name', v)} onBlur={() => setTouched(true)} placeholder="Acme Inc." />
              <FieldDescription>
                Address: <span className="font-mono text-foreground">{addressPrefix}{slug || 'your-workspace'}</span>
              </FieldDescription>
              <FieldError match={touched && !nameValid}>Enter at least two characters.</FieldError>
            </Field>
          </Stack>
        </section>
      )}
      {step === 1 && (
        <section aria-labelledby={`${id}-region`}>
          <Stack gap={6}>
            <StepIntro id={`${id}-region`} title="Where should your data live?">
              Projects in this workspace run and store data in this region.
            </StepIntro>
            <SelectableCardGroup aria-labelledby={`${id}-region`} value={values.region} onValueChange={(v) => set('region', v)} columns={1}>
              {regions.map((r) => (
                <SelectableCard key={r.value} value={r.value} title={r.title} description={r.description} meta={r.meta} icon={<Globe size={18} aria-hidden />} />
              ))}
            </SelectableCardGroup>
          </Stack>
        </section>
      )}
      {step === 2 && (
        <section aria-labelledby={`${id}-plan`}>
          <Stack gap={6}>
            <StepIntro id={`${id}-plan`} title="Pick a plan">
              Change or cancel at any time from Billing.
            </StepIntro>
            <PricingTable
              className="p-0 sm:p-0"
              tiers={[...plans]}
              title={null}
              eyebrow={null}
              description={null}
              aria-labelledby={`${id}-plan`}
              headingLevel="h2"
              showCycleToggle={false}
              columns={1}
              selectable
              value={values.plan}
              onValueChange={(v) => set('plan', v)}
            />
          </Stack>
        </section>
      )}
      {step === 3 && (
        <section aria-labelledby={`${id}-invite`}>
          <Stack gap={6}>
            <StepIntro id={`${id}-invite`} title="Invite your team">
              Optional: you can invite people later from Members.
            </StepIntro>
            <Field invalid={invalidInvites > 0}>
              <FieldLabel>Email addresses</FieldLabel>
              <TokenInput
                value={values.invites}
                onValueChange={(v) => set('invites', v)}
                validate={emailError}
                maxItems={maxInvites}
                placeholder="name@company.com"
                listLabel="Invited addresses"
                invalid={invalidInvites > 0}
              />
              <FieldDescription>Separate addresses with commas or Enter.</FieldDescription>
              <FieldError match={invalidInvites > 0}>
                Fix {invalidInvites} invalid {invalidInvites === 1 ? 'address' : 'addresses'}.
              </FieldError>
            </Field>
            <SimpleSelect
              label="Role"
              items={roles.map(({ value, label }) => ({ value, label }))}
              value={values.role}
              onValueChange={(v) => v && set('role', v)}
              className="w-full sm:max-w-xs"
            />
          </Stack>
        </section>
      )}
    </WizardLayout>
  );
}

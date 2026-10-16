import { Field, FieldError, FieldLabel, Input, LiveAnnouncer, SimpleSelect, Textarea } from '@gntik-ai/ui';
import CreateWizardPage from '../Page';
import type { CreateWizardFlowProps, CreateWizardFlowStep } from '../Flow';
import { flowLabels } from './labels';

interface InviteValues {
  workspaceId: string;
  email: string;
  role: string;
  message: string;
}

// Same single-address format and three-role semantics as InviteMembersDialog.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const copy = {
  ...flowLabels,
  title: 'Invite a member',
  finish: 'Send invitation',
  pending: 'Sending invitation…',
  reviewTitle: 'Review invitation',
  steps: 'Invitation progress',
  stepsSummary: 'Invitation progress summary',
  success: () => 'Invitation sent',
  errorFallback: 'Could not send the invitation. Try again.',
  openResource: 'Open member',
  workspace: 'Workspace',
  workspaceValue: 'Example team',
  email: 'Email address',
  emailError: 'Enter a valid email address.',
  quota: 'Your member limit has been reached.',
  role: 'Role',
  rolePlaceholder: 'Choose a role',
  message: 'Message (optional)',
  roleItems: [
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
  ],
};
const initialValues: InviteValues = { workspaceId: 'example-team', email: '', role: 'member', message: '' };
const submit = async (values: InviteValues) => ({ email: values.email });

/** Generic single-recipient invite; members.count models a caller-owned quota. */
export default function Invite({
  members = { count: 1, limit: 5 },
  onFinish = submit,
}: {
  members?: { count: number; limit: number };
  onFinish?: CreateWizardFlowProps<InviteValues>['onFinish'];
}) {
  const flowSteps: CreateWizardFlowStep<InviteValues>[] = [
    { id: 'workspace', label: copy.workspace, readOnly: true, render: () => <p>{copy.workspaceValue}</p> },
    {
      id: 'email',
      label: copy.email,
      validate: (values) => ({
        fieldErrors: EMAIL_RE.test(values.email) ? {} : { email: copy.emailError },
        blocking: members.count >= members.limit ? copy.quota : undefined,
      }),
      render: ({ values, setValue, errors }) => (
        <Field invalid={Boolean(errors.email)}>
          <FieldLabel>{copy.email}</FieldLabel>
          <Input type="email" value={values.email} onValueChange={(value) => setValue('email', value)} />
          <FieldError match={Boolean(errors.email)}>{errors.email}</FieldError>
        </Field>
      ),
    },
    {
      id: 'role',
      label: copy.role,
      render: ({ values, setValue }) => (
        <SimpleSelect
          label={copy.role}
          placeholder={copy.rolePlaceholder}
          items={copy.roleItems}
          value={values.role}
          onValueChange={(value) => value && setValue('role', value)}
        />
      ),
    },
    {
      id: 'message',
      label: copy.message,
      render: ({ values, setValue }) => (
        <Field>
          <FieldLabel>{copy.message}</FieldLabel>
          <Textarea
            rows={4}
            maxLength={500}
            value={values.message}
            onValueChange={(value) => setValue('message', value)}
          />
        </Field>
      ),
    },
  ];
  return (
    <LiveAnnouncer>
      <CreateWizardPage
        labels={copy}
        initialValues={initialValues}
        flowSteps={flowSteps}
        summary={(values) => [
          { stepId: 'workspace', label: copy.workspace, value: copy.workspaceValue },
          { stepId: 'email', label: copy.email, value: values.email },
          { stepId: 'role', label: copy.role, value: copy.roleItems.find((role) => role.value === values.role)?.label },
          { stepId: 'message', label: copy.message, value: values.message },
        ]}
        onFinish={onFinish}
        onExit={() => {}}
      />
    </LiveAnnouncer>
  );
}

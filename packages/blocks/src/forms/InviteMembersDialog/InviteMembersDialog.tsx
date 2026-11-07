import {
  useI18n,
  Alert,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FormDialog,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Textarea,
  TokenInput,
} from '@gntik-ai/ui';
import { UserPlus } from '@gntik-ai/icons';
import { useState, type ReactElement } from 'react';
import { EMAIL_RE, memberRoles, type RoleOption } from './fixtures';

export type { RoleOption } from './fixtures';

export interface InvitePayload {
  emails: string[];
  role: string;
  message: string;
}

export interface InviteMembersDialogLabels {
  title: string;
  description: string;
  emails: string;
  placeholder: string;
  listLabel: string;
  role: string;
  message: string;
  messagePlaceholder: string;
  emailRequired: string;
  emailInvalid: (email: string) => string;
  fixInvalid: (count: number) => string;
  errorTitle: string;
  fallbackError: string;
  cancel: string;
  submit: string;
  submitMany: (count: number) => string;
}

export interface InviteMembersDialogProps {
  labels?: Partial<InviteMembersDialogLabels>;
  roles?: RoleOption[];
  defaultRole?: string;
  /** Sends the invitations. A returned promise shows a loading state; a rejection shows its message. */
  onInvite?: (payload: InvitePayload) => void | Promise<void>;
  /** Maximum number of addresses per batch. */
  maxInvites?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Trigger element (rendered through Dialog.Trigger). Pass `null` when controlling `open` yourself. */
  trigger?: ReactElement | null;
  title?: string;
  description?: string;
}

/** Invite dialog: email chips with validation, a role and an optional message; submit with loading. */
export function InviteMembersDialog({
  labels,
  roles = memberRoles,
  defaultRole = 'member',
  onInvite,
  maxInvites = 20,
  open,
  defaultOpen = false,
  onOpenChange,
  trigger = <Button icon={UserPlus} />,
  title: titleProp,
  description: descriptionProp,
}: InviteMembersDialogProps) {
  const { t } = useI18n();
  const title = titleProp ?? labels?.title ?? t('inviteMembers.title');
  const description = descriptionProp ?? labels?.description ?? t('inviteMembers.description');
  const emailError = (email: string) =>
    EMAIL_RE.test(email) ? null : (labels?.emailInvalid?.(email) ?? t('inviteMembers.emailInvalid', { email }));
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState(defaultRole);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalidCount = emails.filter((e) => emailError(e)).length;
  const emailsProblem =
    emails.length === 0
      ? (labels?.emailRequired ?? t('inviteMembers.emailRequired'))
      : invalidCount > 0
        ? (labels?.fixInvalid?.(invalidCount) ?? t('inviteMembers.fixInvalid', { count: invalidCount }))
        : null;
  const showEmailError = submitted && emailsProblem != null;

  const reset = () => {
    setEmails([]);
    setRole(defaultRole);
    setMessage('');
    setSubmitted(false);
    setError(null);
  };

  const send = async () => {
    try {
      await onInvite?.({ emails, role, message: message.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : (labels?.fallbackError ?? t('inviteMembers.fallbackError')));
      return false;
    }
  };

  const submit = () => {
    setSubmitted(true);
    setError(null);
    return emailsProblem ? false : send();
  };

  const roleLabel = roles.find((r) => r.value === role)?.description;

  return (
    <FormDialog
      size="lg"
      title={title}
      description={description}
      trigger={trigger ?? undefined}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      onClosed={reset}
      cancelLabel={labels?.cancel ?? t('inviteMembers.cancel')}
      submitLabel={
        emails.length > 1
          ? (labels?.submitMany?.(emails.length) ?? t('inviteMembers.submitMany', { count: emails.length }))
          : (labels?.submit ?? t('inviteMembers.submit'))
      }
      summary={
        error && (
          <Alert tone="destructive" title={labels?.errorTitle ?? t('inviteMembers.errorTitle')} description={error} />
        )
      }
    >
      <Field invalid={showEmailError}>
        <FieldLabel required>{labels?.emails ?? t('inviteMembers.emails')}</FieldLabel>
        <TokenInput
          value={emails}
          onValueChange={setEmails}
          validate={emailError}
          maxItems={maxInvites}
          placeholder={labels?.placeholder ?? t('inviteMembers.placeholder')}
          listLabel={labels?.listLabel ?? t('inviteMembers.listLabel')}
          invalid={showEmailError}
        />
        <FieldError match={showEmailError}>{emailsProblem}</FieldError>
      </Field>
      <Field>
        <FieldLabel>{labels?.role ?? t('inviteMembers.role')}</FieldLabel>
        <Select
          value={role}
          onValueChange={(v) => v != null && setRole(v)}
          items={roles.map(({ value, label }) => ({ value, label }))}
        >
          <SelectTrigger className="w-full" />
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {roleLabel && <FieldDescription>{roleLabel}</FieldDescription>}
      </Field>
      <Field>
        <FieldLabel>{labels?.message ?? t('inviteMembers.message')}</FieldLabel>
        <Textarea
          rows={3}
          value={message}
          onValueChange={setMessage}
          placeholder={labels?.messagePlaceholder ?? t('inviteMembers.messagePlaceholder')}
        />
      </Field>
    </FormDialog>
  );
}

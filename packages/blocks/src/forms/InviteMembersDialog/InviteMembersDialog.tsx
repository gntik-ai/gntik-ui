import {
  useI18n,
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
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
  open: openProp,
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
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState(defaultRole);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = openProp ?? innerOpen;

  const invalidCount = emails.filter((e) => emailError(e)).length;
  const emailsProblem =
    emails.length === 0
      ? (labels?.emailRequired ?? t('inviteMembers.emailRequired'))
      : invalidCount > 0
        ? (labels?.fixInvalid?.(invalidCount) ?? t('inviteMembers.fixInvalid', { count: invalidCount }))
        : null;
  const showEmailError = submitted && emailsProblem != null;

  const setOpen = (next: boolean) => {
    if (loading && !next) return;
    if (!next) {
      setEmails([]);
      setRole(defaultRole);
      setMessage('');
      setSubmitted(false);
      setError(null);
    }
    setInnerOpen(next);
    onOpenChange?.(next);
  };

  const submit = async () => {
    setSubmitted(true);
    setError(null);
    if (emailsProblem) return;
    setLoading(true);
    try {
      await onInvite?.({ emails, role, message: message.trim() });
      setLoading(false);
      setOpen(false);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : (labels?.fallbackError ?? t('inviteMembers.fallbackError')));
    }
  };

  const roleLabel = roles.find((r) => r.value === role)?.description;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger}>{title}</DialogTrigger>}
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <DialogBody className="grid gap-5">
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
            {error && (
              <Alert
                tone="destructive"
                title={labels?.errorTitle ?? t('inviteMembers.errorTitle')}
                description={error}
              />
            )}
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" disabled={loading} />}>
              {labels?.cancel ?? t('inviteMembers.cancel')}
            </DialogClose>
            <Button type="submit" loading={loading}>
              {emails.length > 1
                ? (labels?.submitMany?.(emails.length) ?? t('inviteMembers.submitMany', { count: emails.length }))
                : (labels?.submit ?? t('inviteMembers.submit'))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

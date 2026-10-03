import {
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

export interface InviteMembersDialogProps {
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

const emailError = (t: string) => (EMAIL_RE.test(t) ? null : `${t} is not a valid email address`);

/** Invite dialog: email chips with validation, a role and an optional message; submit with loading. */
export function InviteMembersDialog({
  roles = memberRoles,
  defaultRole = 'member',
  onInvite,
  maxInvites = 20,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger = <Button icon={UserPlus} />,
  title = 'Invite members',
  description = 'Invitations expire after 7 days. Separate addresses with commas or Enter.',
}: InviteMembersDialogProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState(defaultRole);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = openProp ?? innerOpen;

  const invalidCount = emails.filter((e) => emailError(e)).length;
  const emailsProblem = emails.length === 0 ? 'Add at least one email address.' : invalidCount > 0 ? `Fix ${invalidCount} invalid ${invalidCount === 1 ? 'address' : 'addresses'}.` : null;
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
      setError(e instanceof Error ? e.message : 'The invitations could not be sent.');
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
              <FieldLabel required>Email addresses</FieldLabel>
              <TokenInput
                value={emails}
                onValueChange={setEmails}
                validate={emailError}
                maxItems={maxInvites}
                placeholder="name@company.com"
                listLabel="Invited addresses"
                invalid={showEmailError}
              />
              <FieldError match={showEmailError}>{emailsProblem}</FieldError>
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select value={role} onValueChange={(v) => v != null && setRole(v)} items={roles.map(({ value, label }) => ({ value, label }))}>
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
              <FieldLabel>Message (optional)</FieldLabel>
              <Textarea rows={3} value={message} onValueChange={setMessage} placeholder="Join us on the billing-dashboard project." />
            </Field>
            {error && <Alert tone="destructive" title="Invitations not sent" description={error} />}
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" disabled={loading} />}>Cancel</DialogClose>
            <Button type="submit" loading={loading}>
              {emails.length > 1 ? `Send ${emails.length} invitations` : 'Send invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

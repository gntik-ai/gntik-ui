import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { SimpleSelect } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { Form, FormField, schemaResolver } from '..';

const inviteSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.'),
  email: z.email('Enter a valid email address.'),
  role: z.enum(['viewer', 'editor', 'admin'], { error: 'Choose a role.' }),
  note: z.string().max(140, 'Keep the note under 140 characters.').optional(),
});

type Invite = z.infer<typeof inviteSchema>;
type InviteInput = z.input<typeof inviteSchema>;

const roles = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
];

export default function FormInviteMember() {
  const [sent, setSent] = useState<Invite | null>(null);
  const form = useForm<InviteInput, unknown, Invite>({
    resolver: schemaResolver<InviteInput, Invite>(inviteSchema),
    defaultValues: { name: '', email: '', note: '' },
  });
  return (
    <Form form={form} onSubmit={setSent} className="grid w-full max-w-md gap-5" aria-label="Invite a member">
      <FormField<InviteInput, 'name'> name="name" label="Full name" required>
        {(field) => <Input {...field} autoComplete="name" />}
      </FormField>
      <FormField<InviteInput, 'email'> name="email" label="Email" required description="We send the invitation here.">
        {(field) => <Input {...field} type="email" autoComplete="email" />}
      </FormField>
      <FormField<InviteInput, 'role'> name="role" label="Role" required>
        {({ ref, value, onChange, onBlur, name }) => (
          <SimpleSelect
            triggerRef={ref}
            name={name}
            items={roles}
            value={value ?? null}
            onValueChange={(v) => {
              onChange(v);
              onBlur();
            }}
          />
        )}
      </FormField>
      <FormField<InviteInput, 'note'> name="note" label="Note" description="Optional, shown in the email.">
        {(field) => <Textarea {...field} rows={3} />}
      </FormField>
      <div className="flex items-center gap-3">
        <Button type="submit">Send invitation</Button>
        <p role="status" className="text-[12px] text-muted-foreground">
          {sent ? `Invitation sent to ${sent.email}.` : ''}
        </p>
      </div>
    </Form>
  );
}

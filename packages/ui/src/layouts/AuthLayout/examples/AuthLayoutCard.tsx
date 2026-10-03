import { Mail } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Field, FieldDescription, FieldLabel } from '../../../components/Field';
import { Input } from '../../../components/Input';
import { Link } from '../../../components/Link';
import { AuthLayout } from '../AuthLayout';

export default function AuthLayoutCard() {
  const [sent, setSent] = useState(false);
  return (
    <div className="h-[520px] overflow-hidden rounded-lg border border-border">
      <AuthLayout
        variant="card"
        skipLinkLabel="Skip to reset form"
        footer={<Link href="#sign-in">Back to sign in</Link>}
      >
        <h1 className="text-[20px] font-semibold tracking-tight">Reset your password</h1>
        <p className="mt-1.5 mb-6 text-[13.5px] leading-relaxed text-muted-foreground">
          Enter the email on your account and we will send you a reset link.
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" leadingIcon={Mail} placeholder="you@example.com" autoComplete="email" />
            <FieldDescription>The link expires after 30 minutes.</FieldDescription>
          </Field>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
          <p aria-live="polite" className="h-4 text-center text-[12.5px] text-success-text">
            {sent ? 'Check your inbox for the reset link.' : ''}
          </p>
        </form>
      </AuthLayout>
    </div>
  );
}

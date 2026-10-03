import { Check, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Checkbox } from '../../../components/Checkbox';
import { Field, FieldLabel } from '../../../components/Field';
import { Input } from '../../../components/Input';
import { Link } from '../../../components/Link';
import { PasswordInput } from '../../../components/PasswordInput';
import { AuthLayout } from '../AuthLayout';

const FEATURES = ['Every deployment reviewed and audited', 'Roles and access per project', 'Usage and spend in one place'];

export default function AuthLayoutSplit() {
  const [status, setStatus] = useState('');
  return (
    <div className="h-[560px] overflow-hidden rounded-lg border border-border">
      <AuthLayout
        brand={
          <>
            <p className="mb-5 font-mono text-[11px] tracking-[0.18em] text-primary-text uppercase">Control plane</p>
            <p className="text-[32px] leading-[1.08] font-bold tracking-[-0.03em] text-balance">
              Ship with confidence, <span className="text-primary-text">not guesswork.</span>
            </p>
            <ul className="mt-9 flex flex-col gap-3.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="grid size-[23px] shrink-0 place-items-center rounded-[7px] bg-primary/14 text-primary-chip-text">
                    <Check size={14} strokeWidth={2.6} aria-hidden />
                  </span>
                  <span className="text-[14.5px] text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </>
        }
        brandFooter="MFA · recovery codes · audited access"
        footer={
          <>
            New here? <Link href="#sign-up">Create an account</Link>
          </>
        }
      >
        <p className="mb-2.5 font-mono text-[11px] tracking-[0.2em] text-primary-text uppercase">Secure access</p>
        <h1 className="text-[27px] font-semibold tracking-[-0.025em]">Sign in to your workspace</h1>
        <p className="mt-2 mb-6 text-[14px] leading-relaxed text-muted-foreground">Use your workspace credentials to continue.</p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStatus('Signing you in…');
          }}
        >
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" leadingIcon={Mail} placeholder="you@example.com" autoComplete="email" />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <PasswordInput leadingIcon={Lock} autoComplete="current-password" />
          </Field>
          <div className="flex items-center justify-between gap-3">
            <Checkbox label="Remember me" />
            <Link href="#reset">Forgot password?</Link>
          </div>
          <Button type="submit" size="lg" className="mt-2 w-full">
            Sign in
          </Button>
          <p aria-live="polite" className="h-4 text-center text-[12.5px] text-muted-foreground">
            {status}
          </p>
        </form>
      </AuthLayout>
    </div>
  );
}

import { cn, en, useI18n, type I18n } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';

export interface AuthHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Defaults to h1. `null` omits the title heading. */
  headingLevel?: 'h1' | 'h2' | 'h3' | null;
  className?: string;
}

/** Eyebrow + title + supporting line used at the top of every auth form. */
export function AuthHeader({ eyebrow, title, description, headingLevel: Heading = 'h1', className }: AuthHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {eyebrow != null && (
        <p className="mb-2.5 font-mono text-[11px] tracking-[0.2em] text-primary-text uppercase">{eyebrow}</p>
      )}
      {Heading != null && title != null && (
        <Heading className="text-[24px] font-semibold tracking-tight text-balance text-foreground sm:text-[27px]">
          {title}
        </Heading>
      )}
      {description != null && (
        <p className="mt-2 text-[14px] leading-relaxed text-pretty text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/** Horizontal rule with a centred caption ("Or continue with"). */
export function AuthDivider({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3" role="presentation">
      <span className="h-px flex-1 bg-border" />
      <span className="font-mono text-[10.5px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {children}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export const authFormClass = 'w-full max-w-[392px]';

/** Loading + error state around an async submit handler. A rejection's message becomes the error. */
export function useAsyncSubmit(fallbackError?: string) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (fn: () => void | Promise<void>) => {
    setError(null);
    setLoading(true);
    try {
      await fn();
      setLoading(false);
      return true;
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : (fallbackError ?? t('authValidation.fallbackError')));
      return false;
    }
  };
  return { loading, error, setError, run };
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email by default; text mode supports a username or username-or-email identifier. */
export interface AuthIdentifierConfig {
  type?: 'email' | 'text';
  autoComplete?: string;
  label?: ReactNode;
  help?: ReactNode;
  /** Optional stable id for the FieldDescription. Otherwise Base UI generates it. */
  helpId?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

/** Kit-owned inline validation; consumers supply copy rather than running a second validator. */
export interface AuthValidationMessages {
  identifierRequired?: string;
  identifierInvalid?: string;
  identifierTooShort?: string;
  passwordRequired?: string;
}

/** Server errors use only these props plus the form's error alert; inline validation stays in the kit. */
export interface AuthFormAccessibilityProps {
  fieldInvalid?: { identifier?: boolean; password?: boolean };
  /** Id of the server alert (or an external feedback element), appended to flagged inputs. */
  feedbackId?: string;
  /** Describes the form itself; does not replace the per-field feedback association. */
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function authIdentifierError(
  value: string,
  config?: AuthIdentifierConfig,
  messages?: AuthValidationMessages,
  t?: I18n['t'],
  labels?: AuthValidationMessages,
) {
  const trimmed = value.trim();
  const fallback =
    config?.type === 'text'
      ? (t?.('authValidation.identifierInvalid') ?? en['authValidation.identifierInvalid'])
      : (t?.('authValidation.emailInvalid') ?? en['authValidation.emailInvalid']);
  if (!trimmed) return messages?.identifierRequired ?? labels?.identifierRequired ?? fallback;
  if (config?.minLength !== undefined && trimmed.length < config.minLength)
    return (
      messages?.identifierTooShort ??
      messages?.identifierInvalid ??
      labels?.identifierTooShort ??
      labels?.identifierInvalid ??
      fallback
    );
  if (
    ((config?.type ?? 'email') === 'email' && !EMAIL_RE.test(trimmed)) ||
    (config?.maxLength !== undefined && trimmed.length > config.maxLength)
  )
    return messages?.identifierInvalid ?? labels?.identifierInvalid ?? fallback;
  return null;
}

/** Ordered text/email fields collected before the sign-up password. Ids must be unique. */
export interface AuthSignUpField {
  id: string;
  label: string;
  placeholder?: string;
  help?: ReactNode;
  required?: boolean;
  type?: 'text' | 'email';
  autoComplete?: string;
  /** Consumer copy for kit-owned validation. */
  messages?: { required?: string; invalid?: string };
}

export interface AuthSignUpFieldLabels {
  fieldRequired: (label: string) => string;
  fieldInvalid: string;
}

export function authSignUpFieldError(
  value: string,
  field: AuthSignUpField,
  t?: I18n['t'],
  labels?: Partial<AuthSignUpFieldLabels>,
) {
  const trimmed = value.trim();
  if (!trimmed)
    return field.required
      ? (field.messages?.required ??
          labels?.fieldRequired?.(field.label) ??
          t?.('authValidation.fieldRequired', { label: field.label }) ??
          en['authValidation.fieldRequired'].replace('{label}', () => field.label))
      : null;
  if (field.type === 'email' && !EMAIL_RE.test(trimmed))
    return (
      field.messages?.invalid ??
      labels?.fieldInvalid ??
      t?.('authValidation.emailInvalid') ??
      en['authValidation.emailInvalid']
    );
  return null;
}

/** Consumer-owned copy and optional action when account creation is unavailable. */
export interface AuthUnavailableState {
  title: ReactNode;
  message: ReactNode;
  action?: ReactNode;
}

/** Kit-owned sign-up validation with consumer-owned copy. */
export interface AuthSignUpValidationMessages {
  passwordTooShort?: (minimum: number) => string;
  termsRequired?: string;
}

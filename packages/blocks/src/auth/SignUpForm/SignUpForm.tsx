import {
  useI18n,
  Alert,
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Link,
  PasswordInput,
  Skeleton,
  cn,
} from '@gntik-ai/ui';
import { translatedContent } from '../../forms/translated-content';
import { Mail, User } from '@gntik-ai/icons';
import { useId, useState, type MouseEvent, type ReactNode } from 'react';
import { SsoButtons } from '../SsoButtons/SsoButtons';
import {
  AuthDivider,
  AuthHeader,
  EMAIL_RE,
  authFormClass,
  authSignUpFieldError,
  useAsyncSubmit,
  type AuthSignUpField,
  type AuthSignUpFieldLabels,
  type AuthUnavailableState,
  type AuthSignUpValidationMessages,
} from '../shared';
import { ValidationSummary, type ValidationIssue } from '../../forms/ValidationSummary/ValidationSummary';

export interface SignUpValues {
  name: string;
  email: string;
  password: string;
  /** Present only in configured mode. Text/email values are trimmed and keyed by field id. */
  fields?: Record<string, string>;
}

export interface SignUpFormLabels extends AuthSignUpFieldLabels {
  eyebrow: string;
  title: string;
  description: string;
  name: string;
  namePlaceholder: string;
  nameRequired: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordTooShort: (minimum: number) => string;
  termsRequired: string;
  terms: string;
  privacy: string;
  termsConsent: (terms: ReactNode, privacy: ReactNode) => ReactNode;
  submit: string;
  divider: string;
  signInPrompt: string;
  signIn: string;
  policyLoading: string;
  fallbackError: string;
  emailInvalid: string;
}

export interface SignUpFormProps {
  labels?: Partial<SignUpFormLabels>;
  /** Ordered text/email inputs before Password. Omit to keep the default fields and payload. */
  fields?: readonly AuthSignUpField[];
  messages?: AuthSignUpValidationMessages;
  /** Replaces all account creation controls with a consumer-supplied callout. */
  unavailable?: AuthUnavailableState;
  /** Resolving policy, separate from loading (an account submission). No form is rendered. */
  policyLoading?: boolean;
  /** Creates the account. A returned promise shows the loading state; a rejection shows in the alert. */
  onSubmit?: (values: SignUpValues) => void | Promise<void>;
  error?: string | null;
  loading?: boolean;
  /** Optional password guidance; receives the current minimum length when a function is supplied. */
  passwordHelp?: ReactNode | ((minimum: number) => ReactNode);
  /** Minimum password length. Defaults to 8. */
  minPasswordLength?: number;
  /** Omit to require consent; false removes the checkbox and consent validation. */
  terms?: false;
  termsHref?: string;
  privacyHref?: string;
  signInHref?: string;
  onSignIn?: () => void;
  /** SSO area under the divider; defaults to SsoButtons, `null` hides it. */
  sso?: ReactNode;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

/** Account creation: name, work email, password with a strength meter and a required terms checkbox. */
export function SignUpForm({
  labels,
  fields,
  messages,
  unavailable,
  policyLoading = false,
  onSubmit,
  error: errorProp,
  loading: loadingProp,
  minPasswordLength = 8,
  passwordHelp,
  terms: termsProp,
  termsHref = '#',
  privacyHref = '#',
  signInHref = '#',
  onSignIn,
  sso = <SsoButtons />,
  eyebrow: eyebrowProp,
  title: titleProp,
  description: descriptionProp,
  className,
}: SignUpFormProps) {
  const { t } = useI18n();
  const eyebrow = eyebrowProp === undefined ? (labels?.eyebrow ?? t('signUp.eyebrow')) : eyebrowProp;
  const title = titleProp === undefined ? (labels?.title ?? t('signUp.title')) : titleProp;
  const description =
    descriptionProp === undefined ? (labels?.description ?? t('signUp.description')) : descriptionProp;
  const termsErrorId = useId();
  const fieldPrefix = useId();
  const passwordId = `${fieldPrefix}-password`;
  const termsId = `${fieldPrefix}-terms`;
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submitCount, setSubmitCount] = useState(0);
  const fieldValue = (id: string) => (Object.hasOwn(fieldValues, id) ? (fieldValues[id] ?? '') : '');
  const configuredErrors: ValidationIssue[] = (fields ?? []).flatMap((field) => {
    const message = authSignUpFieldError(fieldValue(field.id), field, t, labels);
    return message ? [{ fieldId: `${fieldPrefix}-field-${field.id}`, label: field.label, message }] : [];
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { loading, error, run } = useAsyncSubmit(labels?.fallbackError ?? t('signUp.fallbackError'));
  const busy = loadingProp ?? loading;
  const alert = errorProp ?? error;
  const nameInvalid = submitted && name.trim() === '';
  const emailInvalid = submitted && !EMAIL_RE.test(email.trim());
  const passwordInvalid =
    (submitted || (fields !== undefined && password.length > 0)) && password.length < minPasswordLength;
  const termsInvalid = submitted && termsProp !== false && !terms;

  const passwordError =
    messages?.passwordTooShort?.(minPasswordLength) ??
    labels?.passwordTooShort?.(minPasswordLength) ??
    t('signUp.passwordTooShort', { minimum: minPasswordLength });
  const termsError = messages?.termsRequired ?? labels?.termsRequired ?? t('signUp.termsRequired');
  const termsLink = <Link href={termsHref}>{labels?.terms ?? t('signUp.terms')}</Link>;
  const privacyLink = <Link href={privacyHref}>{labels?.privacy ?? t('signUp.privacy')}</Link>;
  const summaryErrors = [
    ...configuredErrors,
    ...(password.length < minPasswordLength
      ? [{ fieldId: passwordId, label: labels?.password ?? t('signUp.password'), message: passwordError }]
      : []),
    ...(termsProp !== false && !terms
      ? [{ fieldId: termsId, label: labels?.terms ?? t('signUp.terms'), message: termsError }]
      : []),
  ];

  if (unavailable)
    return (
      <div className={cn(authFormClass, className)}>
        <Alert tone="info" title={unavailable.title} description={unavailable.message} actions={unavailable.action} />
      </div>
    );

  if (policyLoading)
    return (
      <div className={cn(authFormClass, 'flex flex-col gap-4', className)}>
        <span role="status" className="sr-only">
          {labels?.policyLoading ?? t('signUp.policyLoading')}
        </span>
        <Skeleton aria-hidden className="h-8 w-3/4" />
        <Skeleton aria-hidden className="h-4 w-full" />
        <Skeleton aria-hidden className="h-12 w-full" />
        <Skeleton aria-hidden className="h-12 w-full" />
        <Skeleton aria-hidden className="h-12 w-full" />
      </div>
    );

  return (
    <div className={cn(authFormClass, className)}>
      <AuthHeader eyebrow={eyebrow} title={title} description={description} />
      <form
        noValidate
        aria-label={labels?.submit ?? t('signUp.submit')}
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (fields !== undefined) {
            setSubmitCount((count) => count + 1);
            if (summaryErrors.length > 0) return;
            const values = Object.fromEntries(fields.map((field) => [field.id, fieldValue(field.id).trim()]));
            void run(() =>
              onSubmit?.({ name: values.name ?? '', email: values.email ?? '', password, fields: values }),
            );
            return;
          }
          if (
            name.trim() === '' ||
            !EMAIL_RE.test(email.trim()) ||
            password.length < minPasswordLength ||
            (termsProp !== false && !terms)
          )
            return;
          void run(() => onSubmit?.({ name: name.trim(), email: email.trim(), password }));
        }}
      >
        {alert && <Alert tone="destructive" description={alert} />}
        {fields !== undefined && submitted && (
          // Destructive text needs an untinted surface to meet contrast in the light theme.
          <ValidationSummary errors={summaryErrors} submitCount={submitCount} className="bg-background" />
        )}
        {fields !== undefined ? (
          fields.map((field) => {
            const message = authSignUpFieldError(fieldValue(field.id), field, t, labels);
            const invalid = submitted && message !== null;
            return (
              <Field key={field.id} invalid={invalid}>
                <FieldLabel>{field.label}</FieldLabel>
                <Input
                  id={`${fieldPrefix}-field-${field.id}`}
                  type={field.type ?? 'text'}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={fieldValue(field.id)}
                  onValueChange={(value) => setFieldValues((values) => ({ ...values, [field.id]: value }))}
                />
                {field.help != null && <FieldDescription>{field.help}</FieldDescription>}
                <FieldError match={invalid}>{message}</FieldError>
              </Field>
            );
          })
        ) : (
          <>
            <Field invalid={nameInvalid}>
              <FieldLabel>{labels?.name ?? t('signUp.name')}</FieldLabel>
              <Input
                leadingIcon={User}
                autoComplete="name"
                placeholder={labels?.namePlaceholder ?? t('signUp.namePlaceholder')}
                value={name}
                onValueChange={setName}
                required
              />
              <FieldError match={nameInvalid}>{labels?.nameRequired ?? t('signUp.nameRequired')}</FieldError>
            </Field>
            <Field invalid={emailInvalid}>
              <FieldLabel>{labels?.email ?? t('signUp.email')}</FieldLabel>
              <Input
                type="email"
                leadingIcon={Mail}
                autoComplete="email"
                placeholder={labels?.emailPlaceholder ?? t('signUp.emailPlaceholder')}
                value={email}
                onValueChange={setEmail}
                required
              />
              <FieldError match={emailInvalid}>{labels?.emailInvalid ?? t('authValidation.emailInvalid')}</FieldError>
            </Field>
          </>
        )}
        <Field invalid={passwordInvalid}>
          <FieldLabel>{labels?.password ?? t('signUp.password')}</FieldLabel>
          <PasswordInput
            id={fields !== undefined ? passwordId : undefined}
            showStrength
            strength={password.length > 0 && password.length < minPasswordLength ? 0 : undefined}
            value={password}
            onValueChange={setPassword}
            required
          />
          {passwordHelp != null && (
            <FieldDescription>
              {typeof passwordHelp === 'function' ? passwordHelp(minPasswordLength) : passwordHelp}
            </FieldDescription>
          )}
          <FieldError match={passwordInvalid}>{passwordError}</FieldError>
        </Field>
        {termsProp !== false && (
          <div>
            <Checkbox
              render={fields !== undefined ? <span id={termsId} /> : undefined}
              checked={terms}
              onCheckedChange={setTerms}
              aria-invalid={termsInvalid || undefined}
              aria-describedby={termsInvalid ? termsErrorId : undefined}
              label={
                labels?.termsConsent?.(termsLink, privacyLink) ??
                translatedContent(t('signUp.termsConsent'), { terms: termsLink, privacy: privacyLink })
              }
            />
            {termsInvalid && (
              <p id={termsErrorId} className="mt-1.5 text-[12.5px] text-destructive-text">
                {termsError}
              </p>
            )}
          </div>
        )}
        <Button type="submit" size="lg" loading={busy} className="mt-2 w-full">
          {labels?.submit ?? t('signUp.submit')}
        </Button>
      </form>
      {sso != null && (
        <>
          <AuthDivider>{labels?.divider ?? t('signUp.divider')}</AuthDivider>
          {sso}
        </>
      )}
      <p className="mt-7 text-center text-[13px] text-muted-foreground">
        {labels?.signInPrompt ?? t('signUp.signInPrompt')}{' '}
        <Link
          href={signInHref}
          onClick={
            onSignIn
              ? (e: MouseEvent) => {
                  e.preventDefault();
                  onSignIn();
                }
              : undefined
          }
        >
          {labels?.signIn ?? t('signUp.signIn')}
        </Link>
      </p>
    </div>
  );
}

import { useI18n, Alert, Button, Field, FieldDescription, FieldError, FieldLabel, Input, Link, cn } from '@gntik-ai/ui';
import { translatedContent } from '../../forms/translated-content';
import { ArrowLeft, Mail, MailCheck } from '@gntik-ai/icons';
import { useImperativeHandle, useRef, useState, type MouseEvent, type ReactNode, type Ref } from 'react';
import {
  AuthHeader,
  authIdentifierError,
  authFormClass,
  useAsyncSubmit,
  type AuthIdentifierConfig,
  type AuthValidationMessages,
  type AuthFormAccessibilityProps,
  type AuthHeaderProps,
} from '../shared';

export interface ForgotPasswordFormRef {
  focus(field: 'identifier'): void;
}

export interface ForgotPasswordFormLabels extends Required<Omit<AuthValidationMessages, 'passwordRequired'>> {
  formLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  sentTitle: string;
  sentDescription: (email: string) => ReactNode;
  addressFallback: string;
  sentStatus: string;
  fallbackError: string;
  backToSignIn: string;
  resend: string;
  changeEmail: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  submit: string;
}

export interface ForgotPasswordFormProps extends AuthFormAccessibilityProps {
  labels?: Partial<ForgotPasswordFormLabels>;
  /** React 19 ref for focus after a server response; available in the request state. */
  ref?: Ref<ForgotPasswordFormRef>;
  identifier?: AuthIdentifierConfig;
  /** The kit validates before submit. Supply copy here; do not add a second inline validator. */
  messages?: AuthValidationMessages;
  /** Requests the reset link. A returned promise shows the loading state; a rejection shows in the alert. */
  onSubmit?: (email: string) => void | Promise<void>;
  error?: string | null;
  defaultEmail?: string;
  /** Start on the "sent" step (e.g. after a redirect). */
  defaultSent?: boolean;
  signInHref?: string;
  onBackToSignIn?: () => void;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  sentTitle?: ReactNode;
  sentDescription?: ReactNode;
  /** Replaces the screen-reader sent announcement; `null` hides it. */
  sentStatus?: ReactNode;
  /** Replaces both resend/change-identifier actions; `null` hides them. */
  resendActions?: ReactNode;
  /** Applies to both request and sent states. `null` omits the internal heading. */
  headingLevel?: AuthHeaderProps['headingLevel'];
  className?: string;
}

/** Request a reset link by email, then a "check your inbox" state with resend and a way back. */
export function ForgotPasswordForm({
  labels,
  identifier,
  messages,
  ref,
  fieldInvalid,
  feedbackId,
  'aria-describedby': describedBy,
  'aria-label': ariaLabelProp,
  'aria-labelledby': labelledBy,
  onSubmit,
  error: errorProp,
  defaultEmail = '',
  defaultSent = false,
  signInHref = '#',
  onBackToSignIn,
  eyebrow: eyebrowProp,
  title: titleProp,
  description: descriptionProp,
  sentTitle: sentTitleProp,
  sentDescription,
  sentStatus: sentStatusProp,
  resendActions,
  headingLevel,
  className,
}: ForgotPasswordFormProps) {
  const { t } = useI18n();
  const eyebrow = eyebrowProp === undefined ? (labels?.eyebrow ?? t('forgotPassword.eyebrow')) : eyebrowProp;
  const title = titleProp === undefined ? (labels?.title ?? t('forgotPassword.title')) : titleProp;
  const description =
    descriptionProp === undefined ? (labels?.description ?? t('forgotPassword.description')) : descriptionProp;
  const sentTitle = sentTitleProp === undefined ? (labels?.sentTitle ?? t('forgotPassword.sentTitle')) : sentTitleProp;
  const sentStatus =
    sentStatusProp === undefined ? (labels?.sentStatus ?? t('forgotPassword.sentStatus')) : sentStatusProp;
  const ariaLabel = ariaLabelProp ?? labels?.formLabel ?? t('forgotPassword.formLabel');
  const [email, setEmail] = useState(defaultEmail);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(defaultSent);
  const { loading, error, run } = useAsyncSubmit(labels?.fallbackError ?? t('forgotPassword.fallbackError'));
  const alert = errorProp ?? error;
  const identifierInput = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => identifierInput.current?.focus() }), []);
  const identifierError = authIdentifierError(email, identifier, messages, t, labels);
  const emailInvalid = submitted && identifierError !== null;

  const send = async () => {
    const ok = await run(() => onSubmit?.(email.trim()));
    if (ok) setSent(true);
  };

  const back = (
    <Link
      href={signInHref}
      tone="muted"
      className="inline-flex items-center gap-1.5 text-[13px]"
      onClick={
        onBackToSignIn
          ? (e: MouseEvent) => {
              e.preventDefault();
              onBackToSignIn();
            }
          : undefined
      }
    >
      <ArrowLeft size={14} aria-hidden className="rtl:-scale-x-100" />
      {labels?.backToSignIn ?? t('forgotPassword.backToSignIn')}
    </Link>
  );

  if (sent) {
    return (
      <div className={cn(authFormClass, className)}>
        <span className="mb-5 grid size-11 place-items-center rounded-xl bg-primary/14 text-primary-chip-text">
          <MailCheck size={20} aria-hidden />
        </span>
        <AuthHeader
          eyebrow={eyebrow}
          title={sentTitle}
          headingLevel={headingLevel}
          description={
            sentDescription === undefined
              ? (labels?.sentDescription?.(
                  email.trim() || (labels?.addressFallback ?? t('forgotPassword.addressFallback')),
                ) ??
                translatedContent(t('forgotPassword.sentDescription'), {
                  email: (
                    <span className="font-medium text-foreground">
                      {email.trim() || (labels?.addressFallback ?? t('forgotPassword.addressFallback'))}
                    </span>
                  ),
                }))
              : sentDescription
          }
        />
        {sentStatus != null && (
          <div role="status" className="sr-only">
            {sentStatus}
          </div>
        )}
        {alert && <Alert id={feedbackId} tone="destructive" description={alert} className="mb-4" />}
        {resendActions !== null && (
          <div className="flex flex-col gap-2.5">
            {resendActions === undefined ? (
              <>
                <Button variant="secondary" size="lg" loading={loading} className="w-full" onClick={() => void send()}>
                  {labels?.resend ?? t('forgotPassword.resend')}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setSent(false);
                    setSubmitted(false);
                  }}
                >
                  {labels?.changeEmail ?? t('forgotPassword.changeEmail')}
                </Button>
              </>
            ) : (
              resendActions
            )}
          </div>
        )}
        <p className="mt-7 text-center">{back}</p>
      </div>
    );
  }

  return (
    <div className={cn(authFormClass, className)}>
      <AuthHeader eyebrow={eyebrow} title={title} description={description} headingLevel={headingLevel} />
      <form
        noValidate
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (identifierError !== null) {
            identifierInput.current?.focus();
            return;
          }
          void send();
        }}
      >
        {alert && <Alert id={feedbackId} tone="destructive" description={alert} />}
        <Field invalid={emailInvalid || fieldInvalid?.identifier === true}>
          <FieldLabel>{identifier?.label ?? labels?.identifierLabel ?? t('forgotPassword.identifierLabel')}</FieldLabel>
          <Input
            ref={identifierInput}
            aria-describedby={fieldInvalid?.identifier ? feedbackId : undefined}
            type={identifier?.type ?? 'email'}
            leadingIcon={Mail}
            autoComplete={identifier?.autoComplete ?? 'email'}
            placeholder={
              identifier?.placeholder ?? labels?.identifierPlaceholder ?? t('forgotPassword.identifierPlaceholder')
            }
            minLength={identifier?.minLength}
            maxLength={identifier?.maxLength}
            value={email}
            onValueChange={setEmail}
            required
          />
          {identifier?.help != null && <FieldDescription id={identifier.helpId}>{identifier.help}</FieldDescription>}
          <FieldError role="alert" match={emailInvalid}>
            {identifierError}
          </FieldError>
        </Field>
        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          {labels?.submit ?? t('forgotPassword.submit')}
        </Button>
      </form>
      <p className="mt-7 text-center">{back}</p>
    </div>
  );
}

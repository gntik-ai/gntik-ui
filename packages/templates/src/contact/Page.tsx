import { ValidationSummary, type ValidationIssue } from '@gntik-ai/blocks';
import { CircleCheck, Clock, Mail, MapPin, Phone, Send } from '@gntik-ai/icons';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldLabel,
  Grid,
  Heading,
  Input,
  Link,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Stack,
  Text,
  Textarea,
  type MegaMenuItem,
} from '@gntik-ai/ui';
import { useId, useState, type ReactNode } from 'react';
import { contactTopics, emptyContact, offices, publicCopyright, publicFooterLinks, publicMenu, validateContact, type ContactTopic, type ContactValues, type Office } from './data';
import { PublicFrame } from './PublicFrame';

export interface ContactProps {
  brand: ReactNode;
  menu: MegaMenuItem[];
  currentHref: string;
  title: string;
  description: string;
  topics: Array<{ value: ContactTopic; label: string }>;
  offices: Office[];
  defaultValues: Partial<ContactValues>;
  /** Called with valid values; the page shows the success state once it resolves. */
  onSubmit: (values: ContactValues) => void | Promise<void>;
  footerLinks: Array<{ label: string; href: string }>;
  copyright: ReactNode;
}

const LABELS: Record<keyof ContactValues, string> = { name: 'Name', email: 'Work email', company: 'Company', topic: 'Topic', message: 'Message' };

/** Public contact page: StackedLayout + MegaMenu, a validated form with a success state, and office cards. */
export default function ContactPage(props: Partial<ContactProps>) {
  const {
    brand,
    menu = publicMenu,
    currentHref = '/contact',
    title = 'Talk to us',
    description = 'Questions about plans, billing or a technical issue? We answer within one business day.',
    topics = contactTopics,
    offices: officeList = offices,
    defaultValues,
    onSubmit,
    footerLinks = publicFooterLinks,
    copyright = publicCopyright,
  } = props;
  const [values, setValues] = useState<ContactValues>({ ...emptyContact, ...defaultValues });
  const [submitCount, setSubmitCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const ids = useId();
  const fieldId = (k: keyof ContactValues) => `${ids}-${k}`;

  const errors = submitCount > 0 ? validateContact(values) : {};
  const issues: ValidationIssue[] = (Object.keys(errors) as Array<keyof ContactValues>).map((k) => ({ fieldId: fieldId(k), label: LABELS[k], message: errors[k] ?? '' }));
  const set = <K extends keyof ContactValues>(key: K, value: ContactValues[K]) => setValues((v) => ({ ...v, [key]: value }));

  const submit = async () => {
    setSubmitCount((n) => n + 1);
    if (Object.keys(validateContact(values)).length > 0) return;
    setSending(true);
    try {
      await onSubmit?.(values);
      setSent(true);
    } finally {
      setSending(false);
    }
  };
  const reset = () => {
    setValues({ ...emptyContact, ...defaultValues });
    setSubmitCount(0);
    setSent(false);
  };

  return (
    <PublicFrame brand={brand} menu={menu} currentHref={currentHref} footerLinks={footerLinks} copyright={copyright}>
      <Stack gap={10}>
        <Stack gap={3} className="max-w-2xl">
          <Heading level={1} size="xl">
            {title}
          </Heading>
          <Text tone="muted">{description}</Text>
        </Stack>
        <Grid cols={{ base: 1, lg: 5 }} gap={8} align="start">
          <Card className="lg:col-span-3">
            <CardBody className="p-6">
              {sent ? (
                <div ref={(el) => el?.focus()} tabIndex={-1} role="status" className="flex flex-col items-start gap-3 py-6 outline-none">
                  <CircleCheck size={28} aria-hidden className="text-success-text" />
                  <Heading level={2} size="sm">
                    Message sent
                  </Heading>
                  <Text tone="muted">Thanks, {values.name.trim()}. We’ll reply to {values.email.trim()} within one business day.</Text>
                  <Button variant="secondary" onClick={reset}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form
                  noValidate
                  aria-label="Contact form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submit();
                  }}
                >
                  <Stack gap={5}>
                    <ValidationSummary errors={issues} submitCount={submitCount} />
                    <Grid cols={{ base: 1, sm: 2 }} gap={4}>
                      <Field invalid={errors.name != null}>
                        <FieldLabel required>{LABELS.name}</FieldLabel>
                        <Input id={fieldId('name')} autoComplete="name" required value={values.name} onValueChange={(v) => set('name', v)} />
                        <FieldError match={errors.name != null}>{errors.name}</FieldError>
                      </Field>
                      <Field invalid={errors.email != null}>
                        <FieldLabel required>{LABELS.email}</FieldLabel>
                        <Input id={fieldId('email')} type="email" autoComplete="email" required value={values.email} onValueChange={(v) => set('email', v)} />
                        <FieldError match={errors.email != null}>{errors.email}</FieldError>
                      </Field>
                      <Field>
                        <FieldLabel>{LABELS.company}</FieldLabel>
                        <Input id={fieldId('company')} autoComplete="organization" value={values.company} onValueChange={(v) => set('company', v)} />
                      </Field>
                      <Field invalid={errors.topic != null}>
                        <FieldLabel required>{LABELS.topic}</FieldLabel>
                        <Select
                          value={values.topic || null}
                          onValueChange={(v) => set('topic', v ?? '')}
                          items={topics.map(({ value, label }) => ({ value, label }))}
                        >
                          <SelectTrigger id={fieldId('topic')} className="w-full" placeholder="Choose a topic" />
                          <SelectContent>
                            {topics.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError match={errors.topic != null}>{errors.topic}</FieldError>
                      </Field>
                    </Grid>
                    <Field invalid={errors.message != null}>
                      <FieldLabel required>{LABELS.message}</FieldLabel>
                      <Textarea id={fieldId('message')} rows={5} required value={values.message} onValueChange={(v) => set('message', v)} />
                      <FieldError match={errors.message != null}>{errors.message}</FieldError>
                    </Field>
                    <Text variant="caption" tone="muted">
                      By sending this form you agree to our <Link href="/privacy">privacy policy</Link>.
                    </Text>
                    <div>
                      <Button type="submit" icon={Send} loading={sending}>
                        Send message
                      </Button>
                    </div>
                  </Stack>
                </form>
              )}
            </CardBody>
          </Card>
          <section aria-labelledby={`${ids}-offices`} className="lg:col-span-2">
            <Heading id={`${ids}-offices`} level={2} size="xs" className="mb-3">
              Offices
            </Heading>
            <Stack gap={3}>
              {officeList.map((o) => (
                <Card key={o.id} variant="outline">
                  <CardHeader>
                    <CardTitle as="h3">{o.city}</CardTitle>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <ul className="flex flex-col gap-1.5">
                      <li className="flex gap-2">
                        <MapPin size={14} aria-hidden className="mt-1 shrink-0" />
                        <address className="not-italic">
                          {o.address.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </address>
                      </li>
                      <li className="flex items-center gap-2">
                        <Mail size={14} aria-hidden className="shrink-0" />
                        <Link href={`mailto:${o.email}`}>{o.email}</Link>
                      </li>
                      <li className="flex items-center gap-2">
                        <Phone size={14} aria-hidden className="shrink-0" />
                        <Link href={`tel:${o.phone.replace(/\s/g, '')}`}>{o.phone}</Link>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock size={14} aria-hidden className="shrink-0" />
                        {o.hours}
                      </li>
                    </ul>
                  </CardBody>
                </Card>
              ))}
            </Stack>
          </section>
        </Grid>
      </Stack>
    </PublicFrame>
  );
}

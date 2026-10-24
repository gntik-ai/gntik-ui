import { Link, useI18n } from '@gntik-ai/ui';
import { useRef } from 'react';
import ContactPage from '../Page';

/** The first send shows a custom support link; submitting again succeeds. */
export default function CustomFailure() {
  const { t } = useI18n();
  const attempts = useRef(0);
  return (
    <ContactPage
      defaultValues={{
        name: 'Ada Example',
        email: 'ada@example.com',
        company: 'Example Ltd',
        topic: 'sales',
        message: 'We would like a demo for 40 seats.',
      }}
      submitErrorMessage={<Link href="mailto:contact@example.com">{t('error.support')}</Link>}
      onSubmit={async () => {
        if (attempts.current++ === 0) throw new Error();
      }}
    />
  );
}

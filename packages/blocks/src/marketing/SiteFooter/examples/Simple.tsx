import { I18nProvider, StackedLayout } from '@gntik-ai/ui';
import { SiteFooter } from '../SiteFooter';
import { sampleLegalLinks } from '../fixtures';

/** Logical alignment mirrors the inherited one-row layout in RTL. */
export default function Simple() {
  return (
    <I18nProvider locale="en" dir="rtl">
      <StackedLayout footer={<SiteFooter layout="simple" links={sampleLegalLinks} themeSwitcher />}>
        <div />
      </StackedLayout>
    </I18nProvider>
  );
}

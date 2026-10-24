'use client';

import {
  PrintLayout,
  ScrollArea,
  SimpleSelect,
  ThemeSwitcher,
  Tabs,
  TabsList,
  TabsTab,
  TabsIndicator,
  Slider,
  useI18n,
} from '@gntik-ai/ui';

/** Production CSP smoke-test route: only kit components, including server prehydration scripts. */
export default function CSPPage() {
  const { t } = useI18n();
  return (
    <PrintLayout aria-label={t('csp.document')}>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">{t('csp.title')}</h1>
        <ThemeSwitcher />
        <SimpleSelect
          label={t('csp.choice')}
          items={[
            { value: 'light', label: t('theme.light') },
            { value: 'dark', label: t('theme.dark') },
          ]}
        />
        <ScrollArea aria-label={t('csp.content')} className="h-40" bordered>
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i} className="p-2">
              {t('csp.content')} {i + 1}
            </p>
          ))}
        </ScrollArea>
        <Tabs defaultValue="light">
          <TabsList indicator={false} aria-label={t('theme.label')}>
            <TabsTab value="light">{t('theme.light')}</TabsTab>
            <TabsTab value="dark">{t('theme.dark')}</TabsTab>
            <TabsIndicator renderBeforeHydration />
          </TabsList>
        </Tabs>
        <Slider label={t('csp.choice')} thumbAlignment="edge" defaultValue={50} />
      </div>
    </PrintLayout>
  );
}

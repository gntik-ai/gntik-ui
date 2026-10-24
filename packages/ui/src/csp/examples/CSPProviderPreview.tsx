import { useState } from 'react';
import { CSPProvider, useCSP } from '../CSPProvider';
import { useI18n } from '../../i18n';
import { Button } from '../../components/Button';
import { ScrollArea } from '../../components/ScrollArea';
import { SimpleSelect } from '../../components/Select';
import { Slider } from '../../components/Slider';
import { Tabs, TabsList, TabsTab, TabsIndicator } from '../../components/Tabs';

function Preview() {
  const { t } = useI18n();
  const { disableStyleElements } = useCSP();
  return (
    <div className="space-y-4">
      <p role="status">{t(disableStyleElements ? 'csp.disabled' : 'csp.enabled')}</p>
      <SimpleSelect
        label={t('csp.choice')}
        items={[
          { value: 'light', label: t('theme.light') },
          { value: 'dark', label: t('theme.dark') },
        ]}
      />
      <ScrollArea aria-label={t('csp.content')} className="h-32" bordered>
        {Array.from({ length: 20 }, (_, i) => (
          <p className="p-2" key={i}>
            {t('csp.content')} {i + 1}
          </p>
        ))}
      </ScrollArea>
      <Tabs defaultValue="light">
        <TabsList aria-label={t('theme.label')} indicator={false}>
          <TabsTab value="light">{t('theme.light')}</TabsTab>
          <TabsTab value="dark">{t('theme.dark')}</TabsTab>
          <TabsIndicator renderBeforeHydration />
        </TabsList>
      </Tabs>
      <Slider label={t('csp.choice')} thumbAlignment="edge" defaultValue={50} />
    </div>
  );
}

export default function CSPProviderPreview() {
  const { nonce } = useCSP();
  const { t } = useI18n();
  const [disabled, setDisabled] = useState(false);
  return (
    <CSPProvider nonce={nonce} disableStyleElements={disabled}>
      <div className="space-y-4">
        <Button onClick={() => setDisabled(!disabled)}>{t(disabled ? 'csp.enable' : 'csp.disable')}</Button>
        <Preview />
      </div>
    </CSPProvider>
  );
}

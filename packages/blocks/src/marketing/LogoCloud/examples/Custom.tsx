import { I18nProvider, useI18n } from '@gntik-ai/ui';
import { LogoCloud } from '../LogoCloud';
import { sampleLogos } from '../fixtures';

function LocalizedClouds() {
  const { t } = useI18n();
  return (
    <>
      <LogoCloud logos={sampleLogos} logoHeight={40} className="text-foreground" />
      <LogoCloud
        logos={sampleLogos.map((logo, index) => ({ ...logo, className: index === 0 ? 'text-foreground' : undefined }))}
        caption={<span>{t('logoCloud.examples.community')}</span>}
      />
    </>
  );
}

/** Spanish captions, taller marks and both root and individual token overrides. */
export default function Custom() {
  return (
    <I18nProvider locale="es">
      <LocalizedClouds />
    </I18nProvider>
  );
}

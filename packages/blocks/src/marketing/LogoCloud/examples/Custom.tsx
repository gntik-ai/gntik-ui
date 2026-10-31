import { I18nProvider } from '@gntik-ai/ui';
import { LogoCloud } from '../LogoCloud';
import { sampleLogos } from '../fixtures';

/** Spanish caption, taller marks and both root and individual token overrides. */
export default function Custom() {
  return (
    <I18nProvider locale="es">
      <LogoCloud logos={sampleLogos} logoHeight={40} className="text-foreground" />
      <LogoCloud
        logos={sampleLogos.map((logo, index) => ({ ...logo, className: index === 0 ? 'text-foreground' : undefined }))}
        caption={<span>Our community</span>}
      />
    </I18nProvider>
  );
}

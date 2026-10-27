import { useI18n } from '../../../i18n/I18nProvider';
import { Section } from '../Section';

export default function SectionResponsivePadding() {
  const { t } = useI18n();
  return (
    <div data-responsive-example className="space-y-4">
      <Section
        variant="card"
        title={t('responsive.sectionTitle')}
        description={t('responsive.sectionDescription')}
        padding={{ base: 'sm', md: 'lg' }}
        divided
      >
        <p>{t('responsive.sectionBody')}</p>
        <p>{t('responsive.fullWidth')}</p>
      </Section>
      <Section
        variant="muted"
        title={t('responsive.overrideTitle')}
        padding={{ base: 'lg', sm: 'sm', md: 'none', lg: 'md', '2xl': 'lg' }}
      >
        <p>{t('responsive.overrideBody')}</p>
      </Section>
    </div>
  );
}

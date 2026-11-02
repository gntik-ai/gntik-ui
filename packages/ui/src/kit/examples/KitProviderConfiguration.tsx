import { useI18n } from '../../i18n/I18nProvider';
const providerTable = [
  ['theme', 'ThemeProvider'],
  ['i18n', 'I18nProvider'],
  ['density', 'DensityProvider'],
  ['link', 'LinkProvider'],
  ['tooltip | false', 'TooltipProvider'],
  ['toast | false', 'ToastProvider + Toaster'],
  ['announcer', 'LiveAnnouncer'],
  ['csp', 'CSPProvider'],
  ['portalContainer', 'PortalContainerContext'],
  ['scoped', 'ThemeProvider target + wrapper + portal host'],
] as const;

export default function KitProviderConfiguration() {
  const { t } = useI18n();
  return (
    <table className="w-full text-start text-sm text-foreground">
      <caption className="mb-3 text-start font-semibold">{t('kit.settings')}</caption>
      <thead>
        <tr>
          <th scope="col" className="text-start">
            {t('kit.prop')}
          </th>
          <th scope="col" className="text-start">
            {t('kit.provider')}
          </th>
        </tr>
      </thead>
      <tbody>
        {providerTable.map(([prop, provider]) => (
          <tr key={prop} className="border-t border-border">
            <th scope="row" className="py-2 text-start font-mono font-normal">
              {prop}
            </th>
            <td>{provider}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { ThemeScope } from '../ThemeScope';
import { useTheme } from '../ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';

function Resolved() {
  const { resolved } = useTheme();
  const { t } = useI18n();
  return <span>{t(resolved === 'high_contrast' ? 'theme.highContrast' : `theme.${resolved}`)}</span>;
}

export default function ThemeScopeNested() {
  const { t } = useI18n();
  return (
    <ThemeScope theme="light" className="space-y-3 rounded-lg bg-background p-4 text-foreground">
      <p>{t('themeScope.nested')}</p>
      <ThemeScope
        theme="dark"
        render={<section />}
        data-nested-scope
        className="rounded-lg bg-background p-4 text-foreground"
      >
        <Resolved />
      </ThemeScope>
    </ThemeScope>
  );
}

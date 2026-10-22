import { ThemeScope } from '../ThemeScope';
import { useI18n } from '../../i18n/I18nProvider';
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger } from '../../components/Select/Select';

export default function ThemeScopeLightCard() {
  const { t } = useI18n();
  const items = [{ value: 'personal', label: t('themeScope.personal') }];
  return (
    <ThemeScope theme="dark" className="rounded-lg bg-background p-6 text-foreground">
      <ThemeScope
        theme="light"
        data-scope-example
        className="space-y-3 rounded-lg border border-border bg-card p-6 text-card-foreground"
      >
        <p className="font-medium text-primary-text">{t('themeScope.title')}</p>
        <p className="text-sm text-muted-foreground">{t('themeScope.description')}</p>
        <Select defaultOpen modal={false} defaultValue="personal" items={items}>
          <SelectLabel>{t('themeScope.choice')}</SelectLabel>
          <SelectTrigger />
          <SelectContent>
            <SelectItem value="personal">{t('themeScope.personal')}</SelectItem>
          </SelectContent>
        </Select>
      </ThemeScope>
    </ThemeScope>
  );
}

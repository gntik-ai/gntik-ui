import { useState, type ReactNode } from 'react';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { ThemeScope } from '../ThemeScope';
import { useI18n } from '../../i18n/I18nProvider';
import { Button } from '../../components/Button/Button';

function Controls() {
  const { mode, resolved, setMode } = useTheme();
  const { t } = useI18n();
  const label = (theme: typeof mode) => t(theme === 'high_contrast' ? 'theme.highContrast' : `theme.${theme}`);
  return (
    <>
      <p data-testid="forced-theme">
        {label(mode)} / {label(resolved)}
      </p>
      <Button onClick={() => setMode('high_contrast')}>{t('theme.highContrast')}</Button>
    </>
  );
}

export default function ThemeProviderForced() {
  const [forced, setForced] = useState(true);
  const { t } = useI18n();
  // Isolate the docs demonstration from the catalog page's stored preference and html.
  return (
    <ThemeProvider defaultMode="dark" storageKey={null} forcedMode={forced ? 'light' : undefined} target={() => null}>
      <ThemeScopePreview>
        <Controls />
        <Button onClick={() => setForced(!forced)}>{t(forced ? 'themeScope.release' : 'themeScope.force')}</Button>
      </ThemeScopePreview>
    </ThemeProvider>
  );
}

function ThemeScopePreview({ children }: { children: ReactNode }) {
  const { resolved } = useTheme();
  return (
    <ThemeScope theme={resolved} className="space-y-3 rounded-lg bg-background p-4 text-foreground">
      {children}
    </ThemeScope>
  );
}

import { THEME_OPTIONS, ThemeProvider } from '@gntik-ai/ui';
import { AppTopbar } from '../AppTopbar';

const themeOptions = THEME_OPTIONS.slice(0, 2);
const controls = { breadcrumbs: null, environment: null, search: null, notifications: null, user: null };

export default function ThemeOptions() {
  return (
    <ThemeProvider storageKey={null} defaultMode="dark">
      <div className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">Only Light and Dark are offered in either control.</p>
        <AppTopbar {...controls} themeOptions={themeOptions} />
        <AppTopbar {...controls} theme="segmented" themeOptions={themeOptions} />
      </div>
    </ThemeProvider>
  );
}

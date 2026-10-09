import { ThemeProvider } from '@gntik-ai/ui';
import PublicHubPage from '../Page';
import { publicHubFixture } from '../data';

export default function HighContrast() {
  return (
    <ThemeProvider defaultMode="high_contrast" storageKey={null}>
      <PublicHubPage {...publicHubFixture} />
    </ThemeProvider>
  );
}

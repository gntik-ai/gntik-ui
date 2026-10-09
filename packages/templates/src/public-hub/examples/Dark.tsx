import { ThemeProvider } from '@gntik-ai/ui';
import PublicHubPage from '../Page';
import { publicHubFixture } from '../data';

export default function Dark() {
  return (
    <ThemeProvider defaultMode="dark" storageKey={null}>
      <PublicHubPage {...publicHubFixture} />
    </ThemeProvider>
  );
}

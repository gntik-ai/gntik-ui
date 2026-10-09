import { ThemeProvider } from '@gntik-ai/ui';
import PublicHubPage from '../Page';
import { publicHubFixture } from '../data';

export default function Light() {
  return (
    <ThemeProvider defaultMode="light" storageKey={null}>
      <PublicHubPage {...publicHubFixture} />
    </ThemeProvider>
  );
}

import PublicHubPage from '../Page';
import { publicHubFixture } from '../data';

export default function Loading() {
  return <PublicHubPage {...publicHubFixture} loading />;
}

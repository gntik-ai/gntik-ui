import type { Metadata } from 'next';
import { requestTime } from '../../request-time';
import { DashboardView } from './view';

export const metadata: Metadata = { title: 'Dashboard' };

/** Server Component: rendered per request, it anchors the activity timestamps to request time. */
export default async function DashboardRoute() {
  const now = await requestTime();
  return <DashboardView now={now} />;
}

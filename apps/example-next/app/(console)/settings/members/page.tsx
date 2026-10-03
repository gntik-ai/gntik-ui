import type { Metadata } from 'next';
import { requestTime } from '../../../request-time';
import { MembersView } from './view';

export const metadata: Metadata = { title: 'Members' };

/** Rendered per request: "last active" and invitation dates are anchored to request time. */
export default async function MembersRoute() {
  const now = await requestTime();
  return <MembersView now={now} />;
}

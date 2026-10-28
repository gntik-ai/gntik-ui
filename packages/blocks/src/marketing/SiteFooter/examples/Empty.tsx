import { SiteFooter } from '../SiteFooter';

/** Empty or omitted groups produce no empty navigation, list or heading. */
export default function Empty() {
  return <SiteFooter landmark columns={[]} links={[]} legalLinks={[]} social={[]} brand={null} />;
}

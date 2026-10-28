import { SiteFooter } from '../SiteFooter';
import { sampleFooterColumns, sampleLegalLinks, sampleSocialLinks } from '../fixtures';

/** A standalone public footer. Inside StackedLayout, omit landmark. */
export default function Columns() {
  return (
    <SiteFooter
      landmark
      columns={sampleFooterColumns}
      legalLinks={sampleLegalLinks}
      social={sampleSocialLinks}
      themeSwitcher
    />
  );
}

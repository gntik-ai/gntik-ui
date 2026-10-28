import { SiteFooter } from '../SiteFooter';
import { sampleFooterColumns, sampleLegalLinks, sampleSocialLinks } from '../fixtures';

export default function Centered() {
  return (
    <SiteFooter
      layout="centered"
      landmark
      links={sampleFooterColumns.flatMap((column) => column.links)}
      legalLinks={sampleLegalLinks}
      social={sampleSocialLinks}
      themeSwitcher
    />
  );
}

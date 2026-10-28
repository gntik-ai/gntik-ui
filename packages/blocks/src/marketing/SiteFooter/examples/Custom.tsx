import { I18nProvider, Link, Logo } from '@gntik-ai/ui';
import { SiteFooter } from '../SiteFooter';
import { sampleFooterColumns, sampleLegalLinks, sampleSocialLinks } from '../fixtures';

/** Caller copy and newsletter content remain under the consumer's control. */
export default function Custom() {
  return (
    <I18nProvider locale="es">
      <SiteFooter
        landmark
        headingLevel="h3"
        navLabel="Explore"
        brand={<Logo size={32} wordmark />}
        description="A workspace for your team."
        newsletter={<Link href="/subscribe">Subscribe to updates</Link>}
        columns={sampleFooterColumns.map((column) =>
          column.title === 'Resources'
            ? {
                ...column,
                links: [
                  ...column.links,
                  { label: 'External documentation', href: 'https://example.com/docs', external: true },
                ],
              }
            : column,
        )}
        legalLinks={sampleLegalLinks}
        social={sampleSocialLinks}
        copyright="© Example studio"
        themeSwitcher
        className="rounded-lg border border-border"
      />
    </I18nProvider>
  );
}

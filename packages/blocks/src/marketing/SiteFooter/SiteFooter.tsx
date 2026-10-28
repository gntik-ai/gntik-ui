import type { ComponentType, ReactNode } from 'react';
import { IconButton, Link, Logo, ThemeSwitcher, cn, useI18n } from '@gntik-ai/ui';

export interface SiteFooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface SiteFooterColumn {
  title: string;
  links: SiteFooterLink[];
}

export interface SiteFooterSocialLink {
  /** Use the network name (for example "RSS feed") as the accessible name. */
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
}

export interface SiteFooterProps {
  layout?: 'columns' | 'centered' | 'simple';
  brand?: ReactNode;
  description?: ReactNode;
  columns?: SiteFooterColumn[];
  links?: SiteFooterLink[];
  legalLinks?: SiteFooterLink[];
  social?: SiteFooterSocialLink[];
  copyright?: ReactNode;
  headingLevel?: 'h2' | 'h3';
  navLabel?: string;
  landmark?: boolean;
  /** Show the icon-only theme control at every viewport width. */
  themeSwitcher?: boolean;
  /** Content under the brand blurb in columns and centered layouts; supply your own form. */
  newsletter?: ReactNode;
  className?: string;
}

function LinkList({ links, className }: { links: SiteFooterLink[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1', className)}>
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} external={link.external} tone="muted" underline="hover">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Public-page footer. The default div fits inside a layout's existing footer landmark. */
export function SiteFooter({
  layout = 'columns',
  brand = <Logo size={24} wordmark />,
  description,
  columns = [],
  links = [],
  legalLinks = [],
  social = [],
  copyright,
  headingLevel: Heading = 'h2',
  navLabel,
  landmark = false,
  themeSwitcher = false,
  newsletter,
  className,
}: SiteFooterProps) {
  const { t } = useI18n();
  const populatedColumns = columns.filter((column) => column.links.length > 0);
  const Root = landmark ? 'footer' : 'div';
  const copyrightContent = copyright === undefined ? t('footer.copyright') : copyright;
  const centered = layout === 'centered';
  const rowNav = links.length > 0 && (
    <nav aria-label={navLabel ?? t('footer.label')}>
      <LinkList links={links} className={centered ? 'justify-center' : undefined} />
    </nav>
  );
  const legalNav = legalLinks.length > 0 && (
    <nav aria-label={t('footer.legal')}>
      <LinkList links={legalLinks} className={centered ? 'justify-center' : undefined} />
    </nav>
  );
  const socialList = social.length > 0 && (
    <ul aria-label={t('footer.social')} className={cn('flex flex-wrap gap-2', centered && 'justify-center')}>
      {social.map((link) => (
        <li key={link.href}>
          <IconButton
            icon={link.icon}
            label={link.label}
            render={<a href={link.href} />}
            role="link"
            nativeButton={false}
            size="sm"
          />
        </li>
      ))}
    </ul>
  );
  if (layout === 'simple') {
    return (
      <Root className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
        <span>{copyrightContent}</span>
        {rowNav}
        {legalNav}
        {socialList}
        {themeSwitcher && <ThemeSwitcher size="sm" showLabels={false} />}
      </Root>
    );
  }
  if (centered) {
    return (
      <Root
        className={cn(
          'flex min-w-0 flex-col items-center gap-6 px-4 py-12 text-center text-sm wrap-anywhere text-muted-foreground sm:px-6 [&>*]:max-w-full',
          className,
        )}
      >
        {brand}
        {description && <div>{description}</div>}
        {newsletter && <div>{newsletter}</div>}
        {rowNav}
        {legalNav}
        {socialList}
        <span>{copyrightContent}</span>
        {themeSwitcher && <ThemeSwitcher size="sm" showLabels={false} />}
      </Root>
    );
  }
  return (
    <Root className={cn('min-w-0 px-4 py-12 text-sm wrap-anywhere text-muted-foreground sm:px-6', className)}>
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="min-w-0 space-y-4">
          {brand}
          {description && <div>{description}</div>}
          {newsletter && <div>{newsletter}</div>}
        </div>
        {populatedColumns.length > 0 && (
          <nav aria-label={navLabel ?? t('footer.label')} className="grid min-w-0 grid-cols-2 gap-8 lg:grid-cols-4">
            {populatedColumns.map((column) => (
              <div key={column.title} className="min-w-0">
                <Heading className="mb-3 text-sm font-semibold text-foreground">{column.title}</Heading>
                <LinkList links={column.links} className="flex-col gap-y-2" />
              </div>
            ))}
          </nav>
        )}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <span>{copyrightContent}</span>
        {legalNav}
        {socialList}
        {themeSwitcher && <ThemeSwitcher size="sm" showLabels={false} />}
      </div>
    </Root>
  );
}

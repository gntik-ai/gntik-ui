import { Button, Link, Logo, MegaMenu, MobileNav, StackedLayout, ThemeSwitcher, megaMenuNavItems, type MegaMenuItem } from '@gntik-ai/ui';
import type { ReactNode } from 'react';

export interface PublicFrameProps {
  brand?: ReactNode;
  menu: MegaMenuItem[];
  currentHref?: string;
  signInHref?: string;
  getStartedHref?: string;
  footerLinks: Array<{ label: string; href: string }>;
  copyright: ReactNode;
  children: ReactNode;
}

/**
 * Public-site chrome: StackedLayout with the MegaMenu as the sub-nav row on large screens and
 * a MobileNav (fed by megaMenuNavItems) below lg.
 */
export function PublicFrame({
  brand = <Logo size={26} wordmark />,
  menu,
  currentHref,
  signInHref = '/sign-in',
  getStartedHref = '/sign-up',
  footerLinks,
  copyright,
  children,
}: PublicFrameProps) {
  return (
    <StackedLayout
      fullScreen
      width="wide"
      brand={brand}
      actions={
        <>
          <ThemeSwitcher size="sm" className="hidden md:inline-flex" />
          <Button variant="ghost" size="sm" render={<a href={signInHref} />} nativeButton={false}>
            Sign in
          </Button>
          <Button size="sm" render={<a href={getStartedHref} />} nativeButton={false}>
            Get started
          </Button>
          <MobileNav className="lg:hidden" groups={[{ items: megaMenuNavItems(menu) }]} currentHref={currentHref} title="Menu" label="Primary" side="right" />
        </>
      }
      subnav={<MegaMenu items={menu} currentHref={currentHref} label="Primary" className="hidden lg:block" />}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{copyright}</span>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} tone="muted" underline="hover">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      }
    >
      {children}
    </StackedLayout>
  );
}
